'use client';

import { useEffect, useState } from 'react';
import { useMemoryStore } from '@/stores/useMemoryStore';

export default function LandscapePrompt() {
  const setIsPortraitStore = useMemoryStore(s => s.setIsPortrait);
  const scene = useMemoryStore(s => s.scene);
  
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isPortraitOrientation, setIsPortraitOrientation] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if it's a mobile device by user agent or screen width
      const isMobile = window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);
      const isPortrait = window.innerHeight > window.innerWidth;
      
      setIsMobileDevice(isMobile);
      setIsPortraitOrientation(isPortrait);
      
      setIsPortraitStore(isMobile && isPortrait);
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => setTimeout(checkOrientation, 100));
    
    checkOrientation();

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [setIsPortraitStore]);

  // Only apply orientation locks on mobile devices
  if (!isMobileDevice) return null;

  // 1. Loading Phase: Allow both orientations
  if (scene === 'loading') return null;

  // 2. Creation Phase (Dashboard): Force Portrait
  if (scene === 'creation') {
    if (isPortraitOrientation) return null; // Correct orientation
    
    return (
      <div style={promptStyle}>
        <div style={iconStyle('rotateToPortrait 2s ease-in-out infinite')}>📱</div>
        <h2 style={titleStyle}>Please Rotate Your Device</h2>
        <p style={descStyle}>
          Crafting your story is best done in <strong>Portrait mode</strong>. Please turn your phone vertically to easily select your photos and write notes!
        </p>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes rotateToPortrait {
            0% { transform: rotate(-90deg); }
            50% { transform: rotate(0deg); }
            100% { transform: rotate(0deg); }
          }
        `}} />
      </div>
    );
  }

  // 3. 3D World (Entering, Room, etc.): Force Landscape
  if (!isPortraitOrientation) return null; // Correct orientation

  return (
    <div style={promptStyle}>
      <div style={iconStyle('rotateToLandscape 2s ease-in-out infinite')}>📱</div>
      <h2 style={titleStyle}>Please Rotate Your Device</h2>
      <p style={descStyle}>
        The Magic Album experience is best viewed in <strong>Landscape mode</strong>. Please turn your phone sideways to continue.
      </p>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes rotateToLandscape {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(-90deg); }
          100% { transform: rotate(-90deg); }
        }
      `}} />
    </div>
  );
}

const promptStyle: React.CSSProperties = {
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
};

const iconStyle = (animation: string): React.CSSProperties => ({
  fontSize: '4rem',
  marginBottom: '2rem',
  animation
});

const titleStyle: React.CSSProperties = {
  fontSize: '2rem',
  marginBottom: '1rem',
  color: '#ffecb3'
};

const descStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  color: '#e8d5b5',
  maxWidth: '300px',
  lineHeight: '1.6',
  fontFamily: 'sans-serif'
};
