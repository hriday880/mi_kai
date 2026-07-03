'use client';

import { DoubleSide } from 'three';

interface RoomSceneProps {
  roomId: string;
  dimensions: { width: number; length: number; height: number };
  wallColor?: string;
  onFloorClick?: (e: any) => void;
  onCeilingClick?: (e: any) => void;
  onWallClick?: (e: any) => void;
}

export default function RoomScene({ roomId, dimensions, wallColor = '#eeeeee', onFloorClick, onCeilingClick, onWallClick }: RoomSceneProps) {
  const { width, length, height } = dimensions;
  
  return (
    <group>
      {/* Floor Grid Helper */}
      <gridHelper args={[Math.max(width, length) * 2, Math.max(width, length) * 4, '#555555', '#333333']} position={[0, 0.01, 0]} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow onClick={onFloorClick}>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>

      {/* Stylized Architectural Furniture */}
      {roomId === 'bedroom' && (
        <group position={[0, 0, -length/2 + 1.2]} castShadow receiveShadow>
          {/* Bed Base */}
          <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.8, 0.5, 2.0]} />
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
          </mesh>
          {/* Headboard */}
          <mesh position={[0, 0.5, -0.9]} castShadow receiveShadow>
            <boxGeometry args={[1.8, 1.0, 0.2]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.9} />
          </mesh>
        </group>
      )}

      {roomId === 'kitchen' && (
        <group position={[0, 0, 0]} castShadow receiveShadow>
          {/* Kitchen Island */}
          <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.9, 0.9]} />
            <meshStandardMaterial color="#dddddd" roughness={0.5} />
          </mesh>
        </group>
      )}

      {roomId === 'bathroom' && (
        <group position={[-width/2 + 0.4, 0, 0]} castShadow receiveShadow>
          {/* Vanity / Commode */}
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.8, 1.2]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* Back Wall */}
      <mesh position={[0, height / 2, -length / 2]} receiveShadow onClick={onWallClick}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={wallColor} side={DoubleSide} />
      </mesh>

      {/* Left Wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-width / 2, height / 2, 0]} receiveShadow onClick={onWallClick}>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color={wallColor} side={DoubleSide} />
      </mesh>

      {/* Right Wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[width / 2, height / 2, 0]} receiveShadow onClick={onWallClick}>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color={wallColor} side={DoubleSide} />
      </mesh>
    </group>
  );
}
