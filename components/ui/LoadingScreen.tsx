// ══════════════════════════════════════════════════════════════
// Loading Screen — Crazy Cinematic Animation
// ══════════════════════════════════════════════════════════════

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useMemoryStore } from '@/stores/useMemoryStore';
import anime from 'animejs';

// Open book SVG that flaps its pages
const FlappingBookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36" style={{ overflow: 'visible' }}>
    <path className="left-wing" d="M12 6.5C9 4.5 6 4.5 4 4.5v13c2 0 5 0 8 2" style={{ transformOrigin: '12px 6.5px' }} />
    <path className="right-wing" d="M12 6.5C15 4.5 18 4.5 20 4.5v13c-2 0-5 0-8 2" style={{ transformOrigin: '12px 6.5px' }} />
    <path d="M12 6.5v13" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Large Polaroid frame for a single letter
const PolaroidLetter = ({ char }: { char: string }) => (
  <div className="polaroid-letter" style={{
    background: '#f8f8f8',
    padding: '12px 12px 35px 12px',
    boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
    margin: '0 -10px',
    opacity: 0,
    // Transforms are applied entirely via Anime.js to prevent hydration errors
  }}>
    <div style={{
      width: '80px', height: '80px',
      background: 'linear-gradient(135deg, #2a081a, #1a0b1c)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#ffb6c1', fontSize: '3rem', fontFamily: 'sans-serif', fontWeight: '900',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      {char}
    </div>
  </div>
);

export default function LoadingScreen() {
  const scene = useMemoryStore((s) => s.scene);
  const setScene = useMemoryStore((s) => s.setScene);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait 100ms for React Hydration to finish so the animation doesn't drop frames
    const timer = setTimeout(() => {
      // Master Animation Timeline
      const tl = anime.timeline({
        easing: 'easeOutExpo',
        complete: () => setReady(true)
      });

      // 1. STARBURST BOOKS (60 Books in Concentric Rings)
      tl.add({
        targets: '.flying-book',
        translateX: function(el: HTMLElement, i: number) {
          let r = 0, numInRing = 1, indexInRing = 0;
          if (i < 12) { r = 250; numInRing = 12; indexInRing = i; }
          else if (i < 32) { r = 450; numInRing = 20; indexInRing = i - 12; }
          else { r = 750; numInRing = 28; indexInRing = i - 32; }
          const angle = (indexInRing / numInRing) * Math.PI * 2;
          // Explicit [start, end] prevents skipping!
          return [0, Math.cos(angle) * r];
        },
        translateY: function(el: HTMLElement, i: number) {
          let r = 0, numInRing = 1, indexInRing = 0;
          if (i < 12) { r = 250; numInRing = 12; indexInRing = i; }
          else if (i < 32) { r = 450; numInRing = 20; indexInRing = i - 12; }
          else { r = 750; numInRing = 28; indexInRing = i - 32; }
          const angle = (indexInRing / numInRing) * Math.PI * 2;
          return [0, Math.sin(angle) * r];
        },
        scale: [0, () => anime.random(0.7, 1.3)],
        // Keep them upright! Small random tilt only.
        rotate: () => anime.random(-15, 15),
        opacity: [0, 0.4], // Slightly more transparent so background isn't too heavy
        duration: 2500,
        delay: anime.stagger(15),
        easing: 'easeOutCubic'
      })
    
    // 2. FILM REEL "MEMORY" (Drops as a closed reel, then unrolls)
    .add({
      targets: '.film-reel-container',
      opacity: [0, 1],
      translateY: [-500, 0],
      rotate: [720, 0], // Drops and spins like a physical reel
      width: ['80px', '80px'], // Stays closed initially
      borderRadius: ['40px', '40px'], // Starts circular
      duration: 1000,
      easing: 'easeOutBounce'
    }, '-=1500')
    .add({
      targets: '.film-reel-container',
      width: ['80px', '450px'], // Unrolls to full width
      borderRadius: ['40px', '8px'], // Becomes a strip
      padding: ['10px 0', '10px 20px'],
      duration: 1200,
      easing: 'easeOutElastic(1, .8)'
    })
    .add({
      targets: '.film-reel-text',
      opacity: [0, 1],
      duration: 500,
      easing: 'linear'
    }, '-=800')

    // 3. POLAROID "ALBUM"
    .add({
      targets: '.polaroid-letter',
      opacity: [0, 1],
      translateY: [-500, 0],
      rotate: function(el: HTMLElement, i: number) {
        // Hardcoded final angles for messy but readable layout
        const finalAngles = [-12, 5, -5, 15, -8];
        return [anime.random(-90, 90), finalAngles[i]];
      },
      scale: [1.5, 1],
      duration: 1000,
      delay: anime.stagger(200),
      easing: 'easeOutBounce'
    }, '-=500')

    // Subtitle fade in
    .add({
      targets: '.loading-subtitle',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 1000,
      easing: 'easeOutQuad'
    }, '-=200');

    }, 100); // End of setTimeout

    return () => clearTimeout(timer); // Cleanup
  }, []);

  const handleEnter = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => {
      setVisible(false);
      setScene('tutorial');
    }, 1500);
  }, [setScene]);

  if (!visible) return null;

  return (
    <div
      className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}
      role="status"
      style={{
        position: 'absolute', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1025 0%, #2d1b36 100%)',
        color: '#fff',
        overflow: 'hidden',
        transition: 'opacity 1.5s ease'
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .fade-out { opacity: 0; pointer-events: none; }
        @keyframes flapLeft { 0%, 100% { transform: perspective(300px) rotateY(0deg); } 50% { transform: perspective(300px) rotateY(50deg); } }
        @keyframes flapRight { 0%, 100% { transform: perspective(300px) rotateY(0deg); } 50% { transform: perspective(300px) rotateY(-50deg); } }
        .left-wing { animation: flapLeft 0.8s ease-in-out infinite; }
        .right-wing { animation: flapRight 0.8s ease-in-out infinite; }
        .flying-book:nth-child(2n) .left-wing { animation-duration: 0.6s; }
        .flying-book:nth-child(2n) .right-wing { animation-duration: 0.6s; }
        .flying-book:nth-child(3n) .left-wing { animation-duration: 1.0s; }
        .flying-book:nth-child(3n) .right-wing { animation-duration: 1.0s; }
      `}} />

      {/* 60 Flying Flapping Books (Concentric Rings) */}
      <div style={{ position: 'absolute', left: '50%', top: '50%', pointerEvents: 'none' }}>
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="flying-book" style={{ position: 'absolute', opacity: 0, color: 'rgba(232,213,181,0.5)', marginTop: '-18px', marginLeft: '-18px' }}>
            <FlappingBookIcon />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', zIndex: 10 }}>
        
        {/* Unrolling Film Reel MEMORY */}
        <div className="film-reel-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#111',
          borderTop: '6px dashed rgba(255,255,255,0.4)',
          borderBottom: '6px dashed rgba(255,255,255,0.4)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          opacity: 0,
          width: '80px', // Animates to full width
          height: '80px',
        }}>
          <div className="film-reel-text" style={{ 
            color: '#e8d5b5', 
            fontSize: '3.5rem', 
            fontFamily: 'serif', 
            fontWeight: 'bold', 
            letterSpacing: '15px',
            marginLeft: '15px', // offset for letter spacing
            whiteSpace: 'nowrap',
            opacity: 0
          }}>
            MEMORY
          </div>
        </div>

        {/* Polaroid ALBUM */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
          <PolaroidLetter char="A" />
          <PolaroidLetter char="L" />
          <PolaroidLetter char="B" />
          <PolaroidLetter char="U" />
          <PolaroidLetter char="M" />
        </div>

        <p className="loading-subtitle" style={{ fontSize: '1.2rem', color: '#dcc6d2', opacity: 0, marginTop: '20px', fontStyle: 'italic', letterSpacing: '2px' }}>
          to share memories in a unique way
        </p>

        {ready && (
          <button
            onClick={handleEnter}
            style={{
              marginTop: '20px',
              padding: '15px 40px',
              fontSize: '1.2rem',
              background: 'linear-gradient(45deg, #d4af37, #f3e5ab)',
              border: 'none',
              borderRadius: '30px',
              color: '#1a1025',
              cursor: 'pointer',
              boxShadow: '0 4px 30px rgba(212,175,55,0.4)',
              fontWeight: 'bold',
              letterSpacing: '1px',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Create An Album
          </button>
        )}
      </div>

    </div>
  );
}
