// ══════════════════════════════════════════════════════════════
// Room Lighting — Warm, atmospheric lighting setup
// Creates the cozy, Ghibli-inspired ambiance with multiple light sources
// ══════════════════════════════════════════════════════════════

'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '@/lib/constants';

export default function RoomLighting() {
  const candleLightRef = useRef<THREE.PointLight>(null);

  // Organic candle flicker using layered sine waves
  useFrame((state) => {
    if (!candleLightRef.current) return;
    const time = state.clock.elapsedTime;
    const baseIntensity = 1.2;
    const flicker1 = Math.sin(time * 12) * 0.1;
    const flicker2 = Math.sin(time * 24) * 0.05;
    const flicker3 = Math.sin(time * 3) * 0.15;
    candleLightRef.current.intensity = baseIntensity + flicker1 + flicker2 + flicker3;
  });

  return (
    <group>
      {/* Soft ambient moonlight fill */}
      <ambientLight intensity={0.1} color="#a0b0d0" />

      {/* Main warm fill light from the room */}
      <pointLight 
        position={[0, 5, 2]} 
        intensity={0.8} 
        color={COLORS.roomWallWarm} 
        distance={20}
        decay={1.5}
      />

      {/* Cool rim light from behind to separate the shelf from the wall */}
      <pointLight 
        position={[-3, 3, -4]} 
        intensity={1.5} 
        color="#8aa1ff" 
        distance={15}
        decay={2}
      />

      {/* The Candle Light (Magical warm glow emitting from the shelf) */}
      <pointLight
        ref={candleLightRef}
        position={[2.2, 1.6, -0.9]}
        color={COLORS.candleGlow}
        intensity={1.2}
        distance={8}
        decay={2}
        castShadow
        shadow-bias={-0.001}
      />
    </group>
  );
}
