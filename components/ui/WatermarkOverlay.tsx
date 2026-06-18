'use client';

import { useMemoryStore } from '@/stores/useMemoryStore';

export default function WatermarkOverlay() {
  const isCapturing = useMemoryStore(s => s.isCapturing);

  if (isCapturing) return null;

  return (
    <div 
      className="watermark-container"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '0',
        width: '100%',
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 100, // Make sure it sits above almost everything
        opacity: 0.6,
        userSelect: 'none',
      }}
    >
      <p style={{
        fontFamily: '"Cinzel Decorative", serif',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '12px',
        letterSpacing: '2px',
        margin: 0,
        textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255,215,0,0.3)'
      }}>
        © 2026 ManoharTej. All Rights Reserved. Powered by Memory Album.
      </p>
    </div>
  );
}
