import { useRef, useEffect, useState, Suspense, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { gsap } from '@/lib/gsapConfig';
import { Image as DreiImage, Text } from '@react-three/drei';
import { useLoader, useThree, useFrame } from '@react-three/fiber';
import { useMemoryStore } from '@/stores/useMemoryStore';
import HeartsParticles from './particles/HeartsParticles';
import type { MemoryItem, AlbumLetter } from '@/types';

interface BookPageProps {
  index: number;
  totalPages: number;
  isFlipped: boolean;
  isActive?: boolean;
  bookWidth: number;
  bookHeight: number;
  bookDepth: number;
  pageInset: number;
  frontMemory?: MemoryItem;
  backMemory?: MemoryItem;
  isLetterPage?: boolean;
  letterConfig?: AlbumLetter;
}

function PolaroidContent({ memory, isZoomed }: { memory: MemoryItem, isZoomed?: boolean }) {
  const texture = useLoader(THREE.TextureLoader, memory.photoUrl);
  const frameMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const photoMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const fullText = memory.quote || memory.caption || "";
  const [displayText, setDisplayText] = useState(isZoomed ? "" : fullText);

  useEffect(() => {
    if (isZoomed) {
      setDisplayText(""); 
      const timer = setTimeout(() => {
        let currentText = "";
        let i = 0;
        const interval = setInterval(() => {
          currentText += fullText.charAt(i);
          setDisplayText(currentText);
          i++;
          if (i >= fullText.length) {
            clearInterval(interval);
          }
        }, 50); 
        return () => clearInterval(interval);
      }, 2000); // Start typing when hearts pop
      return () => clearTimeout(timer);
    } else {
      setDisplayText(fullText);
    }
  }, [isZoomed, fullText]);

  useFrame((_, delta) => {
    const target = isZoomed ? 0.8 : 0;
    if (frameMatRef.current) {
      frameMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(frameMatRef.current.emissiveIntensity, target, delta * 5);
    }
    if (photoMatRef.current) {
      photoMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(photoMatRef.current.emissiveIntensity, target, delta * 5);
    }
  });
  
  // Full-page sizing
  const maxW = 1.2;
  const maxH = 1.2;
  const ratio = texture.image.width / texture.image.height;
  
  let w = maxW;
  let h = maxH;
  if (ratio > 1) {
    h = w / ratio;
  } else {
    w = h * ratio;
  }

  const frameW = w + 0.1;
  const frameH = h + 0.35; // Extra space at the bottom for quotes

  return (
    <>
      <mesh receiveShadow castShadow>
        <planeGeometry args={[frameW, frameH]} />
        <meshStandardMaterial 
          ref={frameMatRef}
          color="#ffffff" 
          roughness={0.9} 
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Shift photo slightly up to leave room for text at bottom */}
      <mesh position={[0, 0.12, 0.001]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial 
          ref={photoMatRef}
          map={texture} 
          roughness={0.5} 
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>

      <Text 
        position={[0, -frameH / 2 + 0.12, 0.001]} 
        fontSize={Math.max(0.045, w * 0.05)} 
        color="#000000" 
        maxWidth={w * 0.9}
        textAlign="center"
        lineHeight={1.2}
      >
        {displayText}
      </Text>
    </>
  );
}

function Polaroid3D({ memory, position, rotation }: { memory: MemoryItem, position: [number, number, number], rotation: [number, number, number] }) {
  const { camera } = useThree();
  const zoomedMemoryId = useMemoryStore(s => s.zoomedMemoryId);
  const setZoomedMemory = useMemoryStore(s => s.setZoomedMemory);
  
  const isZoomed = zoomedMemoryId === memory.id;
  const groupRef = useRef<THREE.Group>(null);
  const bgMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((_, delta) => {
    if (bgMatRef.current) {
      const target = isZoomed ? 0.75 : 0;
      bgMatRef.current.opacity = THREE.MathUtils.lerp(bgMatRef.current.opacity, target, delta * 4);
    }
  });

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    if (isZoomed) {
      setZoomedMemory(null);
    } else {
      setZoomedMemory(memory.id);
    }
  }, [isZoomed, memory.id, setZoomedMemory]);

  useEffect(() => {
    if (!groupRef.current) return;

    if (isZoomed) {
      // Fly to camera
      const parent = groupRef.current.parent!;
      parent.updateWorldMatrix(true, false);
      const parentInv = parent.matrixWorld.clone().invert();

      const camPos = new THREE.Vector3();
      const camDir = new THREE.Vector3();
      camera.getWorldPosition(camPos);
      camera.getWorldDirection(camDir);
      
      const worldTarget = camPos.clone().add(camDir.clone().multiplyScalar(1.45));
      const localTarget = worldTarget.applyMatrix4(parentInv);

      const camQuat = new THREE.Quaternion();
      camera.getWorldQuaternion(camQuat);
      const parentQuat = new THREE.Quaternion();
      parent.getWorldQuaternion(parentQuat);
      
      const localQuat = parentQuat.clone().invert().multiply(camQuat);
      const localEuler = new THREE.Euler().setFromQuaternion(localQuat);

      const tl = gsap.timeline();
      tl.to(groupRef.current.position, {
        x: localTarget.x, y: localTarget.y, z: localTarget.z,
        duration: 1.5, ease: "power3.inOut"
      });
      tl.to(groupRef.current.rotation, {
        x: localEuler.x, y: localEuler.y, z: localEuler.z,
        duration: 1.5, ease: "power3.inOut"
      }, "<");
      tl.to(groupRef.current.scale, {
        x: 0.75, y: 0.75, z: 0.75,
        duration: 1.5, ease: "power3.inOut"
      }, "<");
    } else {
      // Restore
      const tl = gsap.timeline();
      tl.to(groupRef.current.position, {
        x: 0, y: 0, z: 0,
        duration: 1.2, ease: "power3.inOut"
      });
      tl.to(groupRef.current.rotation, {
        x: 0, y: 0, z: 0,
        duration: 1.2, ease: "power3.inOut"
      }, "<");
      tl.to(groupRef.current.scale, {
        x: 1, y: 1, z: 1,
        duration: 1.2, ease: "power3.inOut"
      }, "<");
    }
  }, [isZoomed, camera, position, rotation]);

  return (
    <group 
      position={position} 
      rotation={rotation}
      onClick={handleClick}
    >
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <group ref={groupRef}>
          {/* HUGE DIMMING BACKDROP */}
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[25, 25]} />
            <meshBasicMaterial ref={bgMatRef} color="#000000" transparent opacity={0} depthWrite={false} />
          </mesh>
          <Suspense fallback={
            <mesh receiveShadow castShadow>
              <planeGeometry args={[0.9, 1.1]} />
              <meshStandardMaterial color="#ffffff" roughness={0.9} />
            </mesh>
          }>
            <PolaroidContent memory={memory} isZoomed={isZoomed} />
            <HeartsParticles isZoomed={isZoomed} />
          </Suspense>
        </group>
      </group>
    </group>
  );
}

function LetterPage3D({ position, rotation, letterConfig, isActive }: { position: [number, number, number], rotation: [number, number, number], letterConfig?: AlbumLetter, isActive?: boolean }) {
  const isVintage = letterConfig?.style === 'vintage';
  const isSticky = letterConfig?.style === 'sticky';
  const [phase, setPhase] = useState<'closed' | 'open' | 'reading'>('closed');
  const flapRef = useRef<THREE.Group>(null);
  const letterRef = useRef<THREE.Group>(null);
  const paperRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  // Envelope dimensions
  const envW = 0.9;
  const envH = 0.55;
  const envThick = 0.012;

  // Colors
  const envelopeColor = isVintage ? '#a67c52' : '#f8f9fa';
  const envelopeDark = isVintage ? '#8b6234' : '#e9ecef';
  const letterColor = isVintage ? '#f5e6c8' : '#ffffff';
  const textColor = isVintage ? '#2d1a05' : '#1a1a1a';
  const sealColor = '#8b1a1a';
  const sealHighlight = '#c43c3c';

  // Saved "open" resting position for letter
  const openLetterY = 0.2; // Ensures the bottom of the 0.53h letter stays safely behind the bottom fold (Y=0)
  const letW = 0.45; // Portrait width
  const letH = 0.53; // Portrait height (fits snugly inside envH 0.55)

  // === Geometry shapes ===

  const envelopeShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-envW / 2, -envH / 2);
    s.lineTo(envW / 2, -envH / 2);
    s.lineTo(envW / 2, envH / 2);
    s.lineTo(-envW / 2, envH / 2);
    s.closePath();
    return s;
  }, []);

  const flapShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-envW / 2, 0);
    s.lineTo(envW / 2, 0);
    s.lineTo(0, -envH * 0.65);
    s.closePath();
    return s;
  }, []);

  const leftFold = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-envW / 2, -envH / 2);
    s.lineTo(-envW / 2, envH / 2);
    s.lineTo(0, 0);
    s.closePath();
    return s;
  }, []);

  const rightFold = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(envW / 2, -envH / 2);
    s.lineTo(envW / 2, envH / 2);
    s.lineTo(0, 0);
    s.closePath();
    return s;
  }, []);

  const bottomFold = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-envW / 2, -envH / 2);
    s.lineTo(envW / 2, -envH / 2);
    s.lineTo(envW * 0.15, 0);
    s.lineTo(-envW * 0.15, 0);
    s.closePath();
    return s;
  }, []);

  const setGlobalLetterPhase = useMemoryStore(s => s.setLetterPhase);

  // === Phase transitions ===
  useEffect(() => {
    setGlobalLetterPhase(phase);
    if (!letterRef.current || !flapRef.current) return;

    if (phase === 'open' && isActive !== false) {
      if (isSticky) {
        if (paperRef.current) gsap.to(paperRef.current.scale, { y: 1, duration: 0.8, ease: "back.out(1.5)" });
      } else {
        const tl = gsap.timeline();
        // Flap opens backward (negative rotation around X swings it UP and towards the back)
        tl.to(flapRef.current.rotation, { x: -Math.PI * 0.95, duration: 0.8, ease: "power2.inOut" });
        // Letter slides up out of envelope, AND moves forward in Z so it rests ON TOP of the opened flap
        tl.to(letterRef.current.position, { y: openLetterY, z: 0.012, duration: 1.0, ease: "power3.out" }, "-=0.3");
      }
    } else if (phase === 'reading' && isActive !== false && !isSticky) {
      // Fly the 3D letter to fill the camera view
      const parent = letterRef.current.parent!;
      parent.updateWorldMatrix(true, false);
      const parentInv = parent.matrixWorld.clone().invert();

      // Target: 1.0 unit in front of camera
      const camPos = new THREE.Vector3();
      const camDir = new THREE.Vector3();
      camera.getWorldPosition(camPos);
      camera.getWorldDirection(camDir);
      const worldTarget = camPos.clone().add(camDir.clone().multiplyScalar(1.0));
      const localTarget = worldTarget.applyMatrix4(parentInv);

      // Compute rotation so letter faces the camera
      const camQuat = new THREE.Quaternion();
      camera.getWorldQuaternion(camQuat);
      const parentQuat = new THREE.Quaternion();
      parent.getWorldQuaternion(parentQuat);
      const localQuat = parentQuat.clone().invert().multiply(camQuat);
      const localEuler = new THREE.Euler().setFromQuaternion(localQuat);

      const tl = gsap.timeline();
      tl.to(letterRef.current.position, {
        x: localTarget.x, y: localTarget.y, z: localTarget.z,
        duration: 1.5, ease: "power3.inOut"
      });
      tl.to(letterRef.current.rotation, {
        x: localEuler.x, y: localEuler.y, z: localEuler.z,
        duration: 1.5, ease: "power3.inOut"
      }, "<");
      tl.to(letterRef.current.scale, {
        x: 1.4, y: 1.4, z: 1.4,
        duration: 1.5, ease: "power3.inOut"
      }, "<");
    } else if (isActive === false && phase !== 'closed') {
      // Reset everything instantly
      setPhase('closed');
      gsap.set(flapRef.current.rotation, { x: 0 });
      gsap.set(letterRef.current.position, { x: 0, y: 0, z: 0.0005 });
      gsap.set(letterRef.current.rotation, { x: 0, y: 0, z: 0 });
      gsap.set(letterRef.current.scale, { x: 1, y: 1, z: 1 });
    }
  }, [phase, isSticky, isActive, camera, openLetterY, envThick, setGlobalLetterPhase]);

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    if (phase === 'closed') {
      setPhase('open');
    } else if (phase === 'open') {
      if (!isSticky) setPhase('reading');
    } else if (phase === 'reading') {
      // Fly back to the "open" resting position
      if (!letterRef.current) return;
      const tl = gsap.timeline({ onComplete: () => setPhase('open') });
      tl.to(letterRef.current.position, {
        x: 0, y: openLetterY, z: 0.012,
        duration: 1.2, ease: "power3.inOut"
      });
      tl.to(letterRef.current.rotation, {
        x: 0, y: 0, z: 0,
        duration: 1.2, ease: "power3.inOut"
      }, "<");
      tl.to(letterRef.current.scale, {
        x: 1, y: 1, z: 1,
        duration: 1.2, ease: "power3.inOut"
      }, "<");
    }
  }, [phase, openLetterY, envThick]);

  if (isActive === false) return null;

  return (
    <group position={position} rotation={rotation} onClick={handleClick}>
      <group rotation={[-Math.PI / 2, 0, 0]}>

        {isSticky ? (
          /* ────── STICKY NOTE ────── */
          <group position={[0, -0.05, 0]}>
            <mesh ref={paperRef} position={[0, 0, 0.001]} scale={[1, 0.2, 1]} receiveShadow castShadow>
              <planeGeometry args={[0.55, 0.55]} />
              <meshStandardMaterial 
                color="#ffeb3b" 
                emissive="#ffeb3b" 
                emissiveIntensity={phase === 'reading' ? 0.6 : 0.25} 
                roughness={0.85} 
              />
            </mesh>
            <mesh position={[0, 0.05, 0.0015]} scale={[1, 0.2, 1]}>
              <planeGeometry args={[0.55, 0.003]} />
              <meshStandardMaterial color="#e6d534" transparent opacity={0.6} />
            </mesh>
            <group ref={letterRef} position={[0, 0, 0.002]}>
              <Text position={[0, 0, 0]} fontSize={0.026} color="#1a1a00" maxWidth={0.48} textAlign="center" lineHeight={1.5}>
                {phase !== 'closed' ? (letterConfig?.text || "A little note just for you 💛") : "Tap to unfold 📌"}
              </Text>
            </group>
          </group>
        ) : (
          /* ────── 3D ENVELOPE ────── */
          <group>

            {/* Envelope Back Body (Inside surface, darker) */}
            <mesh position={[0, 0, 0]} receiveShadow castShadow>
              <shapeGeometry args={[envelopeShape]} />
              <meshStandardMaterial color={envelopeDark} roughness={0.9} side={THREE.DoubleSide} />
            </mesh>

            {/* Letter paper — INSIDE the envelope, sandwiched between back and front flaps */}
            <group ref={letterRef} position={[0, 0, 0.0005]}>
              <mesh receiveShadow castShadow>
                <boxGeometry args={[letW, letH, 0.0001]} />
                <meshStandardMaterial 
                  color={letterColor} 
                  roughness={0.8} 
                  emissive={letterColor}
                  emissiveIntensity={phase === 'reading' ? 0.6 : 0.05} 
                />
              </mesh>
              <Text
                position={[0, 0, 0.0005]}
                fontSize={0.018}
                color={textColor}
                maxWidth={letW * 0.82}
                textAlign="center"
                lineHeight={1.6}
                anchorY="middle"
              >
                {letterConfig?.text || "Thank you for sharing this beautiful journey."}
              </Text>
            </group>

            {/* Front folds of the envelope */}
            <mesh position={[0, 0, 0.001]} receiveShadow castShadow>
              <shapeGeometry args={[leftFold]} />
              <meshStandardMaterial color={envelopeColor} roughness={0.85} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0, 0.001]} receiveShadow castShadow>
              <shapeGeometry args={[rightFold]} />
              <meshStandardMaterial color={envelopeColor} roughness={0.85} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0, 0.0015]} receiveShadow castShadow>
              <shapeGeometry args={[bottomFold]} />
              <meshStandardMaterial color={envelopeColor} roughness={0.85} side={THREE.DoubleSide} />
            </mesh>

            {/* Envelope Flap (hinges at top edge of envelope) */}
            <group position={[0, envH / 2, 0.002]} ref={flapRef}>
              <mesh receiveShadow castShadow>
                <shapeGeometry args={[flapShape]} />
                <meshStandardMaterial color={envelopeColor} roughness={0.85} side={THREE.DoubleSide} />
              </mesh>

              {/* Wax Seal — FLAT on the flap surface */}
              <group position={[0, -envH * 0.55, 0.001]}>
                {/* Outer seal disk (rotated so round face is flat) */}
                <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow castShadow>
                  <cylinderGeometry args={[0.065, 0.07, 0.002, 32]} />
                  <meshStandardMaterial color={sealColor} roughness={0.25} metalness={0.15} />
                </mesh>
                {/* Inner embossed circle */}
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.045, 0.045, 0.003, 24]} />
                  <meshStandardMaterial color={sealHighlight} roughness={0.3} metalness={0.1} />
                </mesh>
                {/* Cross emboss bar 1 */}
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                  <boxGeometry args={[0.055, 0.018, 0.004]} />
                  <meshStandardMaterial color={sealHighlight} roughness={0.35} />
                </mesh>
                {/* Cross emboss bar 2 */}
                <mesh rotation={[Math.PI / 2, Math.PI / 2, 0]} position={[0, 0, 0]}>
                  <boxGeometry args={[0.055, 0.018, 0.004]} />
                  <meshStandardMaterial color={sealHighlight} roughness={0.35} />
                </mesh>
              </group>
            </group>

          </group>
        )}

      </group>
    </group>
  );
}

export default function BookPage({ index, totalPages, isFlipped, isActive, bookWidth, bookHeight, bookDepth, pageInset, frontMemory, backMemory, isLetterPage, letterConfig }: BookPageProps) {
  const hingeRef = useRef<THREE.Group>(null);
  
  const pageWidth = bookWidth - pageInset * 2;
  // Dynamically scale page thickness so 32 pages perfectly fill the entire book depth
  const pageThickness = Math.min(0.0085, 0.26 / Math.max(1, totalPages));
  const pageDepth = bookDepth - pageInset * 2;
  const actualPageWidth = 1.41; // Tuned so pages beautifully reach the edges of the cover, closing the hollow gap
  const meshPositionX = actualPageWidth / 2 - 0.05; // Shift left so the holes (at x=0) are inside the paper

  const COVER_THICKNESS = 0.02; // Must match MemoryAlbumBook.tsx

  // KEY PHYSICS: each page's hinge is at its OWN Y level within the book.
  // Rotating +PI (anti-clockwise) mirrors X → -X while keeping Y exactly the same.
  // This makes pages stack directly under the cover on the left - no floating or sinking!
  const pageLocalY = bookHeight / 2 - COVER_THICKNESS - (index + 0.5) * pageThickness;

  useEffect(() => {
    if (!hingeRef.current) return;
    if (isFlipped) {
      // +PI = anti-clockwise: right edge sweeps UP, over, and lands on left at same height
      gsap.to(hingeRef.current.rotation, {
        z: Math.PI,
        duration: 1.3,
        ease: "power2.inOut",
        delay: index * 0.04
      });
    } else {
      gsap.to(hingeRef.current.rotation, {
        z: 0,
        duration: 1.1,
        ease: "power2.inOut",
        delay: 0
      });
    }
  }, [isFlipped, index]);

  return (
    // Hinge at the page's OWN Y. No subgroup offset needed.
    // +PI rotation mirrors page from right to left at the same height level.
    <group 
      ref={hingeRef} 
      position={[-0.64, pageLocalY, 0]}
    >
      <mesh 
        position={[meshPositionX, 0, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[actualPageWidth, pageThickness, pageDepth]} />
        <meshStandardMaterial color={isLetterPage ? "#f4e4bc" : "#f8f9fa"} roughness={0.8} />
      </mesh>
      
      {/* Punched Holes */}
      {Array.from({ length: 24 }).map((_, i) => {
        const z = -pageDepth / 2 + 0.05 + i * ((pageDepth - 0.1) / 23);
        return (
          <mesh key={`hole-page-${i}`} position={[0, 0, z]}>
            <cylinderGeometry args={[0.013, 0.013, pageThickness + 0.002, 16]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
        );
      })}

      {/* ── Content ── */}
      {frontMemory && (
        <Polaroid3D 
          memory={frontMemory} 
          position={[meshPositionX, pageThickness / 2 + 0.001, 0]} 
          rotation={[0, 0, 0]} 
        />
      )}
      {backMemory && (
        <Polaroid3D 
          memory={backMemory} 
          position={[meshPositionX, -pageThickness / 2 - 0.001, 0]} 
          rotation={[0, 0, Math.PI]} 
        />
      )}
      {isLetterPage && letterConfig && (
        <LetterPage3D
          position={[meshPositionX, pageThickness / 2 + 0.001, 0]}
          rotation={[0, 0, 0]}
          letterConfig={letterConfig}
          isActive={isActive}
        />
      )}
    </group>
  );
}
