// ══════════════════════════════════════════════════════════════
// MemoryApp — Client Component wrapper for dynamic 3D imports
// next/dynamic with ssr:false must be used in Client Components
// ══════════════════════════════════════════════════════════════

'use client';

import dynamic from 'next/dynamic';
import AlbumUIOverlay from '@/components/ui/AlbumUIOverlay';
import Dashboard from '@/components/ui/Dashboard';
import { useMemoryStore } from '@/stores/useMemoryStore';

import LoadingScreen from '@/components/ui/LoadingScreen';
import TutorialOverlay from '@/components/ui/TutorialOverlay';
import LandscapePrompt from '@/components/ui/LandscapePrompt';
import AnimeFirefliesOverlay from '@/components/ui/AnimeFirefliesOverlay';

const Scene = dynamic(() => import('@/components/three/Scene'), {
  ssr: false,
});

export default function MemoryApp() {
  const scene = useMemoryStore((s) => s.scene);
  // Force evaluation of the store in the main client bundle
  // This prevents Next.js from splitting the store into a separate chunk for the dynamic Scene
  useMemoryStore.getState();

  const hideScene = scene === 'creation';

  return (
    <>
      <LandscapePrompt />
      <AnimeFirefliesOverlay />
      {/* 3D World */}
      <div style={{ 
        position: 'fixed', inset: 0, 
        opacity: hideScene ? 0 : 1, 
        pointerEvents: hideScene ? 'none' : 'auto',
        transition: 'opacity 0.5s ease',
        zIndex: 1
      }}>
        <Scene />
      </div>
      
      {/* 2D Interface Overlays */}
      <LoadingScreen />
      {scene === 'tutorial' && <TutorialOverlay />}
      <AlbumUIOverlay />
      <Dashboard />
    </>
  );
}
