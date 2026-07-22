'use client';

import React, { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Html, useProgress } from '@react-three/drei';
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
    uniform vec2 uMouse;
    uniform vec3 uLightColor;
    
    varying vec2 vUv;

    float luminance(vec3 color) {
      return dot(color, vec3(0.299, 0.587, 0.114));
    }

    void main() {
      vec4 texColor = texture2D(uTexture, vUv);
      
      // Sobel-like filter for pseudo-normals based on image brightness
      float texelSize = 1.0 / 1024.0;
      float l = luminance(texture2D(uTexture, vUv + vec2(-texelSize, 0.0)).rgb);
      float r = luminance(texture2D(uTexture, vUv + vec2(texelSize, 0.0)).rgb);
      float d = luminance(texture2D(uTexture, vUv + vec2(0.0, -texelSize)).rgb);
      float u = luminance(texture2D(uTexture, vUv + vec2(0.0, texelSize)).rgb);
      
      // Construct normal vector from gradients
      vec3 normal = normalize(vec3((l - r) * 1.5, (d - u) * 1.5, 0.4));
      
      // Light properties
      vec3 lightPos = vec3(uMouse.x, uMouse.y, 0.3); // Light floats slightly above image
      vec3 surfacePos = vec3(vUv.x, vUv.y, 0.0);
      vec3 lightDir = normalize(lightPos - surfacePos);
      
      // Calculate distance for light attenuation (falloff)
      float dist = distance(lightPos.xy, surfacePos.xy);
      float attenuation = smoothstep(0.8, 0.0, dist);
      
      // Diffuse lighting
      float diff = max(dot(normal, lightDir), 0.0);
      
      // Specular highlight
      vec3 viewDir = vec3(0.0, 0.0, 1.0);
      vec3 reflectDir = reflect(-lightDir, normal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
      
      // Base ambient illumination
      vec3 ambient = texColor.rgb * 0.4;
      
      // Final color = ambient + (diffuse + specular) * lightColor * attenuation
      vec3 lighting = (texColor.rgb * diff * 1.5 + spec * 0.8) * uLightColor * attenuation;
      vec3 finalColor = ambient + lighting;
      
      gl_FragColor = vec4(finalColor, texColor.a);
      
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

const Scene = ({ src, lightColor }: { src: string, lightColor: string }) => {
  const texture = useTexture(src);
  const { viewport } = useThree();
  
  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height]} /> 
      <DynamicShaderMaterial texture={texture} lightColor={lightColor} />
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
  const { progress, active } = useProgress();
  const isLoading = active || progress < 100;
  
  return (
    <div 
      className={styles.wrapper}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isLoading && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className={styles.spinner}></div>
          <div style={{ color: '#d4af37', fontSize: '0.6rem', marginTop: '10px', letterSpacing: '2px' }}>
            {Math.round(progress)}%
          </div>
        </div>
      )}
      <Canvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease' }}>
        <Suspense fallback={null}>
          <Scene src={src} lightColor={lightColor} />
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
