'use client';

import { useState, useEffect } from 'react';
import { useMemoryStore } from '@/stores/useMemoryStore';

export default function TutorialOverlay() {
  const setScene = useMemoryStore(s => s.setScene);
  const selectAlbum = useMemoryStore(s => s.selectAlbum);
  const setZoomedFrame = useMemoryStore(s => s.setZoomedFrame);
  
  const selectedAlbumId = useMemoryStore(s => s.selectedAlbumId);
  const currentPage = useMemoryStore(s => s.currentPage);
  const zoomedFrame = useMemoryStore(s => s.zoomedFrame);
  const zoomedMemoryId = useMemoryStore(s => s.zoomedMemoryId);
  const letterPhase = useMemoryStore(s => s.letterPhase);
  const frameDoorsOpen = useMemoryStore(s => s.frameDoorsOpen);
  
  const albums = useMemoryStore(s => s.albums);
  
  const [step, setStep] = useState(0);

  // Calculate max pages based on the demo album (which is albums[0])
  const currentAlbum = albums.find(a => a.id === selectedAlbumId) || albums[0];
  const maxPages = currentAlbum ? Math.ceil(currentAlbum.memories.length / 2) + 1 : 2;

  // Strict Sequential State Machine
  useEffect(() => {
    switch (step) {
      case 0:
        if (selectedAlbumId !== null) setStep(1); // Book opened
        break;
      case 1:
        if (currentPage > 0) setStep(2); // Flipped right
        break;
      case 2:
        if (currentPage === 0) setStep(3); // Flipped left
        break;
      case 3:
        if (zoomedMemoryId !== null) setStep(4); // Zoomed polaroid
        break;
      case 4:
        if (currentPage >= maxPages) setStep(5); // Reached letter page
        break;
      case 5:
        if (letterPhase === 'open' || letterPhase === 'reading') setStep(6); // Opened seal
        break;
      case 6:
        if (letterPhase === 'reading') setStep(7); // Clicked letter
        break;
      case 7:
        if (selectedAlbumId === null) setStep(8); // Closed album
        break;
      case 8:
        if (!frameDoorsOpen) setStep(9); // Toggled frame doors
        break;
      case 9:
        if (zoomedFrame) setStep(10); // Zoomed frame
        break;
      default:
        break;
    }
  }, [step, selectedAlbumId, currentPage, zoomedMemoryId, maxPages, letterPhase, frameDoorsOpen, zoomedFrame]);

  const dialogues = [
    { title: "Step 1: Open the Album", text: "Click on the glowing book on the desk to open the magic album." }, // 0
    { title: "Step 2: Turn Right", text: "Great! Click the right arrow (or right side of the page) to flip forward." }, // 1
    { title: "Step 3: Turn Left", text: "Now click the left arrow to flip backward." }, // 2
    { title: "Step 4: View a Memory", text: "Click on any photo to zoom in and see the details!" }, // 3
    { title: "Step 5: Find the Letter", text: "Keep flipping pages forward until you reach the very end of the album." }, // 4
    { title: "Step 6: Break the Seal", text: "You found the hidden letter! Tap on the wax seal to unfold it." }, // 5
    { title: "Step 7: Read the Letter", text: "Now click directly on the letter to bring it closer and see what's written clearly!" }, // 6
    { title: "Step 8: Close the Album", text: "What a beautiful message! Click 'Close Album' to put the book away." }, // 7
    { title: "Step 9: The Photo Frame", text: "Notice the wooden photo frame? Click it once to close its hinged doors." }, // 8
    { title: "Step 10: A Special Memory", text: "Now, double-click the wooden frame to zoom in and see the magic twist!" }, // 9
    { title: "You're a Pro!", text: "You know exactly how to use the magic album! Click 'Start Creating' to craft your own story." }, // 10
  ];

  const currentDialogue = dialogues[step];

  const handleClose = () => {
    selectAlbum(null);
    setZoomedFrame(false);
    setScene('creation');
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
    }}>
      {/* Top right Skip/Create button */}
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleClose}
          style={{
            pointerEvents: 'auto',
            padding: '12px 24px', background: 'rgba(0,0,0,0.6)', color: '#d4af37',
            border: '1px solid #d4af37', borderRadius: '30px', cursor: 'pointer',
            fontSize: '1rem', backdropFilter: 'blur(4px)', transition: 'all 0.2s',
            fontWeight: 'bold', letterSpacing: '0.5px'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
        >
          {step === 10 ? 'Start Creating Now &rarr;' : 'Skip Demo & Start Creating &rarr;'}
        </button>
      </div>

      {/* Bottom Dialog Box */}
      <div style={{
        padding: '2rem', display: 'flex', justifyContent: 'center', pointerEvents: 'auto', marginBottom: '2rem'
      }}>
        <div style={{
          background: 'rgba(20, 10, 25, 0.85)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '12px',
          padding: '2rem 3rem',
          maxWidth: '600px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          color: '#fff',
          textAlign: 'center',
          fontFamily: "'Playfair Display', serif",
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <h3 style={{ color: '#d4af37', fontSize: '1.8rem', marginBottom: '1rem', marginTop: 0 }}>
            {currentDialogue.title}
          </h3>
          <p style={{ 
            fontSize: '1.2rem', lineHeight: '1.6', margin: 0, color: '#e8d5b5',
            fontFamily: 'sans-serif'
          }}>
            {currentDialogue.text}
          </p>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
