import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface CarModelProps {
  color: string;
}

function CarBody({ color }: CarModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Main body - lower */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[3.2, 0.5, 1.4]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Main body - upper cabin */}
      <mesh position={[0.2, 0.75, 0]}>
        <boxGeometry args={[1.6, 0.45, 1.2]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} transparent opacity={0.9} />
      </mesh>

      {/* Hood slope */}
      <mesh position={[-0.7, 0.6, 0]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[1.0, 0.15, 1.3]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Trunk slope */}
      <mesh position={[1.1, 0.6, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.7, 0.15, 1.3]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Front bumper */}
      <mesh position={[-1.65, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.35, 1.3]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Rear bumper */}
      <mesh position={[1.65, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.35, 1.3]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Windshield */}
      <mesh position={[-0.55, 0.8, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.6, 0.02, 1.1]} />
        <meshStandardMaterial color="#87CEEB" metalness={0.9} roughness={0.1} transparent opacity={0.4} />
      </mesh>

      {/* Rear windshield */}
      <mesh position={[1.0, 0.8, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.5, 0.02, 1.1]} />
        <meshStandardMaterial color="#87CEEB" metalness={0.9} roughness={0.1} transparent opacity={0.4} />
      </mesh>

      {/* Wheels */}
      {[[-1.0, 0, 0.75], [-1.0, 0, -0.75], [1.0, 0, 0.75], [1.0, 0, -0.75]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.2, 16]} />
            <meshStandardMaterial color="#222" metalness={0.3} roughness={0.8} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.22, 8]} />
            <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Headlights */}
      {[0.45, -0.45].map((z, i) => (
        <mesh key={`hl-${i}`} position={[-1.62, 0.35, z]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#ffffcc" emissive="#ffffaa" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Taillights */}
      {[0.45, -0.45].map((z, i) => (
        <mesh key={`tl-${i}`} position={[1.62, 0.35, z]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* Ground shadow */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 2]} />
        <meshStandardMaterial color="#000" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]}>
      <circleGeometry args={[5, 32]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.8} />
    </mesh>
  );
}

interface Car3DViewerProps {
  color: string;
}

export function Car3DViewer({ color }: Car3DViewerProps) {
  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden bg-background/50">
      <Canvas
        camera={{ position: [4, 2.5, 4], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} />
        <pointLight position={[0, 3, 0]} intensity={0.4} />
        <CarBody color={color} />
        <Ground />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  );
}
