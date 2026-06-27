'use client';

import { useState, useRef } from 'react';
import { useMemoryStore } from '@/stores/useMemoryStore';
import { PRESET_QUOTES } from '@/lib/quotes';
import { PRESET_LETTERS, LetterCategory } from '@/lib/letters';
import type { LetterStyle } from '@/types';

interface DraftMemory {
  id: string;
  file: File;
  photoUrl: string; // Local blob URL for immediate UI
  cloudUrl?: string; // Firebase storage URL
  isUploading?: boolean;
  quote: string;
}

// Background Elements
const FlappingBookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40" style={{ overflow: 'visible', opacity: 0.15 }}>
    <path className="left-wing" d="M12 6.5C9 4.5 6 4.5 4 4.5v13c2 0 5 0 8 2" style={{ transformOrigin: '12px 6.5px' }} />
    <path className="right-wing" d="M12 6.5C15 4.5 18 4.5 20 4.5v13c-2 0-5 0-8 2" style={{ transformOrigin: '12px 6.5px' }} />
    <path d="M12 6.5v13" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const FloatingPolaroid = ({ delay, left, top, rotate }: { delay: string, left: string, top: string, rotate: string }) => (
  <div className="floating-polaroid" style={{
    position: 'absolute', left, top,
    background: '#f8f8f8', padding: '8px 8px 24px 8px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    '--rot': rotate,
    transform: `rotate(${rotate})`,
    animationDelay: delay,
    opacity: 0.15,
    pointerEvents: 'none'
  } as React.CSSProperties}>
    <div style={{ width: '60px', height: '60px', background: '#333' }}></div>
  </div>
);

export default function Dashboard() {
  const scene = useMemoryStore((s) => s.scene);
  const setScene = useMemoryStore((s) => s.setScene);
  const addAlbum = useMemoryStore((s) => s.addAlbum);
  const selectAlbum = useMemoryStore((s) => s.selectAlbum);
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  
  // Step 1 State
  const [title, setTitle] = useState('');
  const [draftMemories, setDraftMemories] = useState<DraftMemory[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3 State
  const [letterStyle, setLetterStyle] = useState<LetterStyle>('vintage');
  const [letterCategory, setLetterCategory] = useState<LetterCategory>('love');
  const [letterText, setLetterText] = useState(PRESET_LETTERS['love'][0]);

  // Wooden Frame State
  const [frameText, setFrameText] = useState('Every time you\nLIGHT THIS UP\nI hope you feel that\nTOGETHER IS MY\nFAVORITE\nPLACE TO BE');
  const [framePhotoUrl, setFramePhotoUrl] = useState<string>(''); // Local blob
  const [frameCloudUrl, setFrameCloudUrl] = useState<string>(''); // Uploaded URL
  const [isFrameUploading, setIsFrameUploading] = useState(false);
  const frameFileInputRef = useRef<HTMLInputElement>(null);

  // Only render during creation phase!
  if (scene !== 'creation') return null;

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      const newDrafts: DraftMemory[] = newFiles.map((file, index) => {
        const id = `draft-${Date.now()}-${index}`;

        return {
          id,
          file,
          photoUrl: URL.createObjectURL(file),
          quote: '',
          isUploading: false
        };
      });
      setDraftMemories(prev => [...prev, ...newDrafts].slice(0, 30));
    }
  };

  const handleFrameFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFramePhotoUrl(URL.createObjectURL(file));
      setIsFrameUploading(false);
    }
  };

  const setRandomQuote = (index: number) => {
    const quote = PRESET_QUOTES[Math.floor(Math.random() * PRESET_QUOTES.length)];
    const newDrafts = [...draftMemories];
    newDrafts[index].quote = quote;
    setDraftMemories(newDrafts);
  };

  const moveMemory = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= draftMemories.length) return;
    const newDrafts = [...draftMemories];
    const temp = newDrafts[index];
    newDrafts[index] = newDrafts[index + direction];
    newDrafts[index + direction] = temp;
    setDraftMemories(newDrafts);
  };

  const handleRandomizeLetter = (cat: LetterCategory) => {
    const letters = PRESET_LETTERS[cat];
    const text = letters[Math.floor(Math.random() * letters.length)];
    setLetterCategory(cat);
    setLetterText(text);
  };

  const handleCreate = () => {
    const memories = draftMemories.map((draft, i) => ({
      id: `new-mem-${Date.now()}-${i}`,
      photoUrl: draft.cloudUrl || draft.photoUrl,
      caption: `Memory ${i + 1}`,
      quote: draft.quote,
      date: new Date().toLocaleDateString(),
    }));

    const newAlbum = {
      id: `album-${Date.now()}`,
      title,
      coverColor: '#3d142d', 
      memories,
      createdAt: Date.now(),
      letter: {
        style: letterStyle,
        text: letterText
      },
      frameText,
      framePhotoUrl: frameCloudUrl || framePhotoUrl
    };

    addAlbum(newAlbum);
    setStep(1);
    setDraftMemories([]);
    setTitle('');
    
    selectAlbum(newAlbum.id);
    setScene('entering');
  };

  const renderStepIndicators = () => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
      {[1, 2, 3, 4].map(s => (
        <div key={s} style={{ 
          width: '12px', height: '12px', borderRadius: '50%', 
          background: step === s ? '#d4af37' : step > s ? '#f3e5ab' : '#333',
          boxShadow: step === s ? '0 0 10px #d4af37' : 'none',
          transition: 'all 0.3s ease'
        }} />
      ))}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'linear-gradient(135deg, #1a1025 0%, #2d1b36 100%)', 
      color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <FloatingPolaroid delay="0s" left="10%" top="15%" rotate="-15deg" />
        <FloatingPolaroid delay="2s" left="80%" top="10%" rotate="25deg" />
        <FloatingPolaroid delay="4s" left="15%" top="75%" rotate="-5deg" />
        <FloatingPolaroid delay="1s" left="85%" top="70%" rotate="10deg" />
        <FloatingPolaroid delay="3s" left="5%" top="45%" rotate="30deg" />
        <FloatingPolaroid delay="5s" left="90%" top="40%" rotate="-20deg" />

        {[
          { l: '25%', t: '10%' }, { l: '70%', t: '20%' }, { l: '10%', t: '30%' },
          { l: '90%', t: '60%' }, { l: '30%', t: '85%' }, { l: '80%', t: '80%' },
          { l: '5%', t: '90%' }, { l: '50%', t: '5%' }
        ].map((pos, i) => (
          <div key={i} className="floating-book" style={{ 
            position: 'absolute', left: pos.l, top: pos.t, 
            animationDelay: `${i * 0.5}s`, color: '#e8d5b5' 
          }}>
            <FlappingBookIcon />
          </div>
        ))}
      </div>

      <div className="dashboard-wrapper" style={{ width: '100%', maxWidth: '800px', background: 'rgba(255, 255, 255, 0.03)', padding: '20px 30px', borderRadius: '24px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1, maxHeight: '100%', overflow: 'hidden' }}>
        
        <h1 className="dashboard-title" style={{ textAlign: 'center', fontFamily: 'serif', fontSize: '2rem', marginBottom: '5px', color: '#e8d5b5', flexShrink: 0 }}>Craft Your Story</h1>
        <p className="dashboard-subtitle" style={{ textAlign: 'center', color: '#dcc6d2', opacity: 0.8, marginBottom: '20px', fontStyle: 'italic', flexShrink: 0 }}>Design a magical 3D memory album for your friends, family, or someone special</p>
        
        <div style={{ flexShrink: 0 }}>
          {renderStepIndicators()}
        </div>

        {step === 1 && (
          <div className="step-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s', flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <div>
              <label className="dashboard-label" style={{ display: 'block', marginBottom: '10px', color: '#e8d5b5', fontWeight: 'bold' }}>Album Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Our Summer Memories"
                style={{ width: '100%', padding: '15px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', color: '#fff', fontSize: '1.1rem', outline: 'none' }}
              />
            </div>
            <div>
              <label className="dashboard-label" style={{ display: 'block', marginBottom: '10px', color: '#e8d5b5', fontWeight: 'bold' }}>Upload Your Photos (Max 30)</label>
              <div 
                className="upload-box"
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%', padding: '40px', background: 'rgba(212,175,55,0.05)', border: '2px dashed rgba(212,175,55,0.4)', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', color: '#e8d5b5', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.05)'}
              >
                {draftMemories.length > 0 ? `✨ ${draftMemories.length} beautiful memories selected` : 'Click here to select your favorite photos'}
              </div>
              <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleFiles} style={{ display: 'none' }} />
            </div>
            <button 
              className="next-btn"
              disabled={!title || draftMemories.length === 0} 
              onClick={() => setStep(2)}
              style={{ alignSelf: 'flex-end', marginTop: '20px', padding: '15px 40px', background: 'linear-gradient(45deg, #d4af37, #f3e5ab)', border: 'none', borderRadius: '30px', color: '#1a1025', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', opacity: (!title || draftMemories.length === 0) ? 0.5 : 1, boxShadow: '0 4px 15px rgba(212,175,55,0.3)' }}
            >
              Next: Arrange Memories &rarr;
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s', flex: 1, overflow: 'hidden' }}>
            <p style={{ color: '#dcc6d2', opacity: 0.9, textAlign: 'center', flexShrink: 0, margin: 0 }}>Add sweet notes to each photo. Drag up/down to rearrange.</p>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: '10px', minHeight: 0 }}>
              {draftMemories.map((draft, i) => (
                <div key={draft.id} style={{ display: 'flex', gap: '15px', background: 'rgba(0,0,0,0.4)', padding: '15px', borderRadius: '12px', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                    <button onClick={() => moveMemory(i, -1)} disabled={i === 0} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: i === 0 ? 'not-allowed' : 'pointer', opacity: i === 0 ? 0.3 : 1, padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>▲</button>
                    <button onClick={() => moveMemory(i, 1)} disabled={i === draftMemories.length - 1} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: i === draftMemories.length - 1 ? 'not-allowed' : 'pointer', opacity: i === draftMemories.length - 1 ? 0.3 : 1, padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>▼</button>
                  </div>
                  <img src={draft.photoUrl} alt="preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid rgba(212,175,55,0.3)' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <textarea 
                      value={draft.quote}
                      onChange={(e) => {
                        const newDrafts = [...draftMemories];
                        newDrafts[i].quote = e.target.value;
                        setDraftMemories(newDrafts);
                      }}
                      placeholder="Write a sweet note..."
                      style={{ width: '100%', height: '60px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', resize: 'none', fontSize: '0.95rem', outline: 'none' }}
                    />
                    <button onClick={() => setRandomQuote(i)} style={{ alignSelf: 'flex-start', background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', color: '#e8d5b5', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      ✨ Surprise Me
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', flexShrink: 0, paddingBottom: '10px' }}>
              <button onClick={() => setStep(1)} style={{ padding: '15px 30px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', color: '#fff', cursor: 'pointer' }}>&larr; Back</button>
              <button onClick={() => setStep(3)} style={{ padding: '15px 40px', background: 'linear-gradient(45deg, #d4af37, #f3e5ab)', border: 'none', borderRadius: '30px', color: '#1a1025', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(212,175,55,0.3)' }}>
                Next: The Keepsake &rarr;
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s', flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <p style={{ color: '#dcc6d2', opacity: 0.9, textAlign: 'center' }}>Customize the glowing wooden frame sitting on the desk.</p>
            
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#e8d5b5', fontWeight: 'bold' }}>Frame Photo</label>
              <div 
                onClick={() => frameFileInputRef.current?.click()}
                style={{ width: '100%', padding: '20px', background: 'rgba(212,175,55,0.05)', border: '2px dashed rgba(212,175,55,0.4)', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', color: '#e8d5b5' }}
              >
                {framePhotoUrl ? '✨ Perfect photo selected' : 'Click to select your favorite photo'}
              </div>
              <input type="file" ref={frameFileInputRef} accept="image/*" onChange={handleFrameFile} style={{ display: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#e8d5b5', fontWeight: 'bold' }}>Engraved Message</label>
              <textarea 
                value={frameText}
                onChange={(e) => setFrameText(e.target.value)}
                maxLength={300}
                style={{ width: '100%', height: '120px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.3)', color: '#f3e5ab', padding: '15px', borderRadius: '12px', resize: 'none', fontFamily: 'serif', textAlign: 'center', fontSize: '1.1rem', outline: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', flexShrink: 0, paddingBottom: '10px' }}>
              <button onClick={() => setStep(2)} style={{ padding: '15px 30px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', color: '#fff', cursor: 'pointer' }}>&larr; Back</button>
              <button 
                disabled={!framePhotoUrl}
                onClick={() => setStep(4)} 
                style={{ padding: '15px 40px', background: 'linear-gradient(45deg, #d4af37, #f3e5ab)', border: 'none', borderRadius: '30px', color: '#1a1025', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', opacity: !framePhotoUrl ? 0.5 : 1, boxShadow: '0 4px 15px rgba(212,175,55,0.3)' }}
              >
                Next: A Special Note &rarr;
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s', flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <p style={{ color: '#dcc6d2', opacity: 0.9, textAlign: 'center', flexShrink: 0 }}>Write a letter they will open at the very end.</p>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['vintage', 'normal', 'sticky'] as LetterStyle[]).map(style => (
                <button 
                  key={style}
                  onClick={() => setLetterStyle(style)}
                  style={{ flex: 1, padding: '12px', background: letterStyle === style ? '#d4af37' : 'rgba(255,255,255,0.1)', color: letterStyle === style ? '#1a1025' : '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', textTransform: 'capitalize', fontWeight: letterStyle === style ? 'bold' : 'normal' }}
                >
                  {style} Paper
                </button>
              ))}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#e8d5b5', fontWeight: 'bold' }}>Need inspiration?</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['love', 'friendship', 'adventure', 'growth'] as LetterCategory[]).map(cat => (
                  <button 
                    key={cat}
                    onClick={() => handleRandomizeLetter(cat)}
                    style={{ background: 'rgba(212,175,55,0.1)', border: letterCategory === cat ? '1px solid #d4af37' : '1px solid transparent', color: '#e8d5b5', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', textTransform: 'capitalize' }}
                  >
                    ✨ {cat}
                  </button>
                ))}
              </div>
            </div>

            <textarea 
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
              maxLength={letterStyle === 'sticky' ? 100 : 3000}
              style={{ width: '100%', height: '180px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.3)', color: '#fff', padding: '15px', borderRadius: '12px', resize: 'none', fontFamily: letterStyle === 'vintage' ? 'serif' : 'sans-serif', fontSize: '1.05rem', outline: 'none' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', flexShrink: 0, paddingBottom: '10px' }}>
              <button onClick={() => setStep(3)} style={{ padding: '15px 30px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', color: '#fff', cursor: 'pointer' }}>&larr; Back</button>
              <button 
                onClick={handleCreate} 
                style={{ padding: '15px 40px', background: 'linear-gradient(45deg, #d4af37, #f3e5ab)', border: 'none', borderRadius: '30px', color: '#1a1025', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 20px rgba(212,175,55,0.5)', animation: 'pulse 2s infinite' }}
              >
                Launch Magic Album ✨
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { box-shadow: 0 4px 20px rgba(212,175,55,0.5); } 50% { box-shadow: 0 4px 30px rgba(212,175,55,0.8); } 100% { box-shadow: 0 4px 20px rgba(212,175,55,0.5); } }
        @keyframes flapLeft { 0%, 100% { transform: perspective(300px) rotateY(0deg); } 50% { transform: perspective(300px) rotateY(50deg); } }
        @keyframes flapRight { 0%, 100% { transform: perspective(300px) rotateY(0deg); } 50% { transform: perspective(300px) rotateY(-50deg); } }
        .left-wing { animation: flapLeft 1.2s ease-in-out infinite; }
        .right-wing { animation: flapRight 1.2s ease-in-out infinite; }
        @keyframes floatBook { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .floating-book { animation: floatBook 6s ease-in-out infinite; }
        @keyframes floatPolaroid { 0%, 100% { transform: translateY(0) rotate(var(--rot)); } 50% { transform: translateY(-30px) rotate(calc(var(--rot) + 5deg)); } }
        .floating-polaroid { animation: floatPolaroid 8s ease-in-out infinite; }
      `}} />
    </div>
  );
}
