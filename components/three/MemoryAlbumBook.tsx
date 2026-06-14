// ══════════════════════════════════════════════════════════════
// Memory Album Book — Highly detailed 3D book lying on the desk
// ══════════════════════════════════════════════════════════════

'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from '@/lib/gsapConfig';
import { useMemoryStore } from '@/stores/useMemoryStore';
import { Html } from '@react-three/drei';
import AnimeButterfly from '@/components/ui/AnimeButterfly';
import BookPage from './BookPage';
import type { MemoryAlbum } from '@/types';

interface MemoryAlbumBookProps {
  album: MemoryAlbum;
  position: [number, number, number];
}

interface SpiralBindingProps {
  length: number;
  r: number;
  thickness: number;
  color: string;
}

import { useMemo } from 'react';

function SpiralBinding({ length, r, thickness, color }: SpiralBindingProps) {
  const numRings = 24;
  const spacing = length / numRings;

  const path = useMemo(() => {
    const curve = new THREE.CurvePath<THREE.Vector3>();
    // Right side: vertical line passing directly through all the paper holes
    curve.add(new THREE.LineCurve3(new THREE.Vector3(0, -0.14, 0), new THREE.Vector3(0, 0.14, 0))); 
    
    // Top loop curving outwards (left) — made bigger!
    curve.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0.14, 0),
      new THREE.Vector3(0, 0.24, 0),
      new THREE.Vector3(-0.18, 0.24, 0),
      new THREE.Vector3(-0.18, 0.14, 0)
    ));
    
    // Left side: vertical line outside the book — further left!
    curve.add(new THREE.LineCurve3(new THREE.Vector3(-0.18, 0.14, 0), new THREE.Vector3(-0.18, -0.14, 0))); 
    
    // Bottom loop (tightly curves into the spine horizontally without dipping below the book's bottom cover)
    curve.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.18, -0.14, 0),
      new THREE.Vector3(-0.18, -0.15, 0),
      new THREE.Vector3(0, -0.15, 0),
      new THREE.Vector3(0, -0.14, 0)
    ));
    return curve;
  }, []);

  return (
    <group>
      {Array.from({ length: numRings }).map((_, i) => {
        const z = -length / 2 + i * spacing + spacing / 2;
        return (
          <mesh
            key={i}
            position={[-0.64, 0, z]} // Place the vertical part perfectly at the hinge hole x=-0.64
            rotation={[0, 0, 0]}
            castShadow
          >
            <tubeGeometry args={[path, 32, thickness, 8, true]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function MemoryAlbumBook({ album, position }: MemoryAlbumBookProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coverHingeRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const selectAlbum = useMemoryStore((s) => s.selectAlbum);
  const selectedAlbumId = useMemoryStore((s) => s.selectedAlbumId);
  const currentPage = useMemoryStore((s) => s.currentPage);
  const isSelected = selectedAlbumId === album.id;

  // Adjusted dimensions for 20 physical pages
  const width = 1.5; // Wider to create a finger gap
  // Shift cover left so its left edge sits exactly at -0.11 locally -> -0.75 world -> perfectly touching the curved spine!
  const coverMeshX = width / 2 - 0.11;
  const height = 0.3; // Thicker book to hold the pages
  const depth = 2.0;
  const coverThickness = 0.02;
  const pageInset = 0.03;
  // Static block takes up the bottom portion of the book
  const staticPagesHeight = 0.18;
  const staticPagesY = -0.05;

  // Calculate resting Y so the bottom of the book sits perfectly on the desk
  // The position passed from the parent already sets the physical table surface correctly.
  const restingY = position[1] + height / 2;

  useFrame(() => {
    if (!groupRef.current || isSelected) return;
    const targetY = hovered ? restingY + 0.06 : restingY;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.1;
  });

  useEffect(() => {
    if (!coverHingeRef.current) return;

    if (isSelected) {
      // Magic opening - swings open and tilts slightly so the far edge rests perfectly on the desk!
      gsap.to(coverHingeRef.current.rotation, {
        z: Math.PI, // +PI = anti-clockwise, right edge sweeps UP and OVER to the left
        duration: 2.0,
        ease: "power2.inOut",
        delay: 0.5
      });
    } else {
      gsap.to(coverHingeRef.current.rotation, {
        z: 0,
        duration: 1.5,
        ease: "power2.inOut"
      });
    }
  }, [isSelected]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!isSelected) {
      selectAlbum(album.id);
    }
  };

  return (
    <group
      ref={groupRef}
      position={[position[0], isSelected ? restingY : (hovered ? restingY + 0.06 : restingY), position[2]]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
      onClick={handleClick}
    >
      {/* Butterfly Anchor */}
      <Html position={[0, height / 2 + 0.1, 0.5]} center>
        <AnimeButterfly delay={1000} />
      </Html>

      {/* ── Interactive Flipping Pages ── */}
      {/* We dynamically generate exactly 32 physical pages to make the book look full */
      }
      {(() => {
        const numPhotos = (album.memories || []).length;
        const maxFlippablePages = numPhotos + 1; // 1 photo per page so left side is blank
        const totalPages = 32;

        return Array.from({ length: totalPages }).map((_, i) => {
          const isLetterPage = i === maxFlippablePages - 1;
          const isContentPage = i < maxFlippablePages;
          // Left side is completely blank! Right side has the memory.
          const frontMem = isContentPage && !isLetterPage ? (album.memories || [])[i] : undefined;
          const backMem = undefined;
          const isFlipped = i < currentPage;
          const isActive = isSelected && (i === currentPage || i === currentPage - 1);

          return (
            <BookPage
              key={i}
              index={i}
              totalPages={totalPages}
              isFlipped={isFlipped}
              isActive={isActive}
              bookWidth={width}
              bookHeight={height}
              bookDepth={depth}
              pageInset={pageInset}
              frontMemory={frontMem}
              backMemory={backMem}
              isLetterPage={isLetterPage}
              letterConfig={album.letter}
            />
          );
        });
      })()}

      {/* Spiral wire ring binding (always visible to look connected) */}
      <SpiralBinding 
        length={depth - pageInset * 2} 
        r={0.16} 
        thickness={0.013}  
        color="#d4af37" // Beautiful golden steel color to match the cover title gilding!
      />

      {/* ── Curved Spine (Static) ── */}
      <mesh position={[-width / 2, 0, 0]} rotation={[Math.PI / 2, Math.PI, 0]} castShadow>
        <cylinderGeometry args={[height / 2, height / 2, depth, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={album.coverColor} roughness={0.4} />
      </mesh>

      {/* ── Back Cover (Static) ── */}
      {/* We use a group at the hinge [ -0.64, 0, 0 ] to mathematically align all elements */}
      <group position={[-0.64, 0, 0]}>
        <mesh position={[coverMeshX, -height / 2 + coverThickness / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, coverThickness, depth]} />
          <meshStandardMaterial color={album.coverColor} roughness={0.6} />
        </mesh>
        
        {/* Back Cover Punched Holes */}
        {Array.from({ length: 24 }).map((_, i) => {
          const z = -depth / 2 + pageInset + 0.05 + i * ((depth - pageInset * 2 - 0.1) / 23);
          return (
            <mesh key={`hole-back-${i}`} position={[0, -height / 2 + coverThickness / 2, z]}>
              <cylinderGeometry args={[0.012, 0.012, coverThickness + 0.002, 16]} />
              <meshBasicMaterial color="#1a1a1a" />
            </mesh>
          );
        })}
      </group>

      {/* ── Front Cover (Hinged) ── */}
      {/* CENTER PIVOT physics: hinge at y=0 (book center).
          Cover mesh offset UP to y=+0.14.
          After +PI rotation: cover lands at y=-0.14 (desk level = bottom of left stack).
          Pages stack ON TOP of cover on the left. Correct! */}
      <group 
        ref={coverHingeRef} 
        position={[-0.64, 0, 0]}
      >
        <mesh position={[coverMeshX, height / 2 - coverThickness / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, coverThickness, depth]} />
          <meshStandardMaterial color={album.coverColor} roughness={0.7} />
        </mesh>
        
        {/* Front Cover Punched Holes */}
        {Array.from({ length: 24 }).map((_, i) => {
          const z = -depth / 2 + pageInset + 0.05 + i * ((depth - pageInset * 2 - 0.1) / 23);
          return (
            <mesh key={`hole-front-${i}`} position={[0, height / 2 - coverThickness / 2, z]}>
              <cylinderGeometry args={[0.014, 0.014, coverThickness + 0.004, 16]} />
              <meshBasicMaterial color="#1a1a1a" />
            </mesh>
          );
        })}
        
        {/* Title Text - on top face */}
        <Text
          position={[coverMeshX, height / 2 + 0.002, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.15}
          color="#d4af37"
          anchorX="center"
          anchorY="middle"
        >
          {album.title}
        </Text>
      </group>

      {/* Magical glow */}
      {hovered && !isSelected && (
        <pointLight position={[0, 1, 0]} intensity={1} color={album.coverColor} distance={2} />
      )}
    </group>
  );
}
