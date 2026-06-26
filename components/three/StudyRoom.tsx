// ══════════════════════════════════════════════════════════════
// Study Room — The Library of Memories
// ══════════════════════════════════════════════════════════════
import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame, createPortal } from '@react-three/fiber';
import { Environment, MeshReflectorMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from '@/lib/gsapConfig';
import { COLORS, SCENE, DEMO_ALBUMS } from '@/lib/constants';
import { useMemoryStore } from '@/stores/useMemoryStore';
import MemoryAlbumBook from './MemoryAlbumBook';
import WoodenPhotoFrame from './WoodenPhotoFrame';
import StringLights from './StringLights';
import DustParticles from './particles/DustParticles';
import type { MemoryAlbum } from '@/types';

// Complex procedural materials
const stoneColor = "#1a1816";
const woodDark = "#2a1c12";
const woodMid = "#3d2b1f";
const woodLight = "#5c4033";
const gold = "#a67c00";

function CandleFlame({ position, scale = 1, lightIntensity = 6.0 }: { position: [number, number, number], scale?: number, lightIntensity?: number }) {
  const flameRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state: any) => {
    if (!flameRef.current || !lightRef.current) return;
    const t = state.clock.elapsedTime;
    
    // Flicker intensity
    const intensity = lightIntensity + Math.sin(t * 12) * 0.2 + Math.sin(t * 7) * 0.3;
    lightRef.current.intensity = intensity;
    
    // Tiny wind movement
    flameRef.current.position.x = position[0] + Math.sin(t * 3) * 0.01;
    flameRef.current.position.z = position[2] + Math.cos(t * 4) * 0.01;
    
    // Subtle scaling for dancing flame
    const s = scale * (1 + Math.sin(t * 8) * 0.1);
    flameRef.current.scale.set(scale, s, scale);
  });

  return (
    <group ref={flameRef} position={position}>
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.04, 0.15, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.6} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 0]} distance={15} color="#ffaa00" castShadow shadow-bias={-0.001} />
    </group>
  );
}

function GlassCandle({ position, color }: { position: [number, number, number], color: string }) {
  const isMobile = useMemoryStore(s => s.isMobile);

  return (
    <group position={position}>
      {/* Glass Jar */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.2, 16]} />
        {isMobile ? (
          <meshStandardMaterial color="#ffffff" transparent opacity={0.3} roughness={0.1} />
        ) : (
          <meshPhysicalMaterial 
            transmission={0.9} 
            opacity={1} 
            metalness={0.1} 
            roughness={0.1} 
            ior={1.5} 
            thickness={0.05} 
            color="#ffffff" 
            transparent
          />
        )}
      </mesh>
      {/* Colored Wax */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.4} />
      </mesh>
      <CandleFlame position={[0, 0.2, 0]} scale={0.7} lightIntensity={isMobile ? 0.8 : 1.5} />
    </group>
  );
}

function FlowerVase({ position }: { position: [number, number, number] }) {
  const h = 0.4; // pot height
  const r = 0.25; // pot radius
  const numStripes = 5;
  const step = h / numStripes;

  // Horizontal striped pot
  const pot = Array.from({ length: numStripes }).map((_, i) => (
    <mesh key={i} position={[0, i * step + step / 2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[r, r - (i === 0 ? 0.02 : 0), step, 32]} />
      <meshStandardMaterial color={i % 2 === 0 ? "#ffffff" : "#1a1a1a"} roughness={0.6} />
    </mesh>
  ));

  // Plant stems, leaves, flowers
  const plant = Array.from({ length: 6 }).map((_, i) => {
    const angle = (i / 6) * Math.PI * 2;
    const tilt = Math.PI / 8 + Math.random() * 0.15;
    const height = 0.3 + Math.random() * 0.3;
    return (
      <group key={'stem'+i} position={[0, h, 0]} rotation={[0, angle, tilt]}>
        {/* Stem */}
        <mesh position={[0, height / 2, 0]} castShadow>
          <cylinderGeometry args={[0.008, 0.015, height, 8]} />
          <meshStandardMaterial color="#2d5a27" roughness={0.8} />
        </mesh>
        
        {/* Leaves */}
        <mesh position={[0.05, height * 0.4, 0]} rotation={[0, 0, -Math.PI/4]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} scale={[1, 0.2, 0.5]} />
          <meshStandardMaterial color="#3a7033" roughness={0.6} />
        </mesh>
        <mesh position={[-0.05, height * 0.7, 0]} rotation={[0, 0, Math.PI/4]} castShadow>
          <sphereGeometry args={[0.05, 8, 8]} scale={[1, 0.2, 0.5]} />
          <meshStandardMaterial color="#3a7033" roughness={0.6} />
        </mesh>

        {/* Pink Flowers */}
        <group position={[0, height, 0]} rotation={[Math.random(), Math.random(), 0]}>
          <mesh position={[0,0,0]} castShadow>
            <icosahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial color="#ff1493" roughness={0.4} />
          </mesh>
          <mesh position={[0.04, 0.04, 0]} castShadow>
            <icosahedronGeometry args={[0.06, 0]} />
            <meshStandardMaterial color="#ff69b4" roughness={0.4} />
          </mesh>
          <mesh position={[-0.04, -0.02, 0.04]} castShadow>
            <icosahedronGeometry args={[0.07, 0]} />
            <meshStandardMaterial color="#e75480" roughness={0.4} />
          </mesh>
        </group>
      </group>
    );
  });

  // String Lights wrapped around
  const fairyLights = Array.from({ length: 15 }).map((_, i) => {
    // Spiral up
    const t = i / 15;
    const a = t * Math.PI * 2 * 3; // 3 full turns
    const currentR = r * 0.8 * (1 - t * 0.3); // taper inwards
    const y = h + 0.05 + t * 0.5;
    const x = Math.cos(a) * currentR;
    const z = Math.sin(a) * currentR;
    
    return (
      <group key={'light'+i} position={[x, y, z]}>
        <mesh>
          <sphereGeometry args={[0.015, 8, 8]} />
          {/* Reduce bloom by using emissive with lower intensity instead of unlit bright color */}
          <meshStandardMaterial color="#ffeba1" emissive="#ffeba1" emissiveIntensity={0.4} />
        </mesh>
        {/* Point lights intensity reduced by ~30-40% */}
        {i % 3 === 0 && (
          <pointLight color="#ffeba1" intensity={0.3} distance={1.2} decay={2} />
        )}
      </group>
    );
  });

  return (
    <group position={position}>
      {pot}
      {/* Dirt */}
      <mesh position={[0, h - 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <circleGeometry args={[r - 0.01, 32]} />
        <meshStandardMaterial color="#1a0f00" roughness={1} />
      </mesh>
      {plant}
      {/* Fairy Lights */}
      {fairyLights}
    </group>
  );
}

function Desk() {
  const isMobile = useMemoryStore(s => s.isMobile);
  const quality = useMemoryStore(s => s.getQualitySettings)();

  return (
    <group position={[0, SCENE.study.deskY, SCENE.study.deskZ]}>
      {/* Heavy Desktop */}
      <mesh position={[0, 1.4, 0]} receiveShadow castShadow>
        <boxGeometry args={[9, 0.2, 4]} />
        <meshStandardMaterial color={woodDark} roughness={0.8} />
      </mesh>
      
      {/* Desk Skirt & Drawers */}
      <mesh position={[0, 1.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[8.6, 0.3, 3.6]} />
        <meshStandardMaterial color={woodMid} roughness={0.9} />
      </mesh>
      
      {/* Drawer Details & Knobs */}
      {[-2.5, 0, 2.5].map((x, i) => (
        <group key={i} position={[x, 1.15, 1.85]}>
          <mesh castShadow>
            <boxGeometry args={[2.2, 0.25, 0.1]} />
            <meshStandardMaterial color={woodDark} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.1]} castShadow>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color={gold} metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Ornate Legs */}
      {[[-4, -1.6], [4, -1.6], [-4, 1.6], [4, 1.6]].map(([x, z], i) => (
        <group key={i} position={[x, 0.6, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.4, 1.2, 0.4]} />
            <meshStandardMaterial color={woodDark} />
          </mesh>
          {/* Leg base/cap */}
          <mesh position={[0, -0.5, 0]} castShadow>
            <boxGeometry args={[0.5, 0.2, 0.5]} />
            <meshStandardMaterial color={woodMid} />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.5, 0.2, 0.5]} />
            <meshStandardMaterial color={woodMid} />
          </mesh>
        </group>
      ))}

      {/* Desk Props (Stack of Papers) */}
      <group position={[-2.8, 1.5, 0.5]}>
        {[
          { y: 0.01, rot: 0.1, x: 0, z: 0 },
          { y: 0.02, rot: 0.15, x: 0.05, z: 0.02 },
          { y: 0.03, rot: -0.05, x: -0.05, z: 0.05 },
          { y: 0.04, rot: 0.2, x: 0.1, z: -0.05 },
          { y: 0.05, rot: 0.05, x: 0, z: 0.1 },
        ].map((paper, i) => (
          <mesh 
            key={i} 
            position={[paper.x, paper.y, paper.z]} 
            rotation={[0, paper.rot, 0]} 
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[1.6, 0.01, 2.2]} />
            <meshStandardMaterial color="#f8f8f8" roughness={0.9} />
          </mesh>
        ))}

        {/* Fountain Pen (Laid Flat on top of the papers) */}
        <group position={[0.1, 0.07, 0.1]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
          {/* Main Body */}
          <mesh position={[0, -0.1, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.015, 0.4, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.5} />
          </mesh>
          {/* Gold Band */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.021, 0.021, 0.05, 16]} />
            <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} />
          </mesh>
          {/* Nib Base */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.005, 0.1, 16]} />
            <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} />
          </mesh>
          {/* Nib Tip */}
          <mesh position={[0, 0.22, 0]} castShadow>
            <coneGeometry args={[0.01, 0.05, 16]} />
            <meshStandardMaterial color="#d4af37" roughness={0.1} metalness={1.0} />
          </mesh>
        </group>
      </group>
      
      {/* Vintage Writing Set (Ink & Fountain Pen) */}
      <group position={[-3.6, 1.5, 0.3]}>
        {/* Ink Bottle */}
        <group position={[0.2, 0, -0.1]}>
          {/* Base */}
          <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.15, 0.18, 0.2, 16]} />
            <meshPhysicalMaterial color="#050505" transmission={0.5} opacity={1} roughness={0.1} ior={1.5} thickness={0.5} transparent />
          </mesh>
          {/* Label */}
          <mesh position={[0, 0.1, 0.155]}>
            <planeGeometry args={[0.18, 0.08]} />
            <meshStandardMaterial color="#d4c4a8" />
          </mesh>
          {/* Label Text */}
          <Text position={[0, 0.1, 0.16]} fontSize={0.04} color="#2b1a10" fontWeight="bold">
            INK
          </Text>
          {/* Neck */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.1, 16]} />
            <meshStandardMaterial color="#8b6508" metalness={0.8} roughness={0.2} /> {/* Brass neck */}
          </mesh>
          {/* Cap/Stopper */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#8b6508" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </group>
      
      {/* Tall Candle (Moved between book and frame) */}
      <group position={[1.8, 1.55, -0.2]}>
        {/* Holder */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 0.1, 16]} />
          <meshStandardMaterial color={gold} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Wax (Taller) */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.7, 16]} />
          <meshStandardMaterial color="#fff3e0" roughness={0.4} />
        </mesh>
        <CandleFlame position={[0, 0.8, 0]} />
      </group>

      {/* Glass Candles on Corners */}
      {quality.candleCount > 2 && (
        <GlassCandle position={[-3.8, 1.5, -1.2]} color="#ff4444" /> /* Red wax */
      )}
      {quality.candleCount > 3 && (
        <GlassCandle position={[3.8, 1.5, -1.2]} color="#44ff44" /> /* Green wax */
      )}
      <GlassCandle position={[4.2, 1.5, 1.0]} color="#00bfff" /> {/* Sky Blue wax */}
      
      {/* Flower Vase with Fairy Lights (Pushed back to avoid book cover) */}
      <FlowerVase position={[-1.8
      
        , 1.5, -1.2
        ]} />
      
    </group>
  );
}

function Architecture() {
  return (
    <group>
      {/* Main Stone Wall */}
      <mesh position={[0, 5, -8]} receiveShadow>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color={stoneColor} roughness={1} />
      </mesh>

      {/* Wooden Wainscoting (Lower Wall Paneling) */}
      <group position={[0, 1.5, -7.9]}>
        <mesh receiveShadow>
          <boxGeometry args={[40, 3, 0.2]} />
          <meshStandardMaterial color={woodDark} roughness={0.8} />
        </mesh>
        {/* Panels */}
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={i} position={[-16.5 + i * 3, 0, 0.15]} receiveShadow>
            <boxGeometry args={[2.5, 2.5, 0.1]} />
            <meshStandardMaterial color={woodMid} roughness={0.8} />
          </mesh>
        ))}
        {/* Top Trim */}
        <mesh position={[0, 1.55, 0.1]} receiveShadow>
          <boxGeometry args={[40, 0.1, 0.3]} />
          <meshStandardMaterial color={woodLight} roughness={0.8} />
        </mesh>
      </group>

      {/* Giant Arches & Pillars (The Vaulted Ceiling Look) */}
      <group position={[-10, 0, -4]}>
        <mesh position={[0, 5, 0]} receiveShadow castShadow>
          <boxGeometry args={[2, 10, 2]} />
          <meshStandardMaterial color={stoneColor} roughness={0.9} />
        </mesh>
      </group>
      <group position={[10, 0, -4]}>
        <mesh position={[0, 5, 0]} receiveShadow castShadow>
          <boxGeometry args={[2, 10, 2]} />
          <meshStandardMaterial color={stoneColor} roughness={0.9} />
        </mesh>
      </group>
      {/* The Arch */}
      <mesh position={[0, 10, -4]} rotation={[0, 0, 0]} receiveShadow castShadow>
        <torusGeometry args={[10, 1, 16, 64, Math.PI]} />
        <meshStandardMaterial color={stoneColor} roughness={0.9} />
      </mesh>

      {/* Central Background Bookshelf Built into the Wall */}
      <group position={[0, 4.5, -7.5]}>
        {/* Frame */}
        <mesh position={[0, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[6, 6, 0.8]} />
          <meshStandardMaterial color={woodDark} roughness={0.9} />
        </mesh>
        {/* Inner cutout (simulated by black plane) */}
        <mesh position={[0, 0, 0.41]}>
          <planeGeometry args={[5.6, 5.6]} />
          <meshBasicMaterial color="#050302" />
        </mesh>
        {/* Shelves */}
        {[-1.5, 0, 1.5].map((y, i) => (
          <group key={i}>
            <mesh position={[0, y, 0.5]} receiveShadow castShadow>
              <boxGeometry args={[5.6, 0.1, 0.6]} />
              <meshStandardMaterial color={woodMid} roughness={0.8} />
            </mesh>
            {/* Books on this shelf */}
            {Array.from({ length: 12 }).map((_, j) => (
              <mesh key={j} position={[-2.5 + j * 0.45 + (Math.random() * 0.1), y + 0.5 + (Math.random() * 0.2), 0.5]} castShadow>
                <boxGeometry args={[0.3, 1 + Math.random() * 0.5, 0.5]} />
                <meshStandardMaterial color={j % 3 === 0 ? COLORS.leatherDark : (j % 2 === 0 ? COLORS.clothNavy : COLORS.clothForest)} roughness={0.7} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Hanging Vintage Lamps */}
      {[-8, 8].map((x, i) => (
        <group key={i} position={[x, 8, -2]}>
          {/* Chain */}
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 2]} />
            <meshStandardMaterial color={gold} metalness={0.9} roughness={0.5} />
          </mesh>
          {/* Glass Bulb */}
          <mesh>
            <sphereGeometry args={[0.6, 32, 32]} />
            <meshStandardMaterial color="#ffccaa" transparent opacity={0.6} emissive="#ff8800" emissiveIntensity={0.5} roughness={0.1} />
          </mesh>
          <pointLight intensity={3} distance={15} color="#ff9933" castShadow />
        </group>
      ))}
    </group>
  );
}

function DimOverlay() {
  const zoomedMemoryId = useMemoryStore((s) => s.zoomedMemoryId);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const { camera } = useThree();
  
  useEffect(() => {
    if (!materialRef.current) return;
    gsap.to(materialRef.current, {
      opacity: zoomedMemoryId ? 0.75 : 0,
      duration: 1.5,
      ease: "power2.inOut",
    });
  }, [zoomedMemoryId]);

  // Attach a huge black plane to the camera, at z=-3 so it's behind the zoomed photo (which will fly to z=-2)
  return createPortal(
    <mesh position={[0, 0, -3]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial ref={materialRef} color="#000000" transparent opacity={0} depthWrite={false} />
    </mesh>,
    camera
  );
}

export default function StudyRoom() {
  const { camera } = useThree();
  const selectedAlbumId = useMemoryStore((s) => s.selectedAlbumId);
  const zoomedMemoryId = useMemoryStore((s) => s.zoomedMemoryId);
  const zoomedFrame = useMemoryStore((s) => s.zoomedFrame);
  const albums = useMemoryStore((s) => s.albums);
  const isTransitioningRef = useRef(false);

  // Keep track of the currently displayed album so it doesn't instantly vanish when unselected
  const [displayedAlbum, setDisplayedAlbum] = useState<MemoryAlbum>(albums[0]);

  useEffect(() => {
    const found = albums.find(a => a.id === selectedAlbumId);
    if (found) {
      setDisplayedAlbum(found as unknown as MemoryAlbum);
    }
  }, [selectedAlbumId, albums]);

  // Initial Camera Framing (Low angle, moody)
  useEffect(() => {
    camera.position.set(SCENE.camera.roomPosition[0], SCENE.camera.roomPosition[1], SCENE.camera.roomPosition[2]);
    camera.lookAt(new THREE.Vector3(SCENE.camera.lookTarget[0], SCENE.camera.lookTarget[1], SCENE.camera.lookTarget[2]));
  }, [camera]);

  const prevSelectedId = useRef<string | null>(null);
  const prevZoomedFrame = useRef<boolean>(false);

  const frameDoorsOpen = useMemoryStore((s) => s.frameDoorsOpen);

  useEffect(() => {
    // If zoomed into memory, camera moves slightly in from the book
    if (zoomedMemoryId) return; 

    if (selectedAlbumId === prevSelectedId.current && zoomedFrame === prevZoomedFrame.current) return;

    if (zoomedFrame) {
      if (frameDoorsOpen) {
        // OPEN STATE: Zoom out to see both panels
        // Center of frame is (3.2, deskY + 2.5, 0.8)
        gsap.to(camera.position, {
          x: 1.2, 
          y: SCENE.study.deskY + 2.5,
          z: 3.7, 
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            camera.lookAt(new THREE.Vector3(3.2, SCENE.study.deskY + 2.5, 0.8));
          }
        });
      } else {
        // CLOSED STATE: Zoom closely onto the right panel (photo) which is folded over the left panel
        // Center of the folded photo is approx x: 2.5, y: deskY + 2.5, z: 1.25
        gsap.to(camera.position, {
          x: 2.1, 
          y: SCENE.study.deskY + 2.5,
          z: 3.0, 
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            camera.lookAt(new THREE.Vector3(2.5, SCENE.study.deskY + 2.5, 1.25));
          }
        });
      }
    } else if (prevZoomedFrame.current && !zoomedFrame) {
      // Exiting the wooden photo frame - zoom back to default desk position
      gsap.to(camera.position, {
        x: SCENE.camera.roomPosition[0],
        y: SCENE.camera.roomPosition[1],
        z: SCENE.camera.roomPosition[2],
        duration: 2.0,
        ease: "power2.inOut",
        onUpdate: () => {
          camera.lookAt(new THREE.Vector3(SCENE.camera.lookTarget[0], SCENE.camera.lookTarget[1], SCENE.camera.lookTarget[2]));
        }
      });
    } else if (selectedAlbumId) {
      // Zoom into the Album Book
      gsap.to(camera.position, {
        x: SCENE.camera.bookZoomPosition[0],
        y: SCENE.camera.bookZoomPosition[1],
        z: SCENE.camera.bookZoomPosition[2],
        duration: 2.5,
        ease: "power2.inOut",
        onUpdate: () => {
          camera.lookAt(new THREE.Vector3(SCENE.camera.bookLookTarget[0], SCENE.camera.bookLookTarget[1], SCENE.camera.bookLookTarget[2]));
        }
      });
    } else if (prevSelectedId.current && !selectedAlbumId) {
      // Delay camera zoom out to allow the book cover to close first
      gsap.to(camera.position, {
        x: SCENE.camera.roomPosition[0],
        y: SCENE.camera.roomPosition[1],
        z: SCENE.camera.roomPosition[2],
        duration: 2.5,
        delay: 1.0, // Wait 1 second for cover to close
        ease: "power2.inOut",
        onUpdate: () => {
          camera.lookAt(new THREE.Vector3(SCENE.camera.lookTarget[0], SCENE.camera.lookTarget[1], SCENE.camera.lookTarget[2]));
        }
      });
    }
    
    prevSelectedId.current = selectedAlbumId;
    prevZoomedFrame.current = zoomedFrame;
  }, [selectedAlbumId, zoomedMemoryId, zoomedFrame, frameDoorsOpen, camera]);

  return (
    <group>
      <Environment preset="night" environmentIntensity={0.2} />
      {/* Deep dark ambient fog */}
      <fog attach="fog" args={['#050302', 2, 25]} />

      {/* Very subtle moonlight ambient fill */}
      <ambientLight intensity={0.05} color="#445588" />

      {/* The Architecture */}
      <Architecture />

      {/* Hanging Wavy String Lights */}
      <StringLights />

      {/* The Desk */}
      <Desk />

      {/* ── The Memory Album (Lying flat on the desk) ──────── */}
      <MemoryAlbumBook 
        key={`book-${displayedAlbum.id}`}
        album={displayedAlbum} 
        position={[0.5, SCENE.study.deskY + 1.51, SCENE.study.deskZ]} 
      />

      {/* ── The Wooden Photo Frame (Standing next to the candle) ──────── */}
      <WoodenPhotoFrame 
        key={`frame-${displayedAlbum.id}`}
        album={displayedAlbum} 
        position={[3.2, SCENE.study.deskY + 1.51, 0.8]} 
        rotation={[-0.1, -0.6, 0]}
        scale={0.75}
      />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={512}
          mixBlur={1}
          mixStrength={5}
          roughness={0.4}
          color="#1a0f0a"
          metalness={0.1}
          mirror={0.5}
        />
      </mesh>

      {/* ── Magic Particles ───────────────────────────────── */}
      <DustParticles />
      
      {/* Dim Overlay for Cinematic Focus */}
      <DimOverlay />
    </group>
  );
}
