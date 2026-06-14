// ══════════════════════════════════════════════════════════════
// MEMORY ALBUM — Global State Store (Zustand)
// ══════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { DEMO_ALBUMS } from '@/lib/constants';
import type { AppScene, MemoryAlbum, DeviceTier } from '@/types';

interface MemoryState {
  // App Scene
  scene: AppScene;
  setScene: (scene: AppScene) => void;

  // Loading
  isLoaded: boolean;
  setIsLoaded: (loaded: boolean) => void;
  loadingProgress: number;
  setLoadingProgress: (progress: number) => void;

  // Room state
  hasEnteredWorld: boolean;
  enterWorld: () => void;

  // Opening cinematic
  cinematicComplete: boolean;
  setCinematicComplete: (complete: boolean) => void;

  // Shelf
  selectedAlbumId: string | null;
  zoomedMemoryId: string | null;
  zoomedFrame: boolean;
  selectAlbum: (id: string | null) => void;
  setZoomedMemory: (id: string | null) => void;
  setZoomedFrame: (zoomed: boolean) => void;

  // Albums
  albums: MemoryAlbum[];
  setAlbums: (albums: MemoryAlbum[]) => void;
  updateAlbumTitle: (id: string, title: string) => void;
  addAlbum: (album: MemoryAlbum) => void;
  currentAlbum: MemoryAlbum | null;
  setCurrentAlbum: (album: MemoryAlbum | null) => void;

  // Pages
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  setTotalPages: (total: number) => void;

  // Device
  deviceTier: DeviceTier;
  setDeviceTier: (tier: DeviceTier) => void;
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;

  // Tutorial / Interaction States
  letterPhase: 'closed' | 'open' | 'reading';
  setLetterPhase: (phase: 'closed' | 'open' | 'reading') => void;
  frameDoorsOpen: boolean;
  setFrameDoorsOpen: (isOpen: boolean) => void;
}

export const useMemoryStore = create<MemoryState>((set) => ({
  // Navigation
  scene: 'album',
  setScene: (scene) => set({ scene }),
  
  // Loading state
  isLoaded: true,
  setIsLoaded: (loaded) => set({ isLoaded: loaded }),
  loadingProgress: 0,
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),

  // Room state
  hasEnteredWorld: false,
  enterWorld: () => set({ hasEnteredWorld: true, scene: 'entering' }),

  // Opening cinematic
  cinematicComplete: false,
  setCinematicComplete: (complete) => set({ cinematicComplete: complete }),

  // Shelf
  selectedAlbumId: null,
  zoomedMemoryId: null,
  zoomedFrame: false,
  selectAlbum: (id) => set({ selectedAlbumId: id, zoomedMemoryId: null, zoomedFrame: false }),
  setZoomedMemory: (id) => set({ zoomedMemoryId: id, zoomedFrame: false }),
  setZoomedFrame: (zoomed) => set({ zoomedFrame: zoomed, zoomedMemoryId: null }),

  // Albums
  albums: DEMO_ALBUMS,
  setAlbums: (albums) => set({ albums }),
  updateAlbumTitle: (id, title) => set((state) => ({
    albums: state.albums.map(a => a.id === id ? { ...a, title } : a)
  })),
  addAlbum: (album) => set((state) => ({
    albums: [...state.albums, album]
  })),
  currentAlbum: null,
  setCurrentAlbum: (album) => set({ currentAlbum: album }),

  // Pages
  currentPage: 0,
  setCurrentPage: (page) => set({ currentPage: page }),
  totalPages: 0,
  setTotalPages: (total) => set({ totalPages: total }),

  // Device
  deviceTier: 'high',
  setDeviceTier: (tier) => set({ deviceTier: tier }),
  isMobile: false,
  setIsMobile: (mobile) => set({ isMobile: mobile }),

  letterPhase: 'closed',
  setLetterPhase: (phase) => set({ letterPhase: phase }),

  frameDoorsOpen: true,
  setFrameDoorsOpen: (isOpen) => set({ frameDoorsOpen: isOpen }),
}));
