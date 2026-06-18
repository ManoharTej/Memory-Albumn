'use client';

import { useState } from 'react';
import { useMemoryStore } from '@/stores/useMemoryStore';

export default function ShareOverlay() {
  const scene = useMemoryStore((s) => s.scene);
  const isReceiverMode = useMemoryStore((s) => s.isReceiverMode);
  const albums = useMemoryStore((s) => s.albums);
  const shareAlbumToCloud = useMemoryStore((s) => s.shareAlbumToCloud);

  const [isSharing, setIsSharing] = useState(false);
  const [shareProgress, setShareProgress] = useState('');
  const [shareLink, setShareLink] = useState('');

  // Only show when in the 3D room, and not in receiver mode
  if (isReceiverMode || scene === 'creation' || scene === 'tutorial') return null;

  // Grab the latest album created by the user (or the demo album if none)
  const currentAlbum = albums[albums.length - 1];

  const handleShare = async () => {
    if (!currentAlbum || isSharing) return;
    setIsSharing(true);
    setShareProgress('Starting upload...');
    
    try {
      // Helper to convert blob URL to Base64
      const blobToBase64 = async (blobUrl: string): Promise<string> => {
        try {
          const res = await fetch(blobUrl);
          const blob = await res.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.error("Failed to convert blob to base64", e);
          return blobUrl; // Fallback
        }
      };
      
      const newAlbum = { ...currentAlbum };
      let completed = 0;
      const totalPhotos = currentAlbum.memories.filter(m => m.photoUrl?.startsWith('blob:')).length + 
                          (currentAlbum.framePhotoUrl?.startsWith('blob:') ? 1 : 0);

      // 1. Convert memories (polaroids) to Base64
      if (totalPhotos > 0) {
        const newMemories = await Promise.all(currentAlbum.memories.map(async (mem, i) => {
          if (mem.photoUrl && mem.photoUrl.startsWith('blob:')) {
            const base64Str = await blobToBase64(mem.photoUrl);
            completed++;
            setShareProgress(`Compressing ${completed}/${totalPhotos}...`);
            return { ...mem, photoUrl: base64Str };
          }
          return mem;
        }));
        newAlbum.memories = newMemories;

        // 2. Convert frame photo to Base64
        if (currentAlbum.framePhotoUrl && currentAlbum.framePhotoUrl.startsWith('blob:')) {
          newAlbum.framePhotoUrl = await blobToBase64(currentAlbum.framePhotoUrl);
          completed++;
        }
      }

      // 3. Save to Firestore
      setShareProgress('Finalizing...');
      await shareAlbumToCloud(newAlbum);

      // 4. Generate Link
      const url = `${window.location.origin}/?mode=view&album_id=${newAlbum.id}`;
      setShareLink(url);
      try {
        await navigator.clipboard.writeText(url);
      } catch (err) {}
    } catch (err) {
      console.error("Critical error sharing album:", err);
      alert("Failed to share album. Check console for details.");
    } finally {
      setIsSharing(false);
      setShareProgress('');
    }
  };

  return (
    <div style={{ position: 'fixed', right: '2rem', top: '2rem', zIndex: 50 }}>
      {shareLink ? (
        <div style={{ 
          color: '#d4af37', 
          fontWeight: 'bold', 
          background: 'rgba(0,0,0,0.7)', 
          padding: '12px 24px', 
          borderRadius: '30px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(212,175,55,0.3)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          ✨ Link Copied to Clipboard!
        </div>
      ) : (
        <button 
          onClick={handleShare}
          disabled={isSharing}
          style={{
            background: 'linear-gradient(45deg, #d4af37, #f3e5ab)',
            color: '#1a1025',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '30px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: isSharing ? 'wait' : 'pointer',
            opacity: isSharing ? 0.8 : 1,
            boxShadow: '0 4px 20px rgba(212,175,55,0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            pointerEvents: 'auto'
          }}
          onMouseOver={(e) => !isSharing && (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isSharing ? shareProgress : '✨ Share World'}
        </button>
      )}
    </div>
  );
}
