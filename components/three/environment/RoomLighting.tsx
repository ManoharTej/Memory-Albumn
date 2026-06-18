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
    const baseIntensity = 4.0; // Cranked up for maximum warmth and visibility
    const flicker1 = Math.sin(time * 12) * 0.15;
    const flicker2 = Math.sin(time * 24) * 0.08;
    const flicker3 = Math.sin(time * 3) * 0.2;
    candleLightRef.current.intensity = baseIntensity + flicker1 + flicker2 + flicker3;
  });

  return (
    <group>
      {/* Soft ambient moonlight fill - INCREASED to brighten the shadows */}
      <ambientLight intensity={0.4} color="#a0b0d0" />

      {/* Main warm fill light from the room - INCREASED to brighten the book */}
      <pointLight 
        position={[0, 6, 3]} 
        intensity={2.0} 
        color={COLORS.roomWallWarm} 
        distance={25}
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

      {/* The Candle Light (Magical warm glow emitting from the new candle position) */}
      <pointLight
        ref={candleLightRef}
        position={[1.8, 2.2, -0.2]} // Moved directly above the new candle position!
        color={COLORS.candleGlow}
        intensity={4.0}
        distance={15}
        decay={1.5}
        castShadow
        shadow-bias={-0.001}
      />
    </group>
  );
}
