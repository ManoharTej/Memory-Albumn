'use client';

import { useMemoryStore } from '@/stores/useMemoryStore';

export default function ReceiverHelpButton() {
  const isReceiverMode = useMemoryStore((s) => s.isReceiverMode);
  const isCapturing = useMemoryStore((s) => s.isCapturing);
  const setScene = useMemoryStore((s) => s.setScene);
  const letterPhase = useMemoryStore((s) => s.letterPhase);

  const isMobile = useMemoryStore((s) => s.isMobile);

  // Only show for receivers, and hide during capture
  if (!isReceiverMode || isCapturing) return null;

  // Unlock create the moment they open the envelope
  const isCreateMode = letterPhase === 'open' || letterPhase === 'reading';

  const handleClick = () => {
    if (isCreateMode) {
      setScene('creation');
    } else {
      setScene('tutorial');
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        style={{
          position: 'fixed',
          top: isMobile ? '1rem' : '2rem',
          right: isMobile ? '1rem' : '2rem',
          zIndex: 40,
          background: isCreateMode ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.1)',
          border: `1px solid ${isCreateMode ? '#d4af37' : 'rgba(212,175,55,0.4)'}`,
          borderRadius: '20px',
          padding: isMobile ? '6px 12px' : '8px 18px',
          color: '#d4af37',
          fontSize: isMobile ? '0.7rem' : '0.9rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          animation: isCreateMode ? 'pulseCreate 1.5s infinite' : 'pulseHelp 2s infinite',
          boxShadow: isCreateMode ? '0 0 20px rgba(212,175,55,0.5)' : '0 0 15px rgba(212,175,55,0.2)',
          pointerEvents: 'auto',
          letterSpacing: '1px',
          transition: 'all 0.4s ease',
        }}
      >
        {isCreateMode ? '✨ Create Your Own' : 'Tutorial'}
      </button>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulseHelp {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212,175,55, 0.4); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(212,175,55, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212,175,55, 0); }
        }
        @keyframes pulseCreate {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212,175,55, 0.6); }
          70% { transform: scale(1.08); box-shadow: 0 0 0 14px rgba(212,175,55, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212,175,55, 0); }
        }
      `}} />
    </>
  );
}
