'use client';

import React from 'react';
import { DoubleSide } from 'three';

interface OutdoorSceneProps {
  dimensions: { width: number; length: number; height: number };
  wallColor?: string;
  variant?: string; // 'balcony' | 'garden' | 'outdoor'
  onGroundClick?: (e: any) => void;
  onWallClick?: (e: any) => void;
}

export default function OutdoorScene({ dimensions, wallColor = '#444444', variant = 'garden', onGroundClick, onWallClick }: OutdoorSceneProps) {
  const { width, length, height } = dimensions;
  
  const isBalcony = variant === 'balcony';

  return (
    <group>
      {/* Ground Grid Helper */}
      <gridHelper args={[Math.max(width, length) * 2, Math.max(width, length) * 4, '#555555', '#333333']} position={[0, 0.01, 0]} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow onClick={onGroundClick}>
        <planeGeometry args={[width, length]} />
        {isBalcony ? (
          <meshStandardMaterial color={wallColor} roughness={0.9} />
        ) : (
          <meshStandardMaterial color="#5a7844" roughness={0.9} /> // Brighter, more natural grass green
        )}
      </mesh>

      {/* Main Wall (House Exterior) */}
      <mesh position={[0, height / 2, -length / 2]} receiveShadow onClick={onWallClick}>
        <boxGeometry args={[width, height, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Balcony Specifics */}
      {isBalcony && (
        <>
          {/* Glass/Metal Railing Front */}
          <mesh position={[0, 1.2 / 2, length / 2]} receiveShadow castShadow>
            <boxGeometry args={[width, 1.2, 0.1]} />
            <meshStandardMaterial color="#aaaaaa" transparent opacity={0.6} roughness={0.1} metalness={0.5} />
          </mesh>
          {/* Railing Left */}
          <mesh position={[-width / 2, 1.2 / 2, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.1, 1.2, length]} />
            <meshStandardMaterial color="#aaaaaa" transparent opacity={0.6} roughness={0.1} metalness={0.5} />
          </mesh>
          {/* Railing Right */}
          <mesh position={[width / 2, 1.2 / 2, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.1, 1.2, length]} />
            <meshStandardMaterial color="#aaaaaa" transparent opacity={0.6} roughness={0.1} metalness={0.5} />
          </mesh>
        </>
      )}

      {/* Garden Specifics - Simple Bushes/Trees */}
      {!isBalcony && (
        <>
          <mesh position={[-width / 2 + 1, 1, length / 2 - 1]} castShadow receiveShadow>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#1a2e12" roughness={0.8} />
          </mesh>
          <mesh position={[width / 2 - 1, 1.5, length / 2 - 2]} castShadow receiveShadow>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshStandardMaterial color="#1a2e12" roughness={0.8} />
          </mesh>
        </>
      )}
    </group>
  );
}
