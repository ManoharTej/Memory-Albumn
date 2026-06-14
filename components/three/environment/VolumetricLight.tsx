// ══════════════════════════════════════════════════════════════
// Volumetric Light — Soft cone of light cutting through dust
// Creates visible "god rays" effect using transparent cone geometry
// ══════════════════════════════════════════════════════════════

'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function VolumetricLight() {
  const cone1Ref = useRef<THREE.Mesh>(null);
  const cone2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Subtle sway for cone 1
    if (cone1Ref.current) {
      cone1Ref.current.rotation.z = Math.sin(time * 0.15) * 0.03;
      const mat = cone1Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.04 + Math.sin(time * 0.5) * 0.01;
    }

    // Counter-sway for cone 2
    if (cone2Ref.current) {
      cone2Ref.current.rotation.z = Math.sin(time * 0.12 + 1) * 0.025;
      const mat = cone2Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.03 + Math.sin(time * 0.4 + 1.5) * 0.008;
    }
  });

  return (
    <>
      {/* Primary light cone — from above-right */}
      <mesh
        ref={cone1Ref}
        position={[1.5, 4.5, -1]}
        rotation={[0.15, 0, -0.2]}
      >
        <coneGeometry args={[2.5, 6, 16, 1, true]} />
        <meshBasicMaterial
          color="#ffcc88"
          transparent
          opacity={0.04}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Secondary light cone — narrower, from above-left */}
      <mesh
        ref={cone2Ref}
        position={[-1, 4.8, -1.5]}
        rotation={[0.1, 0, 0.15]}
      >
        <coneGeometry args={[1.5, 5, 12, 1, true]} />
        <meshBasicMaterial
          color="#ffd4a0"
          transparent
          opacity={0.03}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}
