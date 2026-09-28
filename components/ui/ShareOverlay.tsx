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
      const newAlbum = { ...currentAlbum };
      
      // Images are already compressed base64 webp from Dashboard.tsx
      // 1. Save to KV (or Firestore if changed later)
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
          background: 'rgba(20, 15, 25, 0.85)',
          padding: '16px 24px',
          borderRadius: '16px',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212,175,55,0.4)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'flex-end'
        }}>
          <div style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '1rem', width: '100%', textAlign: 'left' }}>
            ✨ Your Album is Ready
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              type="text" 
              readOnly 
              value={shareLink} 
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '10px 12px',
                borderRadius: '8px',
                width: '260px',
                outline: 'none',
                fontFamily: 'monospace',
                fontSize: '0.85rem'
              }}
              onClick={(e) => e.currentTarget.select()}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                const btn = document.getElementById('copy-btn');
                if (btn) {
                  btn.innerText = 'Copied!';
                  setTimeout(() => btn.innerText = 'Copy', 2000);
                }
              }}
              id="copy-btn"
              style={{
                background: '#d4af37',
                color: '#1a1025',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Copy
            </button>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            This link automatically expires in 7 days.
          </div>
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
