'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { useMemoryStore } from '@/stores/useMemoryStore';

export default function AnimeFirefliesOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const fireflies = Array.from(containerRef.current.children) as HTMLElement[];
    const count = fireflies.length;

    fireflies.forEach((el, i) => {
      // Give each firefly a unique zig-zag bias direction
      let zigDir = i % 2 === 0 ? 1 : -1;
      let currentX = Math.random() * window.innerWidth;
      let currentY = Math.random() * window.innerHeight;

      // Set starting position instantly
      anime.set(el, { translateX: currentX, translateY: currentY, opacity: 0, scale: 0 });

      const fly = () => {
        // Zig-zag: flip horizontal bias every hop
        zigDir *= -1;
        const W = window.innerWidth;
        const H = window.innerHeight;
        const xBias = zigDir * (W * 0.15 + Math.random() * W * 0.35);
        const nextX = Math.max(10, Math.min(W - 10, currentX + xBias + (Math.random() - 0.5) * 100));
        const nextY = Math.max(10, Math.min(H - 10, currentY + (Math.random() - 0.5) * H * 0.5));

        currentX = nextX;
        currentY = nextY;

        anime({
          targets: el,
          translateX: nextX,
          translateY: nextY,
          opacity: [
            { value: 0.15 + Math.random() * 0.7, duration: 400 },
            { value: 0.05 + Math.random() * 0.3, duration: 400 }
          ],
          scale: 0.4 + Math.random() * 1.4,
          duration: 3000 + Math.random() * 5000,
          easing: 'easeInOutSine',
          complete: fly,
        });
      };

      // Stagger start so they don't all move at once
      setTimeout(fly, (i / count) * 3000 + Math.random() * 1500);
    });

    return () => {
      anime.remove(fireflies);
    };
  }, []);

  const isMobile = useMemoryStore(s => s.isMobile);
  const quality = useMemoryStore(s => s.getQualitySettings)();
  if (!quality.firefliesEnabled) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 40,
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: i % 3 === 0 ? '8px' : '5px',
            height: i % 3 === 0 ? '8px' : '5px',
            borderRadius: '50%',
            backgroundColor: '#ffecb3',
            boxShadow: i % 3 === 0
              ? '0 0 12px 4px #ffca28, 0 0 24px 8px #ffb74d'
              : '0 0 8px 3px #ffca28, 0 0 16px 5px #ffb74d',
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
}
