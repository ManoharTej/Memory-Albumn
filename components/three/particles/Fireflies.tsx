// ══════════════════════════════════════════════════════════════
// Fireflies — Glowing, wandering emissive sprites
// Pulse with bioluminescent glow, wander with natural movement
// ══════════════════════════════════════════════════════════════

'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemoryStore } from '@/stores/useMemoryStore';
import { SCENE, COLORS } from '@/lib/constants';

export default function Fireflies() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const isMobile = useMemoryStore((s) => s.isMobile);
  const count = isMobile ? SCENE.particles.fireflyCountMobile : SCENE.particles.fireflyCount;

  const fireflies = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * SCENE.room.width * 0.6,
          0.5 + Math.random() * (SCENE.room.height * 0.5),
          (Math.random() - 0.5) * SCENE.room.depth * 0.5,
        ),
        basePosition: new THREE.Vector3(
          (Math.random() - 0.5) * SCENE.room.width * 0.6,
          0.5 + Math.random() * (SCENE.room.height * 0.5),
          (Math.random() - 0.5) * SCENE.room.depth * 0.5,
        ),
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.5 + Math.random() * 1.5,
        wanderSpeed: 0.15 + Math.random() * 0.3,
        wanderRadius: 0.3 + Math.random() * 0.8,
        brightness: 0.6 + Math.random() * 0.4,
      });
    }
    return data;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorObj = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const f = fireflies[i];

      // Organic wandering — Lissajous-style path
      f.position.x = f.basePosition.x + Math.sin(time * f.wanderSpeed + f.phase) * f.wanderRadius;
      f.position.y = f.basePosition.y + Math.sin(time * f.wanderSpeed * 0.7 + f.phase * 1.5) * f.wanderRadius * 0.5;
      f.position.z = f.basePosition.z + Math.cos(time * f.wanderSpeed * 0.6 + f.phase * 0.8) * f.wanderRadius;

      // Pulsing glow — bioluminescent rhythm
      const pulse = Math.pow(Math.sin(time * f.pulseSpeed + f.phase) * 0.5 + 0.5, 2);
      const scale = (0.03 + pulse * 0.05) * f.brightness;

      dummy.position.copy(f.position);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Color shift: slightly warmer when brighter
      const hue = 0.28 + pulse * 0.05; // green to yellow-green
      colorObj.setHSL(hue, 0.7, 0.4 + pulse * 0.4);
      meshRef.current.setColorAt(i, colorObj);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        toneMapped={false}
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
