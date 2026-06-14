import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface StringLightProps {
  start: [number, number, number];
  end: [number, number, number];
  sag: number;
  count: number;
}

function SingleString({ start, end, sag, count }: StringLightProps) {
  // generate points for the wire
  const curve = useMemo(() => {
    const pts = [];
    const segments = 20;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = THREE.MathUtils.lerp(start[0], end[0], t);
      const z = THREE.MathUtils.lerp(start[2], end[2], t);
      // Parabola-like sag using sine wave for smooth hanging wire effect
      const base_y = THREE.MathUtils.lerp(start[1], end[1], t);
      const y = base_y - sag * Math.sin(t * Math.PI);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [start, end, sag]);

  // generate positions for the light bulbs
  const bulbPositions = useMemo(() => {
    const pos = [];
    for (let i = 1; i <= count; i++) {
      const t = i / (count + 1);
      pos.push(curve.getPoint(t));
    }
    return pos;
  }, [curve, count]);

  const materials = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    materials.current.forEach((mat, i) => {
      if (!mat) return;
      // Very slow, elegant pulse instead of crazy flicker
      const pulse = Math.sin(time * 0.5 + i) * 0.1 + 0.9; // 0.8 to 1.0
      mat.emissiveIntensity = pulse * 4.0;
    });
  });

  return (
    <group>
      {/* Wire */}
      <mesh>
        <tubeGeometry args={[curve, 50, 0.01, 8, false]} />
        <meshStandardMaterial color="#050505" roughness={1} />
      </mesh>
      
      {/* Bulbs */}
      {bulbPositions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Bulb Glass */}
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshPhysicalMaterial 
              color="#ffffff" 
              transmission={0.9}
              transparent
              opacity={0.8}
              roughness={0.2}
            />
          </mesh>
          
          {/* Natural Glowing Core */}
          <mesh>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
              ref={(el) => { materials.current[i] = el; }}
              color="#ffffff" 
              emissive="#ffaa00" 
              emissiveIntensity={4.0} 
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function StringLights() {
  return (
    // Positioned in the background, directly behind the desk in camera view
    <group position={[0, 0, -5]}>
      {/* multiple crossed wavy strings */}
      <SingleString start={[-12, 6.0, 0]} end={[-2, 4.0, 0]} sag={1.5} count={16} />
      <SingleString start={[-2, 4.0, 0]} end={[10, 5.5, 0]} sag={1.2} count={18} />
      
      <SingleString start={[-9, 4.8, -1]} end={[3, 5.2, -1]} sag={1.0} count={15} />
      <SingleString start={[3, 5.2, -1]} end={[9, 4.4, -1]} sag={1.2} count={12} />
      
      <SingleString start={[-11, 5.0, -2]} end={[-3, 6.2, -2]} sag={0.9} count={14} />
      <SingleString start={[-3, 6.2, -2]} end={[8, 4.0, -2]} sag={1.5} count={20} />

      {/* Fake ambient glow from the strings to light the room softly */}
      <pointLight position={[-5, 4, 0]} intensity={0.6} color="#ffca28" distance={15} />
      <pointLight position={[5, 4, 0]} intensity={0.6} color="#ffca28" distance={15} />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#ffca28" distance={15} />
    </group>
  );
}
