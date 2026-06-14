import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Create a simple heart shape
const heartShape = new THREE.Shape();
heartShape.moveTo(0, 0.2);
heartShape.bezierCurveTo(0, 0.2, -0.2, 0.4, -0.4, 0.4);
heartShape.bezierCurveTo(-0.8, 0.4, -0.8, -0.1, -0.8, -0.1);
heartShape.bezierCurveTo(-0.8, -0.3, -0.5, -0.6, 0, -1.0);
heartShape.bezierCurveTo(0.5, -0.6, 0.8, -0.3, 0.8, -0.1);
heartShape.bezierCurveTo(0.8, -0.1, 0.8, 0.4, 0.4, 0.4);
heartShape.bezierCurveTo(0.2, 0.4, 0, 0.2, 0, 0.2);

export default function HeartsParticles({ isZoomed }: { isZoomed: boolean }) {
  const heartMeshRef = useRef<THREE.InstancedMesh>(null);
  const balloonMeshRef = useRef<THREE.InstancedMesh>(null);
  const count = 250; // 15 big hearts, 235 blast hearts!

  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const isBigHeart = i < 15;
      temp.push({
        isBigHeart,
        position: new THREE.Vector3(
          isBigHeart ? (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 20, // Blast covers entire screen width
          isBigHeart ? -1.5 - Math.random() * 1.5 : -4 - Math.random() * 8,   // Blast starts low and rises up
          -0.02 - Math.random() * (isBigHeart ? 0.1 : 4.0)                     // Blast has deep background depth
        ),
        speed: Math.random() * 0.03 + (isBigHeart ? 0.015 : 0.03),
        baseScale: Math.random() * 0.06 + (isBigHeart ? 0.04 : 0.02),
        wobbleSpeed: Math.random() * 3 + 1,
        delay: isBigHeart ? Math.random() * 1.0 : 1.8 + Math.random() * 0.8, // Blast waits ~1.8s for the pops
        state: 'waiting', // waiting, heart, stopped, popping, balloon, blast
        life: 0,
        popHeight: Math.random() * 0.8 + 0.2,
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!heartMeshRef.current || !balloonMeshRef.current) return;
    const time = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      let heartScale = 0;
      let balloonScale = 0;

      if (isZoomed) {
        if (p.state === 'waiting' && time > p.delay) {
          p.state = p.isBigHeart ? 'heart' : 'blast';
          p.life = 0;
        }

        if (p.state !== 'waiting') {
          if (p.state === 'heart') {
            // Float up until popHeight
            p.position.y += p.speed;
            p.position.x += Math.sin(time * p.wobbleSpeed) * 0.003;

            // Heart grows in
            p.life += 0.05;
            heartScale = Math.min(1, p.life) * p.baseScale;
            // Pulse
            heartScale *= 1.0 + Math.sin(time * 12) * 0.15;

            if (p.position.y > p.popHeight) {
              p.state = 'stopped';
              p.delay = time + 0.3 + Math.random() * 0.4; // Stop for a short bit before pop
            }
          } else if (p.state === 'stopped') {
            heartScale = p.baseScale * (1.0 + Math.sin(time * 12) * 0.15);
            if (time > p.delay) {
              p.state = 'popping';
              p.life = 1.0;
            }
          } else if (p.state === 'popping') {
            // Shrink fast
            p.life -= 0.15;
            if (p.life <= 0) {
              p.state = 'balloon';
              p.life = 0;
            } else {
              heartScale = p.life * p.baseScale;
            }
          } else if (p.state === 'balloon') {
            // Float up slowly
            p.position.y += p.speed * 0.5;
            p.position.x += Math.sin(time * p.wobbleSpeed) * 0.003;

            // Balloon scales up to be extremely tiny (~1/8 visual volume)
            p.life += 0.1;
            balloonScale = Math.min(1, p.life) * p.baseScale * 0.8; 
            
            if (p.position.y > 3) {
              p.position.y = -1.5 - Math.random() * 1.5;
              p.state = 'waiting';
              p.delay = time + Math.random() * 1.5;
            }
          } else if (p.state === 'blast') {
            // Background blast hearts!
            p.position.y += p.speed;
            p.position.x += Math.sin(time * p.wobbleSpeed) * 0.005;

            p.life += 0.05;
            heartScale = Math.min(1, p.life) * p.baseScale;
            heartScale *= 1.0 + Math.sin(time * 8) * 0.1; // Gentle pulse
            
            // Wrap around background
            if (p.position.y > 6) {
              p.position.y = -4 - Math.random() * 4;
            }
          }
        }
      } else {
        p.state = 'waiting';
        p.position.y = p.isBigHeart ? -1.5 - Math.random() * 1.5 : -4 - Math.random() * 8;
        p.delay = time + (p.isBigHeart ? Math.random() * 1.0 : 1.8 + Math.random() * 0.8);
      }

      // Update Heart Matrix
      dummy.position.copy(p.position);
      dummy.scale.set(heartScale, heartScale, heartScale);
      dummy.rotation.set(0, 0, 0); // Right side up
      dummy.updateMatrix();
      heartMeshRef.current!.setMatrixAt(i, dummy.matrix);

      // Update Balloon Matrix
      dummy.position.copy(p.position);
      dummy.scale.set(balloonScale, balloonScale, balloonScale);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      balloonMeshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    heartMeshRef.current.instanceMatrix.needsUpdate = true;
    balloonMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={[0, 0, -0.01]}>
      <instancedMesh ref={heartMeshRef} args={[undefined, undefined, count]}>
        <shapeGeometry args={[heartShape]} />
        <meshBasicMaterial color="#ff4b72" transparent opacity={0.9} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={balloonMeshRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshPhysicalMaterial 
          color="#ff2266" 
          transmission={0.4} 
          transparent 
          opacity={0.8} 
          roughness={0.2}
          emissive="#ff4b72"
          emissiveIntensity={0.6}
        />
      </instancedMesh>
    </group>
  );
}
