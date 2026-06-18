'use client';

// Lives inside the R3F Canvas so it has access to the gl renderer
import { useThree, useFrame } from '@react-three/fiber';
import { useMemoryStore } from '@/stores/useMemoryStore';
import { useRef } from 'react';

export default function ScreenshotCapture() {
  const { gl } = useThree();
  const didCapture = useRef(false);

  useFrame(() => {
    const { screenshotRequested, screenshotCallback, clearScreenshotRequest } =
      useMemoryStore.getState();

    if (screenshotRequested && screenshotCallback && !didCapture.current) {
      didCapture.current = true;
      // Wait 1 extra frame so postprocessing has flushed to the canvas
      requestAnimationFrame(() => {
        const url = gl.domElement.toDataURL('image/png', 1.0);
        screenshotCallback(url);
        clearScreenshotRequest();
        didCapture.current = false;
      });
    }
  });

  return null;
}
