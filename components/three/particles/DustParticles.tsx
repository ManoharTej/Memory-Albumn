// ══════════════════════════════════════════════════════════════
// Dust Particles — Floating golden motes in the memory room
// Uses InstancedMesh for GPU-efficient rendering of hundreds of particles
// ══════════════════════════════════════════════════════════════

'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemoryStore } from '@/stores/useMemoryStore';
import { SCENE, COLORS } from '@/lib/constants';

export default function DustParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const isMobile = useMemoryStore((s) => s.isMobile);
  const count = isMobile ? SCENE.particles.dustCountMobile : SCENE.particles.dustCount;

  // Generate initial positions and velocities
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * SCENE.room.width * 0.8,
          Math.random() * SCENE.room.height * 0.7,
          (Math.random() - 0.5) * SCENE.room.depth * 0.6,
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.001 + 0.001,
          (Math.random() - 0.5) * 0.002,
        ),
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.7,
        scale: 0.3 + Math.random() * 0.7,
        opacity: 0.2 + Math.random() * 0.5,
      });
    }
    return data;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      
      // Gentle floating motion with perlin-like wobble
      p.position.x += Math.sin(time * p.speed + p.phase) * 0.003;
      p.position.y += p.velocity.y * p.speed;
      p.position.z += Math.cos(time * p.speed * 0.7 + p.phase * 1.3) * 0.002;

      // Wrap around room bounds
      if (p.position.y > SCENE.room.height * 0.8) {
        p.position.y = -0.5;
        p.position.x = (Math.random() - 0.5) * SCENE.room.width * 0.8;
        p.position.z = (Math.random() - 0.5) * SCENE.room.depth * 0.6;
      }

      const scale = p.scale * (0.8 + 0.2 * Math.sin(time * 2 + p.phase));
      dummy.position.copy(p.position);
      dummy.scale.setScalar(scale * 0.02);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color={COLORS.dustColor}
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
