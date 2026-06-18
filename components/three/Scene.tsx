// ══════════════════════════════════════════════════════════════
// Scene — Main React Three Fiber Canvas
// The 3D rendering container with camera, post-processing,
// and all world elements
// ══════════════════════════════════════════════════════════════

'use client';

import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import StudyRoom from './StudyRoom';
import ScreenshotCapture from './ScreenshotCapture';
import { useMemoryStore } from '@/stores/useMemoryStore';
import { SCENE, COLORS } from '@/lib/constants';

/** Detect device tier based on GPU and screen */
function useDeviceDetection() {
  const setDeviceTier = useMemoryStore((s) => s.setDeviceTier);
  const setIsMobile = useMemoryStore((s) => s.setIsMobile);

  useEffect(() => {
    const width = window.innerWidth;
    const isMobile = width < 768;
    setIsMobile(isMobile);

    if (isMobile) {
      setDeviceTier('low');
    } else if (width < 1200) {
      setDeviceTier('mid');
    } else {
      setDeviceTier('high');
    }
  }, [setDeviceTier, setIsMobile]);
}

/** Post-processing effects — bloom, vignette for cinematic feel */
function PostEffects() {
  const deviceTier = useMemoryStore((s) => s.deviceTier);

  // Skip heavy effects on low-tier devices
  if (deviceTier === 'low') return null;

  return (
    <EffectComposer disableNormalPass>
      <Bloom 
        luminanceThreshold={0.6} 
        luminanceSmoothing={0.9} 
        intensity={deviceTier === 'high' ? 1.5 : 1.0} 
        mipmapBlur 
      />
      <Vignette 
        offset={0.5} 
        darkness={0.7} 
        blendFunction={BlendFunction.NORMAL} 
      />
    </EffectComposer>
  );
}

export default function Scene() {
  useDeviceDetection();

  return (
    <div className="canvas-container" id="memory-world-canvas">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
        camera={{
          fov: SCENE.camera.fov,
          near: SCENE.camera.near,
          far: SCENE.camera.far,
          position: SCENE.camera.startPosition,
        }}
        style={{ background: COLORS.fogColor }}
      >
        <Suspense fallback={null}>
          {/* The 3D study room */}
          <StudyRoom />

          {/* Screenshot capture helper */}
          <ScreenshotCapture />

          {/* Post-processing */}
          <PostEffects />

          {/* Preload all assets */}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
