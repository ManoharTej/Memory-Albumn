// ══════════════════════════════════════════════════════════════
// Floating Papers — Translucent paper fragments drifting through air
// Like torn pages from old letters, gently rotating and floating
// ══════════════════════════════════════════════════════════════

'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemoryStore } from '@/stores/useMemoryStore';
import { SCENE, COLORS } from '@/lib/constants';

interface PaperData {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  phase: number;
  speed: number;
  rotSpeed: THREE.Vector3;
  scale: number;
}

export default function FloatingPapers() {
  const groupRef = useRef<THREE.Group>(null);
  const isMobile = useMemoryStore((s) => s.isMobile);
  const count = isMobile ? SCENE.particles.paperCountMobile : SCENE.particles.paperCount;

  const papers = useMemo<PaperData[]>(() => {
    const data: PaperData[] = [];
    for (let i = 0; i < count; i++) {
      data.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * SCENE.room.width * 0.5,
          1 + Math.random() * SCENE.room.height * 0.5,
          (Math.random() - 0.5) * SCENE.room.depth * 0.4,
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ),
        phase: Math.random() * Math.PI * 2,
        speed: 0.1 + Math.random() * 0.2,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.15,
        ),
        scale: 0.08 + Math.random() * 0.12,
      });
    }
    return data;
  }, [count]);

  // Shared geometry and materials
  const geometry = useMemo(() => {
    // Slightly irregular paper shape
    const shape = new THREE.Shape();
    shape.moveTo(-0.5, -0.7);
    shape.lineTo(0.5, -0.68);
    shape.lineTo(0.48, 0.7);
    shape.lineTo(-0.48, 0.72);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    groupRef.current.children.forEach((child, i) => {
      if (i >= papers.length) return;
      const p = papers[i];
      const mesh = child as THREE.Mesh;

      // Gentle floating — leaf-like falling pattern
      mesh.position.x = p.position.x + Math.sin(time * p.speed + p.phase) * 0.5;
      mesh.position.y = p.position.y + Math.sin(time * p.speed * 0.5 + p.phase) * 0.3;
      mesh.position.z = p.position.z + Math.cos(time * p.speed * 0.3 + p.phase * 1.2) * 0.3;

      // Slow tumbling rotation
      mesh.rotation.x = p.rotation.x + time * p.rotSpeed.x;
      mesh.rotation.y = p.rotation.y + time * p.rotSpeed.y;
      mesh.rotation.z = p.rotation.z + time * p.rotSpeed.z;
    });
  });

  return (
    <group ref={groupRef}>
      {papers.map((p, i) => (
        <mesh
          key={i}
          geometry={geometry}
          position={p.position}
          rotation={p.rotation}
          scale={p.scale}
        >
          <meshStandardMaterial
            color={COLORS.paperColor}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
            roughness={0.9}
            metalness={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
