'use client';

import { useEffect } from 'react';
import { useMemoryStore } from '@/stores/useMemoryStore';

export default function LandscapePrompt() {
  const isPortrait = useMemoryStore(s => s.isPortrait);
  const setIsPortrait = useMemoryStore(s => s.setIsPortrait);
  const scene = useMemoryStore(s => s.scene);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if it's a mobile device by user agent or screen width
      const isMobile = window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);
      const isPortraitOrientation = window.innerHeight > window.innerWidth;
      
      setIsPortrait(isMobile && isPortraitOrientation);
    };

    window.addEventListener('resize', checkOrientation);
    // Also try to listen to orientationchange for mobile
    window.addEventListener('orientationchange', () => setTimeout(checkOrientation, 100));
    
    checkOrientation();

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Allow Portrait mode during the Album Creation (Dashboard) phase!
  if (scene === 'creation') return null;

  if (!isPortrait) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(10, 5, 15, 0.95)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#d4af37',
      fontFamily: "'Playfair Display', serif",
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{
        fontSize: '4rem',
        marginBottom: '2rem',
        animation: 'rotatePhone 2s ease-in-out infinite'
      }}>
        📱
      </div>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ffecb3' }}>Please Rotate Your Device</h2>
      <p style={{ fontSize: '1.2rem', color: '#e8d5b5', maxWidth: '300px', lineHeight: '1.6', fontFamily: 'sans-serif' }}>
        The Magic Album experience is best viewed in landscape mode. Please turn your phone sideways to continue.
      </p>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes rotatePhone {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(-90deg); }
          100% { transform: rotate(-90deg); }
        }
      `}} />
    </div>
  );
}
