'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import styles from './IntroAnimation.module.css';
import type * as THREE from 'three';

interface SceneData {
  THREE: typeof THREE;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  boxGroup: THREE.Group;
  lidPivot: THREE.Group;
  innerLight: THREE.PointLight;
  glowSprite: THREE.Sprite;
  animating: boolean;
  cleanup: () => void;
}

/*
 * THREE.JS 3D BOX — Intro Gate Animation
 * 
 * Architecture:
 *   - Three.js scene with a textured cuboid (16×16×6 cm → 3.2×3.2×1.2 units)
 *   - The top face is a separate mesh parented to a pivot at the back edge
 *   - On "Enter", the lid rotates open, golden light ignites, camera dives inside
 *   - Falls back gracefully if WebGL isn't available
 */

export default function IntroAnimation() {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<'loading' | 'ready' | 'animating' | 'done'>('loading');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const topHalfRef = useRef<HTMLDivElement>(null);
  const bottomHalfRef = useRef<HTMLDivElement>(null);
  const sceneDataRef = useRef<SceneData | null>(null);
  const rafRef = useRef<number | null>(null);

  // ── Initialize Three.js scene ──────────────────────────────
  useEffect(() => {
    const played = sessionStorage.getItem('mikai-intro-played');
    if (played === 'true') {
      setPhase('done');
      return;
    }

    let disposed = false;

    const initScene = async () => {
      const THREE = await import('three');

      const canvas = canvasRef.current;
      if (!canvas || disposed) return;

      // ─ Renderer
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.9;

      // ─ Scene & Camera
      const getCameraZ = (width: number) => {
        if (width >= 1024) return 5.5;
        // On smaller screens, move camera back so the box appears smaller.
        // E.g., at 375px width, z becomes ~8.5
        const t = Math.max(0, (1024 - width) / (1024 - 375));
        return 5.5 + t * 3.0;
      };

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 1.8, getCameraZ(window.innerWidth));
      camera.lookAt(0, 0, 0);

      // ─ Lighting
      const ambient = new THREE.AmbientLight(0x222222, 0.5);
      scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0xfff5e0, 0.8);
      keyLight.position.set(3, 5, 4);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xd4af37, 0.3);
      rimLight.position.set(-3, 2, -2);
      scene.add(rimLight);

      // ─ Box dimensions (16×16×6 cm → scaled)
      const W = 3.2;   // width  (16cm)
      const D = 3.2;   // depth  (16cm)
      const H = 1.2;   // height (6cm)
      const T = 0.1;   // thickness (0.5cm)

      // ─ Load textures
      const manager = new THREE.LoadingManager();
      manager.onLoad = () => {
        setPhase('ready');
      };
      const loader = new THREE.TextureLoader(manager);
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      const loadTex = (path: string) => {
        const tex = loader.load(basePath + path);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      };

      const texFront  = loadTex('/box/face_1.png');
      const texBack   = loadTex('/box/face_2.png');
      const texRight  = loadTex('/box/face_3.png');
      const texLeft   = loadTex('/box/face_4.png');
      const texBottom = loadTex('/box/face_5.png');
      const texTop    = loadTex('/box/face_0.png');

      // ─ Materials
      const matSide = (tex: THREE.Texture) => new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.6,
        metalness: 0.15,
      });
      const matEdge = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.9,
        metalness: 0.1,
      });

      // Helper to create a thick wall with texture on the FRONT (+Z) face
      // Materials array: [right(0), left(1), top(2), bottom(3), front(4), back(5)]
      const createWall = (width: number, height: number, tex: THREE.Texture, rotY: number, posX: number, posZ: number) => {
        const geo = new THREE.BoxGeometry(width, height, T);
        const mats = [matEdge, matEdge, matEdge, matEdge, matSide(tex), matEdge];
        const mesh = new THREE.Mesh(geo, mats);
        mesh.rotation.y = rotY;
        mesh.position.set(posX, 0, posZ);
        return mesh;
      };

      // ─ Build the box body (4 walls + floor)
      const boxGroup = new THREE.Group();

      // Front wall
      const front = createWall(W, H, texFront, 0, 0, D / 2 - T / 2);
      // Back wall
      const back = createWall(W, H, texBack, Math.PI, 0, -D / 2 + T / 2);
      // Right wall (fits between front and back)
      const right = createWall(D - 2 * T, H, texRight, Math.PI / 2, W / 2 - T / 2, 0);
      // Left wall
      const left = createWall(D - 2 * T, H, texLeft, -Math.PI / 2, -W / 2 + T / 2, 0);

      // Bottom floor
      const bottomGeo = new THREE.BoxGeometry(W, T, D);
      const bottomMats = [matEdge, matEdge, matEdge, matSide(texBottom), matEdge, matEdge]; // texture on bottom (3)
      const bottom = new THREE.Mesh(bottomGeo, bottomMats);
      bottom.position.set(0, -H / 2 + T / 2, 0);

      boxGroup.add(front, back, right, left, bottom);

      // ─ Top lid with hinge pivot
      const lidPivot = new THREE.Group();
      // Pivot at the back-top edge of the back wall
      lidPivot.position.set(0, H / 2, -D / 2);

      const topGeo = new THREE.BoxGeometry(W, T, D);
      const topMats = [matEdge, matEdge, matSide(texTop), matEdge, matEdge, matEdge]; // texture on top (2)
      const topMesh = new THREE.Mesh(topGeo, topMats);
      // Offset so the lid's back-bottom edge is exactly at the pivot (0,0,0)
      topMesh.position.set(0, T / 2, D / 2);

      lidPivot.add(topMesh);
      boxGroup.add(lidPivot);

      // ─ Golden light inside the box (hidden initially)
      const innerLight = new THREE.PointLight(0xd4af37, 0, 8);
      innerLight.position.set(0, 0, 0);
      boxGroup.add(innerLight);

      // Golden glow sprite
      const glowTex = (() => {
        const size = 128;
        const cvs = document.createElement('canvas');
        cvs.width = size;
        cvs.height = size;
        const ctx = cvs.getContext('2d')!;
        const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, 'rgba(255, 240, 200, 1)');
        grad.addColorStop(0.3, 'rgba(212, 175, 55, 0.8)');
        grad.addColorStop(0.7, 'rgba(212, 175, 55, 0.2)');
        grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        const t = new THREE.CanvasTexture(cvs);
        return t;
      })();

      const glowSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
      );
      glowSprite.scale.set(4, 4, 1);
      glowSprite.position.set(0, 0.3, 0);
      boxGroup.add(glowSprite);

      // ─ Tilt the whole box
      boxGroup.rotation.x = 0.45; // tilt top toward user
      boxGroup.rotation.y = 0.4;

      scene.add(boxGroup);

      // ─ Mouse tracking for interactive tilt
      const mouse = { x: 0, y: 0 };
      const onMouseMove = (e: MouseEvent) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('mousemove', onMouseMove);

      // ─ Resize handler
      const onResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        if (!sceneDataRef.current?.animating) {
          camera.position.z = getCameraZ(w);
        }
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      // ─ Animation loop
      const animate = () => {
        if (disposed) return;

        // Gentle interactive tilt (only in 'ready' phase)
        if (!sceneDataRef.current?.animating) {
          boxGroup.rotation.y += (0.4 + mouse.x * 0.3 - boxGroup.rotation.y) * 0.03;
          boxGroup.rotation.x += (0.45 - mouse.y * 0.15 - boxGroup.rotation.x) * 0.03;
        }

        renderer.render(scene, camera);
        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);

      // Store references for the animation
      sceneDataRef.current = {
        THREE,
        renderer,
        scene,
        camera,
        boxGroup,
        lidPivot,
        innerLight,
        glowSprite,
        animating: false,
        cleanup: () => {
          disposed = true;
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('resize', onResize);
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          renderer.dispose();
          scene.clear();
        },
      };

      // setPhase('ready') is now handled by the LoadingManager
    };

    initScene();

    return () => {
      if (sceneDataRef.current?.cleanup) {
        sceneDataRef.current.cleanup();
      }
    };
  }, []);

  // ── The big reveal animation ───────────────────────────────
  const runAnimation = useCallback(async () => {
    const data = sceneDataRef.current;
    if (!data) return;

    const gsapModule = await import('gsap');
    const gsap = gsapModule.default || gsapModule;

    data.animating = true;

    const { boxGroup, lidPivot, innerLight, glowSprite, camera } = data;
    const topHalf = topHalfRef.current;
    const bottomHalf = bottomHalfRef.current;
    const intro = introRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('mikai-intro-played', 'true');
        if (data.cleanup) data.cleanup();
        setPhase('done');
      },
    });

    // 1 ─ Center the box (face it head-on, tilt down to see top)
    tl.to(boxGroup.rotation, {
      x: 0.8,
      y: 0,
      duration: 1.0,
      ease: 'power2.inOut',
    })

    // 2 ─ Open the lid (rotate around the back edge pivot)
    .to(lidPivot.rotation, {
      x: -2.2,   // ~126 degrees open (past vertical)
      duration: 1.6,
      ease: 'power2.inOut',
    })
    // Ignite inner golden light
    .to(innerLight, {
      intensity: 5,
      duration: 1.2,
      ease: 'power2.in',
    }, '-=1.2')
    .to(glowSprite.material, {
      opacity: 1,
      duration: 1.0,
      ease: 'power2.in',
    }, '-=1.0')

    // 3 ─ Dive camera INTO the box
    .to(camera.position, {
      x: 0,
      y: 0.3,
      z: 0.5,
      duration: 2.0,
      ease: 'power2.in',
      onUpdate: () => {
        camera.lookAt(0, 0, 0);
      },
    }, '-=0.5')
    .to(innerLight, {
      intensity: 20,
      duration: 1.5,
      ease: 'power2.in',
    }, '-=1.5')

    // 4 ─ White out the canvas
    .to(canvasRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.in',
    }, '-=0.8')

    // 5 ─ Split the background and reveal
    .to(topHalf, { yPercent: -100, duration: 1.0, ease: 'power3.inOut' }, '-=0.5')
    .to(bottomHalf, { yPercent: 100, duration: 1.0, ease: 'power3.inOut' }, '-=1.0')
    .to(intro, { opacity: 0, duration: 0.1 });

  }, []);

  const handleEnter = useCallback(() => {
    if (phase !== 'ready') return;
    setPhase('animating');

    // Fade out the text/button
    const content = document.querySelector(`.${styles.uiContent}`);
    if (content) {
      (content as HTMLElement).style.transition = 'opacity 0.5s ease';
      (content as HTMLElement).style.opacity = '0';
    }

    runAnimation();
  }, [phase, runAnimation]);

  if (phase === 'done') return null;

  return (
    <div ref={introRef} className={styles.intro}>
      <div ref={topHalfRef} className={styles.halfScreenTop} />
      <div ref={bottomHalfRef} className={styles.halfScreenBottom} />

      {/* Three.js canvas */}
      <canvas
        ref={canvasRef}
        className={styles.canvas}
      />

      {phase === 'loading' && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <div className={styles.loadingText}>LOADING THE EXPERIENCE...</div>
        </div>
      )}

      {/* UI overlay */}
      <div className={`${styles.uiContent} ${phase === 'ready' ? styles.uiReady : ''}`}>
        <p className={styles.tagline}>
          {t('intro.subtitle')}
        </p>

        <button
          className={styles.cta}
          onClick={handleEnter}
          type="button"
          disabled={phase !== 'ready'}
        >
          <span className={styles.ctaText}>{t('intro.unveil')}</span>
          <span className={styles.ctaShimmer} />
          <span className={styles.ctaBorder} />
        </button>
      </div>
    </div>
  );
}
