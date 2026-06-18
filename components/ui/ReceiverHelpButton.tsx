'use client';

import { useMemoryStore } from '@/stores/useMemoryStore';

export default function ReceiverHelpButton() {
  const isReceiverMode = useMemoryStore((s) => s.isReceiverMode);
  const isCapturing = useMemoryStore((s) => s.isCapturing);
  const setScene = useMemoryStore((s) => s.setScene);

  // Only show for receivers, and hide during capture
  if (!isReceiverMode || isCapturing) return null;

  return (
    <>
      <button
        onClick={() => setScene('tutorial')}
        style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          zIndex: 40,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(212,175,55,0.4)',
          borderRadius: '20px',
          padding: '8px 18px',
          color: '#d4af37',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          animation: 'pulseHelp 2s infinite',
          boxShadow: '0 0 15px rgba(212,175,55,0.2)',
          pointerEvents: 'auto',
          letterSpacing: '1px'
        }}
      >
        Tutorial
      </button>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulseHelp {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212,175,55, 0.4); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(212,175,55, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212,175,55, 0); }
        }
      `}} />
    </>
  );
}
