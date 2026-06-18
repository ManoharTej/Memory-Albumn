// ══════════════════════════════════════════════════════════════
// MEMORY ALBUM — Global State Store (Zustand)
// ══════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { DEMO_ALBUMS } from '@/lib/constants';
import type { AppScene, MemoryAlbum, DeviceTier } from '@/types';
import { shareAlbumToKV, fetchAlbumFromKV } from '@/app/actions';

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
  
  // URL Routing States
  isReceiverMode: boolean;
  setIsReceiverMode: (isReceiver: boolean) => void;
  isCapturing: boolean;
  setIsCapturing: (val: boolean) => void;
  isExpired: boolean;
  setIsExpired: (expired: boolean) => void;

  // Cloud
  shareAlbumToCloud: (album: MemoryAlbum) => Promise<string>;
  fetchSharedAlbum: (id: string) => Promise<void>;

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

  // Screenshot
  screenshotRequested: boolean;
  requestScreenshot: (callback: (url: string) => void) => void;
  screenshotCallback: ((url: string) => void) | null;
  clearScreenshotRequest: () => void;
}

export const useMemoryStore = create<MemoryState>((set) => ({
  // Navigation
  scene: 'loading',
  setScene: (scene) => set({ scene }),
  
  // Loading state
  isLoaded: false,
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

  // URL Routing States
  isReceiverMode: false,
  setIsReceiverMode: (isReceiver) => set({ isReceiverMode: isReceiver }),
  isCapturing: false,
  setIsCapturing: (val) => set({ isCapturing: val }),
  isExpired: false,
  setIsExpired: (expired) => set({ isExpired: expired }),

  // Cloud Actions
  shareAlbumToCloud: async (album) => {
    try {
      const res = await shareAlbumToKV(album);
      if (!res.success) throw new Error(res.error);
      return album.id;
    } catch (error) {
      console.error("⚠️ Failed to save album to KV:", error);
      throw error;
    }
  },
  
  fetchSharedAlbum: async (id) => {
    try {
      const fetchedAlbum = await fetchAlbumFromKV(id);
      
      if (fetchedAlbum) {
        
        // Check 7-day expiration (7 days = 7 * 24 * 60 * 60 * 1000 = 604,800,000 ms)
        const SEVEN_DAYS = 604800000;
        const now = Date.now();
        if (now - fetchedAlbum.createdAt > SEVEN_DAYS) {
          throw new Error("EXPIRED");
        }
        
        // Album is valid, add it to local state and select it
        set((state) => {
          // If we already have it, don't duplicate
          const exists = state.albums.find(a => a.id === id);
          if (exists) return { currentAlbum: fetchedAlbum };
          
          return {
            albums: [...state.albums, fetchedAlbum],
            currentAlbum: fetchedAlbum
          };
        });
      } else {
        throw new Error("NOT_FOUND");
      }
    } catch (error) {
      console.error("Error fetching album:", error);
      throw error;
    }
  },

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
  // Screenshot
  screenshotRequested: false,
  screenshotCallback: null,
  requestScreenshot: (callback) => set({ screenshotRequested: true, screenshotCallback: callback }),
  clearScreenshotRequest: () => set({ screenshotRequested: false, screenshotCallback: null }),
}));
