'use client';

// ══════════════════════════════════════════════════════════════
// ButterflySwarm — 3 butterflies, exact same look as AnimeButterfly,
// but centrally managed so they respond to album/frame/idle state
// and fly in curves + zig-zag patterns.
// ══════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { useMemoryStore } from '@/stores/useMemoryStore';

// Exact same SVG as AnimeButterfly — but each gets unique gradient/filter IDs
function ButterflySVG({ id }: { id: number }) {
  const gradId = `bf3-goldGrad-${id}`;
  const glowId = `bf3-glow-${id}`;
  return (
    <div className="butterfly-anim" style={{ width: '100%', height: '100%' }}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter={`url(#${glowId})`}>
          <path className="wing-left"  d="M50 50 C20 20, 0 40, 10 70 C20 80, 40 70, 50 50" fill={`url(#${gradId})`} stroke="#ffb300" strokeWidth="2" />
          <path className="wing-left"  d="M50 50 C30 60, 20 85, 35 90 C45 95, 48 70, 50 50" fill={`url(#${gradId})`} stroke="#ffb300" strokeWidth="1" />
          <path className="wing-right" d="M50 50 C80 20, 100 40, 90 70 C80 80, 60 70, 50 50" fill={`url(#${gradId})`} stroke="#ffb300" strokeWidth="2" />
          <path className="wing-right" d="M50 50 C70 60, 80 85, 65 90 C55 95, 52 70, 50 50" fill={`url(#${gradId})`} stroke="#ffb300" strokeWidth="1" />
          <path d="M48 40 Q50 30 52 40 L51 65 Q50 75 49 65 Z" fill="#8c5100" />
        </g>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#ffd54f" />
            <stop offset="50%"  stopColor="#ffca28" />
            <stop offset="100%" stopColor="#ff8f00" />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

// ── Where butterflies should cluster based on app state ───────
function getTarget(state: ReturnType<typeof useMemoryStore.getState>) {
  const W = window.innerWidth;
  const H = window.innerHeight;

  if (state.selectedAlbumId) {
    // Album open → medium-large area around the book so they clearly fly "around" it but not too tight
    return { cx: W * 0.40, cy: H * 0.50, rx: W * 0.35, ry: H * 0.35 };
  }
  if (state.zoomedFrame) {
    // Frame zoomed → medium area around the frame
    return { cx: W * 0.70, cy: H * 0.40, rx: W * 0.25, ry: H * 0.30 };
  }
  // Idle — full screen roam
  return { cx: W * 0.50, cy: H * 0.50, rx: W * 0.45, ry: H * 0.45 };
}

// ── Per-butterfly speed profiles (all slow, each different) ──
const SPEEDS = [
  { min: 3000, max: 5000 }, // butterfly 0 — very slow, elegant
  { min: 2500, max: 4000 }, // butterfly 1 — medium slow
  { min: 2000, max: 3500 }, // butterfly 2 — slightly faster but still slow
];

// ── Per-butterfly flight loop ─────────────────────────────────
function startFlight(el: HTMLElement, index: number) {
  let alive = true;
  const speed = SPEEDS[index];

  // Each butterfly gets a preferred slice of the pie so they don't clump together
  const baseAngle = index * ((Math.PI * 2) / 3);

  // Start near the centre of screen but spread out
  let curX = window.innerWidth / 2 + Math.cos(baseAngle) * 100;
  let curY = window.innerHeight / 2 + Math.sin(baseAngle) * 100;
  anime.set(el, { translateX: curX, translateY: curY, opacity: 0 });
  anime({ targets: el, opacity: 1, duration: 2000, easing: 'easeOutQuad' });

  const fly = () => {
    if (!alive) return;

    const state = useMemoryStore.getState();
    const { cx, cy, rx, ry } = getTarget(state);

    // Pick a random waypoint inside their slice of the zone
    // They can wander up to 120 degrees from their base angle
    const a = baseAngle + (Math.random() - 0.5) * (Math.PI * 1.5);
    // r is mostly biased to the outer edge to encourage big sweeping circles around the album
    const r = 0.5 + Math.random() * 0.5; 
    const nextX = Math.max(40, Math.min(window.innerWidth  - 40, cx + Math.cos(a) * rx * r));
    const nextY = Math.max(40, Math.min(window.innerHeight - 40, cy + Math.sin(a) * ry * r));

    // Tilt gently in travel direction
    const dx = nextX - curX;
    const rotateZ = Math.max(-30, Math.min(30, dx * 0.04));

    curX = nextX;
    curY = nextY;

    // Slow, sweeping curves
    const dur = speed.min + Math.random() * (speed.max - speed.min);

    anime({
      targets: el,
      translateX: nextX,
      translateY: nextY,
      rotateZ,
      rotateX: (Math.random() - 0.5) * 45, // slow tumbling
      rotateY: (Math.random() - 0.5) * 45,
      scale: 0.85 + Math.random() * 0.3,
      duration: dur,
      // easeInOutSine makes it beautifully accelerate and decelerate into gentle curves
      easing: 'easeInOutSine', 
      complete: fly,
    });
  };

  // Stagger start so they take off one by one
  setTimeout(fly, index * 1200 + 500);

  return () => { alive = false; anime.remove(el); };
}

// ── Component ─────────────────────────────────────────────────
export default function ButterflySwarm() {
  const refs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  useEffect(() => {
    const cleanups = refs.map((ref, i) => {
      if (!ref.current) return () => {};
      return startFlight(ref.current, i);
    });
    return () => cleanups.forEach(c => c());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .butterfly-anim {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        .wing-left, .wing-right { transform-origin: 50% 50%; }
        .wing-left  { animation: flap-left  0.12s infinite alternate ease-in-out; }
        .wing-right { animation: flap-right 0.12s infinite alternate ease-in-out; }
        @keyframes flap-left  { 0% { transform: rotateY(10deg);  } 100% { transform: rotateY(75deg);  } }
        @keyframes flap-right { 0% { transform: rotateY(-10deg); } 100% { transform: rotateY(-75deg); } }
      `}} />

      {refs.map((ref, i) => (
        <div
          key={i}
          ref={ref}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 75,
            height: 75,
            marginTop: -37,
            marginLeft: -37,
            pointerEvents: 'none',
            zIndex: 45,
            willChange: 'transform, opacity',
            opacity: 0,
          }}
        >
          <ButterflySVG id={i} />
        </div>
      ))}
    </>
  );
}
