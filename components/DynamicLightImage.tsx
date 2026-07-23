'use client';

import React, { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import styles from './DynamicLightImage.module.css';

// Using standard HTML overlay for loading instead of Html from drei which crashes Suspense

const Scene = ({ src, lightColor, onLoad }: { src: string, lightColor: string, onLoad: () => void }) => {
  const texture = useTexture(src);
  const { viewport } = useThree();
  const lightRef = useRef<THREE.PointLight>(null);
  const colorRef = useRef(new THREE.Color(lightColor));
  
  React.useEffect(() => {
    if (texture) {
      onLoad();
    }
  }, [texture, onLoad]);

  useFrame((state) => {
    if (lightRef.current) {
      // Smoothly interpolate light color
      colorRef.current.set(lightColor);
      lightRef.current.color.lerp(colorRef.current, 0.1);

      // Map pointer to viewport coordinates for the light
      const targetX = (state.pointer.x * viewport.width) / 2;
      const targetY = (state.pointer.y * viewport.height) / 2;
      
      // Smooth follow
      lightRef.current.position.x += (targetX - lightRef.current.position.x) * 0.1;
      lightRef.current.position.y += (targetY - lightRef.current.position.y) * 0.1;
    }
  });
  
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight 
        ref={lightRef} 
        color={lightColor} 
        intensity={2.5} 
        distance={viewport.width * 1.5} 
        position={[0, 0, 0.8]} 
        decay={2}
      />
      <mesh>
        <planeGeometry args={[viewport.width, viewport.height, 64, 64]} /> 
        <meshStandardMaterial 
          map={texture} 
          bumpMap={texture} 
          bumpScale={0.015} 
          roughness={0.7} 
          metalness={0.2} 
        />
      </mesh>
    </>
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
