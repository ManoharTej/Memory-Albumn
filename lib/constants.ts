// ══════════════════════════════════════════════════════════════
// MEMORY ALBUM — Constants & Configuration
// ══════════════════════════════════════════════════════════════

import type { MemoryAlbum } from '@/types';

/** 3D World Colors — warm, Ghibli-inspired */
export const COLORS = {
  // Room
  roomAmbient:      '#1a1420',
  roomFloor:        '#2a1f1a',
  roomWallWarm:     '#1e1618',
  roomWallCool:     '#161420',

  // Lighting
  warmLight:        '#ffb366',
  softGold:         '#ffd699',
  candleGlow:       '#ff9944',
  moonlight:        '#c4d4ff',

  // Particles
  dustColor:        '#ffcc88',
  fireflyColor:     '#aaffaa',
  fireflyGlow:      '#88ff88',
  paperColor:       '#f5e6d0',

  // Shelf
  woodDark:         '#5c3a1e',
  woodMid:          '#8b5e3c',
  woodLight:        '#a67c5b',
  woodHighlight:    '#c49a6c',

  // Album
  leatherDark:      '#3d2b1f',
  leatherMid:       '#6b4226',
  clothNavy:        '#1a2744',
  clothBurgundy:    '#5c1a2a',
  clothForest:      '#1a3a2a',

  // Fog
  fogColor:         '#0d0a12',
} as const;

/** Animation timing presets */
export const TIMING = {
  cameraEntrance:   4000,
  lightWarmup:      3000,
  fadeFromBlack:    2000,
  loadingMinimum:   2500,
  particleSpawn:    500,
  bookHover:        300,
  bookSelect:       1200,
  pageTurn:         800,
  chapterTransition: 1500,
} as const;

/** 3D Scene configuration */
export const SCENE = {
  camera: {
    fov: 45,
    near: 0.1,
    far: 100,
    startPosition: [0.5, 4, 8] as [number, number, number],
    roomPosition:  [0.5, 3, 7] as [number, number, number],
    lookTarget:    [0.5, 1.5, 0] as [number, number, number],
    bookZoomPosition: [0.5, 3.8, 3.0] as [number, number, number],
    bookLookTarget:   [0.5, 1.5, 1] as [number, number, number],
  },
  room: {
    width: 10,
    height: 6,
    depth: 8,
  },
  study: {
    deskWidth: 8,
    deskDepth: 4,
    deskHeight: 1.5,
    deskY: 0,
    deskZ: 1,
    bgShelfY: 2.5,
    bgShelfZ: -4,
  },
  particles: {
    dustCount:     50,
    dustCountMobile: 30,
    fireflyCount:  8,
    fireflyCountMobile: 4,
    paperCount:    0,
    paperCountMobile: 0,
  },
  lighting: {
    ambientIntensity:  0.15,
    mainLightIntensity: 1.2,
    fillLightIntensity: 0.3,
    rimLightIntensity:  0.5,
  },
} as const;

/** Performance thresholds */
export const PERFORMANCE = {
  maxPhotos: 30,
  thumbnailSize: 512,
  texturePoolSize: 10,
  particleBudget: 500,
  targetFPS: 60,
  maxFrameTime: 16, // ms
} as const;

/** Demo album data for Phase 1 */
export const DEMO_ALBUMS: MemoryAlbum[] = [
  {
    id: 'demo-1',
    title: 'Summer Days',
    coverColor: '#1a3a2a', // Dark green
    createdAt: Date.now() - 100000,
    memories: [
      { id: 'm1', photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=800&fit=crop', caption: 'The perfect beach day', date: 'July 14' },
      { id: 'm2', photoUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=800&fit=crop', caption: 'Sunset drive', date: 'July 15' },
      { id: 'm3', photoUrl: 'https://images.unsplash.com/photo-1445307806294-bff7f67ff225?w=600&h=800&fit=crop', caption: 'Hiking the trails', date: 'August 2' },
      { id: 'm4', photoUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=800&fit=crop', caption: 'Mountain views', date: 'August 3' },
    ], // 4 pages = 2 spreads
    letter: {
      style: 'vintage',
      text: "To my favorite adventurer,\n\nThese summer days were some of the best times of my life. From the sunny beaches to the sunset drives, every moment was magical. Thank you for making these memories with me.\n\nWith love,\nKira"
    }
  },
  {
    id: 'album-2',
    title: 'Adventures',
    coverColor: '#1a2744',
    createdAt: Date.now() - 200000,
    memories: [],
  },
  {
    id: 'album-3',
    title: 'Family',
    coverColor: '#5c1a2a',
    createdAt: Date.now() - 300000,
    memories: [],
  },
  {
    id: 'album-4',
    title: 'Archive',
    coverColor: '#3d3d3d',
    createdAt: Date.now() - 400000,
    memories: [],
  },
] as MemoryAlbum[];
