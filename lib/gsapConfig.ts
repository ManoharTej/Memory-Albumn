// ══════════════════════════════════════════════════════════════
// MEMORY ALBUM — GSAP Configuration
// Centralized plugin registration (SSR-safe)
// ══════════════════════════════════════════════════════════════

'use client';

import gsap from 'gsap';

// Only register on client
if (typeof window !== 'undefined') {
  // GSAP defaults for the memory album aesthetic
  gsap.defaults({
    ease: 'power2.inOut',
    duration: 1,
  });
}

export { gsap };
