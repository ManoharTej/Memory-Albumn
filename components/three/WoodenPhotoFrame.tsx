import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import type { MemoryAlbum } from '@/types';
import { gsap } from '@/lib/gsapConfig';
import { useMemoryStore } from '@/stores/useMemoryStore';

interface WoodenPhotoFrameProps {
  album: MemoryAlbum;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export default function WoodenPhotoFrame({ album, position = [0, 0, 0], rotation = [-0.1, 0, 0], scale = 1 }: WoodenPhotoFrameProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  const rightPanelRef = useRef<THREE.Group>(null);
  const photoFrameRef = useRef<THREE.Group>(null);
  const textMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const borderMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const textLightRef = useRef<THREE.PointLight>(null);

  // Load the single photo texture
  const frameImageUrl = album.framePhotoUrl || (album.memories?.[0]?.photoUrl) || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=600&auto=format&fit=crop';
  const texture = useLoader(THREE.TextureLoader, frameImageUrl);

  // Realistic Wood Texture (Rings and Grain)
  const woodTextureUrl = 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?q=80&w=1024&auto=format&fit=crop';
  const woodTex = useLoader(THREE.TextureLoader, woodTextureUrl);
  
  const { gl } = useThree();
  
  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = gl.capabilities.getMaxAnisotropy();
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.needsUpdate = true;
    }
    if (woodTex) {
      woodTex.colorSpace = THREE.SRGBColorSpace;
      woodTex.anisotropy = gl.capabilities.getMaxAnisotropy();
      woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping;
      woodTex.repeat.set(1.5, 1.5);
      woodTex.needsUpdate = true;
    }
  }, [texture, woodTex, gl]);

  // Dimensions (Made super thick for realistic 3D block look)
  const panelW = 1.6;
  const panelH = 2.0;
  const panelD = 0.3; // Very thick!
  const borderThick = 0.4; // Wide border

  // Animation for opening diptych
  const toggleOpen = () => {
    if (!rightPanelRef.current) return;
    const nextState = !isOpen;
    setIsOpen(nextState);
    useMemoryStore.getState().setFrameDoorsOpen(nextState);
    gsap.to(rightPanelRef.current.rotation, {
      y: nextState ? -Math.PI * 0.15 : -Math.PI * 0.9, // open is a slight V-shape, closed is folded
      duration: 1.5,
      ease: "power2.inOut"
    });
  };

  // Spinning and Flickering logic
  const [isSpinning, setIsSpinning] = useState(false);
  const spinVelocity = useRef(0);
  const setZoomedFrame = useMemoryStore(s => s.setZoomedFrame);
  const zoomedFrame = useMemoryStore(s => s.zoomedFrame);
  const mainGroupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Photo Spin Logic
    if (photoFrameRef.current) {
      if (isSpinning || zoomedFrame) {
        // Spin fast if hovered, or continuously spin if zoomed in
        const targetVel = zoomedFrame ? 1.5 : 3.0; // Slower elegant spin when zoomed in
        spinVelocity.current = THREE.MathUtils.lerp(spinVelocity.current, targetVel, 0.05);
        photoFrameRef.current.rotation.y += spinVelocity.current * delta;
      } else {
        spinVelocity.current = THREE.MathUtils.lerp(spinVelocity.current, 0.0, 0.02);
        if (spinVelocity.current < 0.1) {
          const rY = photoFrameRef.current.rotation.y;
          const target = Math.round(rY / Math.PI) * Math.PI;
          photoFrameRef.current.rotation.y = THREE.MathUtils.lerp(rY, target, 0.1);
        } else {
          photoFrameRef.current.rotation.y += spinVelocity.current * delta;
        }
      }
    }

    // Keep the entire frame completely still when zoomed in
    if (mainGroupRef.current) {
      if (zoomedFrame) {
        // Force it to be completely stationary
        mainGroupRef.current.rotation.y = rotation[1];
        mainGroupRef.current.rotation.z = rotation[2];
        mainGroupRef.current.position.y = position[1];
      } else {
        // Return to normal
        mainGroupRef.current.rotation.y = THREE.MathUtils.lerp(mainGroupRef.current.rotation.y, rotation[1], 0.05);
        mainGroupRef.current.rotation.z = THREE.MathUtils.lerp(mainGroupRef.current.rotation.z, rotation[2], 0.05);
        mainGroupRef.current.position.y = THREE.MathUtils.lerp(mainGroupRef.current.position.y, position[1], 0.05);
      }
    }

    // Glowing/Flickering Text Logic
    const flicker = 1.0 + Math.sin(t * 8) * 0.1 + Math.sin(t * 3) * 0.15;
    if (textMaterialRef.current) {
      textMaterialRef.current.emissiveIntensity = flicker * 0.6;
    }
    if (borderMaterialRef.current) {
      borderMaterialRef.current.emissiveIntensity = flicker * 0.8;
    }
    if (textLightRef.current) {
      textLightRef.current.intensity = flicker * 0.4;
    }
  });

  return (
    <group 
      ref={mainGroupRef}
      position={position} 
      rotation={rotation} 
      scale={scale} 
      onClick={(e) => { e.stopPropagation(); toggleOpen(); }}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerLeave={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'default'; }}
      onDoubleClick={(e) => { e.stopPropagation(); setZoomedFrame(!zoomedFrame); }}
    >

      {/* ─── LEFT PANEL (Main Base) ─── */}
      <group position={[-panelW/2, panelH/2, 0]}>
        
        {/* Solid Thick Wooden Base */}
        <mesh receiveShadow castShadow>
          <boxGeometry args={[panelW, panelH, panelD]} />
          <meshStandardMaterial map={woodTex} color="#4a2c16" roughness={0.9} />
        </mesh>
        
        {/* Inner carved darker region for text */}
        <mesh position={[0, 0, panelD/2 + 0.001]} receiveShadow>
          <planeGeometry args={[panelW * 0.85, panelH * 0.85]} />
          <meshStandardMaterial map={woodTex} color="#2d1a0d" roughness={0.95} />
        </mesh>

        {/* Glowing Rectangle Border around the text */}
        <mesh position={[0, 0, panelD/2 + 0.005]}>
          {/* We create a hollow rectangle border using EdgesGeometry or just 4 planes */}
          <group>
            {/* Top Border */}
            <mesh position={[0, panelH * 0.35, 0]}>
              <planeGeometry args={[panelW * 0.7, 0.02]} />
              <meshStandardMaterial ref={borderMaterialRef} color="#ffe082" emissive="#ffb74d" emissiveIntensity={1} toneMapped={false} />
            </mesh>
            {/* Bottom Border */}
            <mesh position={[0, -panelH * 0.35, 0]}>
              <planeGeometry args={[panelW * 0.7, 0.02]} />
              <meshStandardMaterial color="#ffe082" emissive="#ffb74d" emissiveIntensity={1} toneMapped={false} />
            </mesh>
            {/* Left Border */}
            <mesh position={[-panelW * 0.35, 0, 0]}>
              <planeGeometry args={[0.02, panelH * 0.7]} />
              <meshStandardMaterial color="#ffe082" emissive="#ffb74d" emissiveIntensity={1} toneMapped={false} />
            </mesh>
            {/* Right Border */}
            <mesh position={[panelW * 0.35, 0, 0]}>
              <planeGeometry args={[0.02, panelH * 0.7]} />
              <meshStandardMaterial color="#ffe082" emissive="#ffb74d" emissiveIntensity={1} toneMapped={false} />
            </mesh>
          </group>
        </mesh>
        
        {/* Glowing Flickering Text */}
        <group position={[0, 0, panelD/2 + 0.01]}>
          <Text
            fontSize={0.11}
            maxWidth={panelW * 0.65}
            textAlign="center"
            lineHeight={1.4}
          >
            {album.frameText || "Every time you\nLIGHT THIS UP\nI hope you feel that\nTOGETHER IS MY\nFAVORITE\nPLACE TO BE"}
            <meshStandardMaterial ref={textMaterialRef} color="#ffecb3" emissive="#ffca28" emissiveIntensity={0.6} toneMapped={false} />
          </Text>
          {/* A point light to simulate the text illuminating the wood */}
          <pointLight ref={textLightRef} position={[0, 0, 0.2]} intensity={0.4} distance={2.0} color="#ffca28" />
        </group>
      </group>

      {/* ─── RIGHT PANEL (Hinged at the middle) ─── */}
      <group ref={rightPanelRef} position={[0, panelH/2, panelD/2]} rotation={[0, -Math.PI * 0.15, 0]}>
        
        <group position={[panelW/2, 0, -panelD/2]}>
          
          {/* Outer Thick Wooden Frame */}
          <group>
            {/* Top */}
            <mesh position={[0, panelH/2 - borderThick/2, 0]} receiveShadow castShadow>
              <boxGeometry args={[panelW, borderThick, panelD]} />
              <meshStandardMaterial map={woodTex} color="#4a2c16" roughness={0.9} />
            </mesh>
            {/* Bottom */}
            <mesh position={[0, -panelH/2 + borderThick/2, 0]} receiveShadow castShadow>
              <boxGeometry args={[panelW, borderThick, panelD]} />
              <meshStandardMaterial map={woodTex} color="#4a2c16" roughness={0.9} />
            </mesh>
            {/* Left */}
            <mesh position={[-panelW/2 + borderThick/2, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[borderThick, panelH - borderThick*2, panelD]} />
              <meshStandardMaterial map={woodTex} color="#4a2c16" roughness={0.9} />
            </mesh>
            {/* Right */}
            <mesh position={[panelW/2 - borderThick/2, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[borderThick, panelH - borderThick*2, panelD]} />
              <meshStandardMaterial map={woodTex} color="#4a2c16" roughness={0.9} />
            </mesh>
          </group>

          {/* Metal Pins for the spinner */}
          <mesh position={[0, panelH/2 - borderThick - 0.02, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.04]} />
            <meshStandardMaterial color="#e0a96d" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, -panelH/2 + borderThick + 0.02, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.04]} />
            <meshStandardMaterial color="#e0a96d" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* ─── INNER SPINNING PHOTO FRAME ─── */}
          <group 
            ref={photoFrameRef} 
            onPointerEnter={() => setIsSpinning(true)}
            onPointerLeave={() => setIsSpinning(false)}
            onClick={(e) => { e.stopPropagation(); setIsSpinning(!isSpinning); }}
            onDoubleClick={(e) => { e.stopPropagation(); setZoomedFrame(!zoomedFrame); }}
          >
            {/* Inner thick wooden border */}
            <mesh receiveShadow castShadow>
              <boxGeometry args={[panelW - borderThick*2 - 0.1, panelH - borderThick*2 - 0.1, panelD - 0.1]} />
              <meshStandardMaterial map={woodTex} color="#663e21" roughness={0.8} />
            </mesh>
            
            {/* Front Photo Glow Border */}
            <mesh position={[0, 0, (panelD - 0.1)/2 + 0.0005]}>
              <planeGeometry args={[panelW - borderThick*2 - 0.15 + 0.04, panelH - borderThick*2 - 0.15 + 0.04]} />
              <meshStandardMaterial color="#ffe082" emissive="#ffb74d" emissiveIntensity={0.8} toneMapped={false} />
            </mesh>
            
            {/* Front Photo */}
            <mesh position={[0, 0, (panelD - 0.1)/2 + 0.001]}>
              <planeGeometry args={[panelW - borderThick*2 - 0.15, panelH - borderThick*2 - 0.15]} />
              <meshStandardMaterial map={texture} emissiveMap={texture} emissive="#ffffff" emissiveIntensity={0.25} roughness={0.4} />
            </mesh>
            
            {/* Back Photo Glow Border */}
            <mesh position={[0, 0, -((panelD - 0.1)/2 + 0.0005)]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[panelW - borderThick*2 - 0.15 + 0.04, panelH - borderThick*2 - 0.15 + 0.04]} />
              <meshStandardMaterial color="#ffe082" emissive="#ffb74d" emissiveIntensity={0.8} toneMapped={false} />
            </mesh>

            {/* Back Photo (same image) */}
            <mesh position={[0, 0, -((panelD - 0.1)/2 + 0.001)]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[panelW - borderThick*2 - 0.15, panelH - borderThick*2 - 0.15]} />
              <meshStandardMaterial map={texture} emissiveMap={texture} emissive="#ffffff" emissiveIntensity={0.25} roughness={0.4} />
            </mesh>
          </group>

        </group>
      </group>

    </group>
  );
}
