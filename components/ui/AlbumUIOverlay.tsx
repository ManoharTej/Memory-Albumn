'use client';

import { useState } from 'react';
import { useMemoryStore } from '@/stores/useMemoryStore';
import styles from '@/app/page.module.css';

export default function AlbumUIOverlay() {
  const selectedAlbumId = useMemoryStore((s) => s.selectedAlbumId);
  const zoomedFrame = useMemoryStore((s) => s.zoomedFrame);
  const selectAlbum = useMemoryStore((s) => s.selectAlbum);
  const setZoomedFrame = useMemoryStore((s) => s.setZoomedFrame);
  const albums = useMemoryStore((s) => s.albums);
  const updateAlbumTitle = useMemoryStore((s) => s.updateAlbumTitle);
  const currentPage = useMemoryStore((s) => s.currentPage);
  const setCurrentPage = useMemoryStore((s) => s.setCurrentPage);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  if (zoomedFrame) {
    return (
      <div className={styles.uiOverlay} style={{ pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto', position: 'absolute', top: '2rem', left: '2rem' }}>
          <button className={styles.backButton} onClick={() => setZoomedFrame(false)}>
            &larr; Back
          </button>
        </div>
        <FloatingHearts />
      </div>
    );
  }

  if (!selectedAlbumId) return null;

  const currentAlbum = albums.find(a => a.id === selectedAlbumId);
  if (!currentAlbum) return null;

  // We allow flipping up to the number of photos + 1 (the letter page)
  const maxFlippablePages = currentAlbum.memories.length + 1;

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    
    let current = currentPage;
    const interval = setInterval(() => {
      if (current > 0) {
        current--;
        setCurrentPage(current);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          selectAlbum(null);
          setIsClosing(false);
        }, 500); // Wait a bit before closing cover
      }
    }, 200); // 200ms per page flip
  };

  return (
    <div className={styles.uiOverlay} style={{ opacity: isClosing ? 0 : 1, transition: 'opacity 0.5s' }}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <button className={styles.backButton} onClick={handleClose}>
          &larr; Close Album
        </button>
        
        <div className={styles.titleEditor}>
          {isEditing ? (
            <input 
              autoFocus
              className={styles.titleInput}
              value={currentAlbum.title}
              onChange={(e) => updateAlbumTitle(selectedAlbumId, e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditing(false);
              }}
            />
          ) : (
            <h2 onClick={() => setIsEditing(true)} className={styles.titleText}>
              {currentAlbum.title}
              <span className={styles.editIcon}>✎</span>
            </h2>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className={styles.navArrows}>
        <button 
          className={styles.navButton} 
          disabled={currentPage === 0}
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
        >
          &larr;
        </button>
        <button 
          className={styles.navButton}
          disabled={currentPage >= maxFlippablePages}
          onClick={() => setCurrentPage(Math.min(maxFlippablePages, currentPage + 1))}
        >
          &rarr;
        </button>
      </div>

    </div>
  );
}

function FloatingHearts() {
  return (
    <div className={styles.heartsContainer}>
      {Array.from({ length: 15 }).map((_, i) => (
        <div 
          key={i} 
          className={styles.floatingHeart}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
            fontSize: `${1 + Math.random() * 2}rem`
          }}
        >
          {['❤️', '💖', '✨', '💕'][Math.floor(Math.random() * 4)]}
        </div>
      ))}
    </div>
  );
}
