// ══════════════════════════════════════════════════════════════
// MemoryApp — Client Component wrapper for dynamic 3D imports
// next/dynamic with ssr:false must be used in Client Components
// ══════════════════════════════════════════════════════════════

'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import AlbumUIOverlay from '@/components/ui/AlbumUIOverlay';
import ShareOverlay from '@/components/ui/ShareOverlay';
import ReceiverHelpButton from '@/components/ui/ReceiverHelpButton';
import CaptureOverlay from '@/components/ui/CaptureOverlay';
import Dashboard from '@/components/ui/Dashboard';
import { useMemoryStore } from '@/stores/useMemoryStore';

import LoadingScreen from '@/components/ui/LoadingScreen';
import TutorialOverlay from '@/components/ui/TutorialOverlay';
import LandscapePrompt from '@/components/ui/LandscapePrompt';
import AnimeFirefliesOverlay from '@/components/ui/AnimeFirefliesOverlay';
import ButterflySwarm from '@/components/ui/ButterflySwarm';
import WatermarkOverlay from '@/components/ui/WatermarkOverlay';

const Scene = dynamic(() => import('@/components/three/Scene'), {
  ssr: false,
});

export default function MemoryApp() {
  const scene = useMemoryStore((s) => s.scene);
  const setScene = useMemoryStore((s) => s.setScene);
  const setIsReceiverMode = useMemoryStore((s) => s.setIsReceiverMode);
  const setIsExpired = useMemoryStore((s) => s.setIsExpired);
  const fetchSharedAlbum = useMemoryStore((s) => s.fetchSharedAlbum);
  const selectAlbum = useMemoryStore((s) => s.selectAlbum);
  const isPortrait = useMemoryStore((s) => s.isPortrait);

  // Force evaluation of the store in the main client bundle
  // This prevents Next.js from splitting the store into a separate chunk for the dynamic Scene
  useMemoryStore.getState();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const albumId = params.get('album_id');
    const mode = params.get('mode');

    if (albumId && mode === 'view') {
      setIsReceiverMode(true);
      fetchSharedAlbum(albumId)
        .then(() => {
          // Success: Album fetched, but we wait for user to click Enter
          // to trigger the smooth camera transition.
        })
        .catch(err => {
          if (err.message === "EXPIRED") {
            setIsExpired(true);
          }
        });
    }
  }, [fetchSharedAlbum, selectAlbum, setIsExpired, setIsReceiverMode]);

  const hideScene = scene === 'creation';

  if (isPortrait) {
    return <LandscapePrompt />;
  }

  return (
    <>
      <LandscapePrompt />
      <AnimeFirefliesOverlay />
      <ButterflySwarm />
      <WatermarkOverlay />
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
      <ShareOverlay />
      <ReceiverHelpButton />
      <CaptureOverlay />
      <AlbumUIOverlay />
      <Dashboard />
    </>
  );
}
