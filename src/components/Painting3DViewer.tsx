import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface PaintingModelProps {
  colors: string[];
}

function PaintingCanvas({ colors }: PaintingModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext("2d")!;

    // Paint abstract representation using the painting's colors
    const c = colors;
    // Background
    ctx.fillStyle = c[0];
    ctx.fillRect(0, 0, 512, 384);

    // Abstract shapes inspired by the painting
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = c[Math.floor(Math.random() * c.length)];
      ctx.globalAlpha = 0.3 + Math.random() * 0.5;
      const x = Math.random() * 512;
      const y = Math.random() * 384;
      const w = 30 + Math.random() * 120;
      const h = 20 + Math.random() * 80;
      ctx.beginPath();
      if (Math.random() > 0.5) {
        ctx.ellipse(x, y, w / 2, h / 2, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(x - w / 2, y - h / 2, w, h);
      }
    }

    // Add some brush strokes
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 20; i++) {
      ctx.strokeStyle = c[Math.floor(Math.random() * c.length)];
      ctx.lineWidth = 2 + Math.random() * 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      const sx = Math.random() * 512;
      const sy = Math.random() * 384;
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(
        sx + (Math.random() - 0.5) * 200, sy + (Math.random() - 0.5) * 150,
        sx + (Math.random() - 0.5) * 200, sy + (Math.random() - 0.5) * 150,
        sx + (Math.random() - 0.5) * 200, sy + (Math.random() - 0.5) * 150
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [colors]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Canvas/painting surface */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 2.25, 0.08]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Frame - top */}
      <mesh position={[0, 1.175, 0]}>
        <boxGeometry args={[3.3, 0.1, 0.15]} />
        <meshStandardMaterial color="#5d4037" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Frame - bottom */}
      <mesh position={[0, -1.175, 0]}>
        <boxGeometry args={[3.3, 0.1, 0.15]} />
        <meshStandardMaterial color="#5d4037" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Frame - left */}
      <mesh position={[-1.6, 0, 0]}>
        <boxGeometry args={[0.1, 2.45, 0.15]} />
        <meshStandardMaterial color="#5d4037" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Frame - right */}
      <mesh position={[1.6, 0, 0]}>
        <boxGeometry args={[0.1, 2.45, 0.15]} />
        <meshStandardMaterial color="#5d4037" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Gold inner frame accent */}
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[3.15, 2.35, 0.01]} />
        <meshStandardMaterial color="#d4a843" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

interface Painting3DViewerProps {
  colors: string[];
}

export function Painting3DViewer({ colors }: Painting3DViewerProps) {
  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden bg-background/50">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.7} />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} />
        <spotLight position={[0, 3, 2]} intensity={0.6} angle={0.5} penumbra={0.5} />
        <PaintingCanvas colors={colors} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={8}
        />
      </Canvas>
    </div>
  );
}
