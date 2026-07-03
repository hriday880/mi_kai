'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LuminaireGhostProps {
  position: [number, number, number];
  wattage: number;
  colorTemp: number; // in Kelvin, simplified for now
  beamAngle: number; // in degrees
  reflectorColor?: string;
  selected?: boolean;
  castShadow?: boolean;
  onClick?: (e: any) => void;
}

// Very simple approximation of Kelvin to Hex color
function kelvinToColor(kelvin: number) {
  // 3000K -> Warm white, 4000K -> Neutral, 6000K -> Cool
  if (kelvin <= 3000) return '#ffddaa';
  if (kelvin <= 4000) return '#ffeedd';
  if (kelvin <= 5000) return '#ffffff';
  return '#ddddff';
}

export default function LuminaireGhost({ 
  position, 
  wattage, 
  colorTemp, 
  beamAngle,
  reflectorColor = '#111111',
  selected,
  castShadow = true,
  onClick
}: LuminaireGhostProps) {
  
  const color = kelvinToColor(colorTemp);
  const angleRad = (beamAngle / 2) * (Math.PI / 180);
  
  // Base render intensity on wattage. (Very rough scaling for WebGL aesthetics)
  const renderIntensity = Math.max(1, wattage * 0.8);

  return (
    <group position={position} onClick={onClick}>
      {/* Visual representation of the fixture */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
        <meshStandardMaterial 
          color="#222222" 
          emissive={color}
          emissiveIntensity={selected ? 2.0 : 0.8}
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      
      {/* Light source pointing downwards */}
      <spotLight
        userData={{ isPlacedLight: true, renderIntensity: renderIntensity }}
        position={[0, -0.05, 0]}
        intensity={renderIntensity}
        angle={angleRad}
        penumbra={0.5}
        color={color}
        castShadow={castShadow}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      >
        <object3D position={[0, -1, 0]} attach="target" />
      </spotLight>
    </group>
  );
}
