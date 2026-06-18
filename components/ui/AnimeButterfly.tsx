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
    let currentX = (Math.random() - 0.5) * 200;
    let currentY = (Math.random() - 0.5) * 200;
    // Set a fresh random direction each hop
    let zigDir = 1;

    const flyRandomly = () => {
      if (!isFlying) return;

      const state = useMemoryStore.getState();
      const zoomed = state.zoomedFrame || state.zoomedMemoryId;

      let nextX: number;
      let nextY: number;

      if (zoomed) {
        // Push to screen edges so they don't block the zoomed view
        nextX = zigDir > 0 ? window.innerWidth / 2 - 80 : -window.innerWidth / 2 + 80;
        nextY = -window.innerHeight / 2 + 100 + Math.random() * (window.innerHeight - 200);
        zigDir *= -1;
      } else {
        // Wide zig-zag roaming: alternate between far-left & far-right waypoints
        // + random vertical scatter → creates a natural W/Z-pattern flight
        const halfW = window.innerWidth * 0.42;
        const halfH = window.innerHeight * 0.42;
        // Zig-zag: flip horizontal direction every hop
        zigDir *= -1;
        const xBias = zigDir * (halfW * 0.5 + Math.random() * halfW * 0.5);
        nextX = xBias + (Math.random() - 0.5) * 120;
        nextY = (Math.random() - 0.5) * halfH * 2;
        // Clamp
        nextX = Math.max(-halfW, Math.min(halfW, nextX));
        nextY = Math.max(-halfH, Math.min(halfH, nextY));
      }

      // Tilt in direction of travel
      const dx = nextX - currentX;
      const rotateZ = Math.max(-40, Math.min(40, dx * 0.08));
      const rotateX = (Math.random() - 0.5) * 50;
      const tumbleY = (Math.random() - 0.5) * 50;

      currentX = nextX;
      currentY = nextY;

      anime({
        targets: el,
        translateX: nextX,
        translateY: nextY,
        rotateZ,
        rotateX,
        rotateY: tumbleY,
        scale: 1.0 + Math.random() * 0.4,
        duration: 500 + Math.random() * 900,
        easing: 'easeInOutQuad',
        complete: flyRandomly
      });
    };

    // Start flying after stagger delay
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
