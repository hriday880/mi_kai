'use client';

import React, { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import styles from './DynamicLightImage.module.css';

// Using standard HTML overlay for loading instead of Html from drei which crashes Suspense

const DynamicShaderMaterial = ({ texture, lightColor }: { texture: THREE.Texture, lightColor: string }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uLightColor: { value: new THREE.Color(lightColor) },
  }), [texture]);

  useFrame((state) => {
    if (materialRef.current) {
      // Smoothly interpolate light color to target
      const targetColor = new THREE.Color(lightColor);
      materialRef.current.uniforms.uLightColor.value.lerp(targetColor, 0.1);

      // Track mouse position
      // Map pointer (-1 to 1) to UV space (0 to 1)
      const targetX = (state.pointer.x + 1) / 2;
      const targetY = (state.pointer.y + 1) / 2;
      
      // Smooth follow
      materialRef.current.uniforms.uMouse.value.x += (targetX - materialRef.current.uniforms.uMouse.value.x) * 0.1;
      materialRef.current.uniforms.uMouse.value.y += (targetY - materialRef.current.uniforms.uMouse.value.y) * 0.1;
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform sampler2D uTexture;
    varying vec2 vUv;
    void main() {
      vec4 texColor = texture2D(uTexture, vUv);
      gl_FragColor = vec4(texColor.rgb, 1.0);
      
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
    />
  );
};

const Scene = ({ src, lightColor, onLoad }: { src: string, lightColor: string, onLoad: () => void }) => {
  const texture = useTexture(src);
  const { viewport } = useThree();
  
  React.useEffect(() => {
    if (texture) {
      onLoad();
    }
  }, [texture, onLoad]);
  
  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height]} /> 
      <meshBasicMaterial map={texture} toneMapped={true} />
    </mesh>
  );
};

const COLORS = [
  { name: 'Gold', hex: '#d4af37' },
  { name: 'Cool White', hex: '#e0f7fa' },
  { name: 'Warm Amber', hex: '#ffb74d' },
  { name: 'Neon Purple', hex: '#b388ff' }
];

export default function DynamicLightImage({ src }: { src: string }) {
  const [lightColor, setLightColor] = useState(COLORS[0].hex);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div 
      className={styles.wrapper}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isLoading && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className={styles.spinner}></div>
          <div style={{ color: '#d4af37', fontSize: '0.8rem', marginTop: '10px', letterSpacing: '2px' }}>LOADING...</div>
        </div>
      )}
      <Canvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: isLoading ? 0 : 1, transition: 'opacity 0.8s ease' }}>
        <Suspense fallback={null}>
          <Scene src={src} lightColor={lightColor} onLoad={() => setIsLoading(false)} />
        </Suspense>
      </Canvas>
      
      {/* Color Picker UI */}
      <div className={`${styles.colorPicker} ${isHovered ? styles.colorPickerVisible : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
          <input
            type="color"
            value={lightColor}
            onChange={(e) => setLightColor(e.target.value)}
            style={{ 
              width: '24px', height: '24px', 
              padding: 0, margin: 0,
              border: '1px solid rgba(212, 175, 55, 0.5)', borderRadius: '50%', 
              cursor: 'pointer', background: 'transparent'
            }}
            aria-label="Set custom light color"
          />
          <span style={{ color: '#d4af37', fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase' }}>
            {lightColor}
          </span>
        </div>
      </div>
    </div>
  );
}
