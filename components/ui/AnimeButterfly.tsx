'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { useMemoryStore } from '@/stores/useMemoryStore';

export default function AnimeButterfly({ delay = 0 }: { delay?: number }) {
  const butterflyRef = useRef<HTMLDivElement>(null);
  
  const isZoomed = useMemoryStore(s => s.zoomedFrame || s.zoomedMemoryId !== null);

  useEffect(() => {
    if (!butterflyRef.current) return;
    const el = butterflyRef.current;

    let isFlying = true;
    let currentX = 0;
    let currentY = 0;

    const flyRandomly = () => {
      if (!isFlying) return;
      
      // Calculate a destination that zig-zags relative to current position
      let nextX = currentX + (Math.random() - 0.5) * 600; // erratic darts
      let nextY = currentY + (Math.random() - 0.5) * 500;

      // Keep inside screen bounds
      const halfW = window.innerWidth * 0.45;
      const halfH = window.innerHeight * 0.45;
      if (nextX > halfW) nextX = halfW;
      if (nextX < -halfW) nextX = -halfW;
      if (nextY > halfH) nextY = halfH;
      if (nextY < -halfH) nextY = -halfH;
      
      // If zoomed, force the butterfly to the far left or far right edges to avoid blocking the image!
      if (useMemoryStore.getState().zoomedFrame || useMemoryStore.getState().zoomedMemoryId) {
        if (nextX > 0) nextX = window.innerWidth / 2 - 100;
        else nextX = -window.innerWidth / 2 + 100;
        nextY = -window.innerHeight / 2 + 150 + Math.random() * 300;
      }

      // Point towards movement
      const rotateZ = nextX > currentX ? 30 : -30; 
      // Add a 3D tumble effect as it darts
      const rotateX = (Math.random() - 0.5) * 60;
      const tumbleY = (Math.random() - 0.5) * 60;

      currentX = nextX;
      currentY = nextY;

      anime({
        targets: el,
        translateX: nextX,
        translateY: nextY,
        rotateZ: rotateZ,
        rotateX: rotateX,
        rotateY: tumbleY,
        scale: 1.0 + Math.random() * 0.4,
        duration: 400 + Math.random() * 800, // Very fast, sudden movements
        easing: 'easeInOutQuad',
        complete: flyRandomly
      });
    };

    // Start flying
    setTimeout(flyRandomly, delay);

    return () => {
      isFlying = false;
      anime.remove(el);
    };
  }, [delay]);

  return (
    <div 
      ref={butterflyRef} 
      style={{ 
        position: 'absolute', 
        top: -37, 
        left: -37, 
        width: 75, 
        height: 75, 
        pointerEvents: 'none',
        zIndex: 5,
        willChange: 'transform'
      }}
    >
      <div className="butterfly-anim">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#glow)">
            {/* Top Left Wing */}
            <path className="wing-left" d="M50 50 C20 20, 0 40, 10 70 C20 80, 40 70, 50 50" fill="url(#goldGrad)" stroke="#ffb300" strokeWidth="2" />
            {/* Bottom Left Wing */}
            <path className="wing-left" d="M50 50 C30 60, 20 85, 35 90 C45 95, 48 70, 50 50" fill="url(#goldGrad)" stroke="#ffb300" strokeWidth="1" />
            
            {/* Top Right Wing */}
            <path className="wing-right" d="M50 50 C80 20, 100 40, 90 70 C80 80, 60 70, 50 50" fill="url(#goldGrad)" stroke="#ffb300" strokeWidth="2" />
            {/* Bottom Right Wing */}
            <path className="wing-right" d="M50 50 C70 60, 80 85, 65 90 C55 95, 52 70, 50 50" fill="url(#goldGrad)" stroke="#ffb300" strokeWidth="1" />
            
            {/* Body */}
            <path d="M48 40 Q50 30 52 40 L51 65 Q50 75 49 65 Z" fill="#8c5100" />
          </g>
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffd54f" />
              <stop offset="50%" stopColor="#ffca28" />
              <stop offset="100%" stopColor="#ff8f00" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .butterfly-anim {
          width: 100%;
          height: 100%;
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        
        .wing-left, .wing-right {
          transform-origin: 50% 50%;
        }

        /* 3D Flapping animation */
        .wing-left {
          animation: flap-left 0.12s infinite alternate ease-in-out;
        }
        .wing-right {
          animation: flap-right 0.12s infinite alternate ease-in-out;
        }

        @keyframes flap-left {
          0% { transform: rotateY(10deg); }
          100% { transform: rotateY(75deg); }
        }
        @keyframes flap-right {
          0% { transform: rotateY(-10deg); }
          100% { transform: rotateY(-75deg); }
        }
      `}} />
    </div>
  );
}
