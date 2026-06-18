'use client';

import { useState, useRef } from 'react';
import { useMemoryStore } from '@/stores/useMemoryStore';

// Camera SVG icon
const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

// Video record SVG icon
const RecordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

// Stop icon
const StopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <rect x="5" y="5" width="14" height="14" rx="2"/>
  </svg>
);

const btnBase: React.CSSProperties = {
  background: 'rgba(0,0,0,0.45)',
  color: '#d4af37',
  border: '1px solid rgba(212,175,55,0.5)',
  padding: '10px 18px',
  borderRadius: '30px',
  cursor: 'pointer',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
  pointerEvents: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: 'bold',
  fontSize: '0.85rem',
  letterSpacing: '0.5px',
};

export default function CaptureOverlay() {
  // ALL hooks must come before any early return
  const isReceiverMode = useMemoryStore(s => s.isReceiverMode);
  const setIsCapturing = useMemoryStore(s => s.setIsCapturing);
  const requestScreenshot = useMemoryStore(s => s.requestScreenshot);
  const isCapturing = useMemoryStore(s => s.isCapturing);

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [capturedMedia, setCapturedMedia] = useState<{ type: 'photo' | 'video', url: string } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Only show for receivers — but hooks must be ABOVE this line
  if (!isReceiverMode) return null;

  const takePhoto = () => {
    // Hide UI overlays first
    setIsCapturing(true);
    // Small delay so React hides overlays, then capture via R3F renderer
    setTimeout(() => {
      requestScreenshot((dataUrl) => {
        setCapturedMedia({ type: 'photo', url: dataUrl });
        setIsCapturing(false);
      });
    }, 80);
  };

  const startRecording = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    setIsCapturing(true);
    setIsRecording(true);
    setRecordSeconds(0);
    chunksRef.current = [];

    // Live timer
    timerRef.current = setInterval(() => {
      setRecordSeconds(s => s + 1);
    }, 1000);

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      setCapturedMedia({ type: 'video', url: videoUrl });
      setIsCapturing(false);
      setIsRecording(false);
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    // No auto-stop — user must press stop
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const shareMedia = () => {
    if (!capturedMedia) return;
    if (navigator.share) {
      fetch(capturedMedia.url).then(res => res.blob()).then(blob => {
        const file = new File([blob], capturedMedia.type === 'photo' ? 'memory.png' : 'memory.webm', { type: blob.type });
        navigator.share({ title: 'My Memory Album', text: 'A magical memory!', files: [file] })
          .catch(() => {});
      });
    } else {
      alert('Please download the file first, then share it!');
    }
  };

  return (
    <>
      {/* ── Stop button — always visible while recording, even if album closes ── */}
      {isRecording && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Live timer */}
          <div style={{
            background: 'rgba(0,0,0,0.6)',
            color: '#ff5555',
            border: '1px solid rgba(255,80,80,0.4)',
            borderRadius: '20px',
            padding: '8px 14px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(6px)',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4444', display: 'inline-block', animation: 'pulseRed 1s infinite' }} />
            {String(Math.floor(recordSeconds / 60)).padStart(2, '0')}:{String(recordSeconds % 60).padStart(2, '0')}
          </div>
          <button onClick={stopRecording} style={{ ...btnBase, color: '#ff5555', borderColor: 'rgba(255,80,80,0.5)' }}>
            <StopIcon /> Stop
          </button>
        </div>
      )}

      {/* ── Capture / Record buttons (hidden while recording or capturing) ── */}
      {!capturedMedia && !isCapturing && !isRecording && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 40, display: 'flex', gap: '0.75rem' }}>
          <button onClick={takePhoto} style={btnBase} title="Capture the scene">
            <CameraIcon /> Capture
          </button>
          <button onClick={startRecording} style={btnBase} title="Record video">
            <RecordIcon /> Record
          </button>
        </div>
      )}

      {/* ── Preview Modal ── */}
      {capturedMedia && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.92)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'auto'
        }}>
          <div style={{ maxWidth: '80%', maxHeight: '65vh', border: '2px solid #d4af37', borderRadius: '12px', overflow: 'hidden' }}>
            {capturedMedia.type === 'photo' ? (
              <img src={capturedMedia.url} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <video src={capturedMedia.url} autoPlay loop controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <a
              href={capturedMedia.url}
              download={capturedMedia.type === 'photo' ? 'memory.png' : 'memory.webm'}
              style={{ background: '#d4af37', color: '#1a1025', padding: '10px 24px', borderRadius: '20px', textDecoration: 'none', fontWeight: 'bold' }}
            >
              ⬇ Save
            </a>
            <button onClick={shareMedia} style={{ ...btnBase, background: 'rgba(212,175,55,0.15)' }}>
              Share
            </button>
            <button onClick={() => setCapturedMedia(null)} style={{ ...btnBase, background: 'transparent', color: '#aaa', borderColor: 'rgba(255,255,255,0.2)' }}>
              ✕ Close
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulseRed {
          0% { box-shadow: 0 0 0 0 rgba(255,80,80,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(255,80,80,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,80,80,0); }
        }
      `}} />
    </>
  );
}
