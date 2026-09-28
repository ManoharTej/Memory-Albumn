'use server';

import { createClient } from '@vercel/kv';
import type { MemoryAlbum } from '@/types';

const url = process.env.KV_REST_API_URL || process.env.memoryalbumn_KV_REST_API_URL || "";
const token = process.env.KV_REST_API_TOKEN || process.env.memoryalbumn_KV_REST_API_TOKEN || "";

const kv = createClient({
  url: url || "https://dummy.upstash.io",
  token: token || "dummy",
});

export async function shareAlbumToKV(album: MemoryAlbum) {
  try {
    // Store the album stringified with a 7-day TTL (604800 seconds)
    await kv.set(`album:${album.id}`, JSON.stringify(album), { ex: 604800 });
    return { success: true };
  } catch (error) {
    console.error("Failed to share album to KV:", error);
    return { success: false, error: String(error) };
  }
}

export async function fetchAlbumFromKV(albumId: string): Promise<MemoryAlbum | null> {
  try {
    const data = await kv.get(`album:${albumId}`);
    if (!data) return null;
    
    // Upstash/KV might parse it automatically if it was saved as an object, but we stringified it.
    if (typeof data === 'string') {
      return JSON.parse(data) as MemoryAlbum;
    }
    return data as MemoryAlbum;
  } catch (error) {
    console.error("Failed to fetch album from KV:", error);
    return null;
  }
}
