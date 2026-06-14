'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { useMemoryStore } from '@/stores/useMemoryStore';

export default function AnimeFirefliesOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const fireflies = containerRef.current.children;
    
    // Animate each firefly independently
    for (let i = 0; i < fireflies.length; i++) {
      const el = fireflies[i];
      
      const animateFly = () => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        anime({
          targets: el,
          translateX: x,
          translateY: y,
          opacity: 0.3 + Math.random() * 0.7,
          scale: 0.5 + Math.random() * 1.5,
          duration: 4000 + Math.random() * 6000,
          easing: 'easeInOutSine',
          complete: animateFly
        });
      };

      // Initial random position without animation
      anime.set(el, {
        translateX: Math.random() * window.innerWidth,
        translateY: Math.random() * window.innerHeight,
        opacity: 0,
        scale: 0
      });

      // Start animation with stagger
      setTimeout(animateFly, Math.random() * 2000);
    }

    return () => {
      anime.remove(fireflies);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 40,
        overflow: 'hidden'
      }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#ffecb3',
            boxShadow: '0 0 10px 3px #ffca28, 0 0 20px 5px #ffb74d',
            willChange: 'transform, opacity'
          }}
        />
      ))}
    </div>
  );
}
