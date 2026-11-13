import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { SceneKind } from "@/lib/devices/catalogue";
import { SCENES } from "./equipment-parts";

function Model({
  kind,
  selected,
  onSelect,
}: {
  kind: SceneKind;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const spec = SCENES[kind];
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <group>
      <mesh>
        <boxGeometry args={spec.body.size} />
        <meshStandardMaterial color={spec.body.color} roughness={0.7} metalness={0.2} />
      </mesh>
      {spec.parts.map((p) => {
        const active = selected === p.id || hovered === p.id;
        return (
          <mesh
            key={p.id}
            position={p.position}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(p.id);
            }}
            onPointerOut={() => setHovered(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(p.id);
            }}
          >
            <boxGeometry args={p.size} />
            <meshStandardMaterial
              color={p.color}
              emissive={active ? "#7dffa1" : "#000000"}
              emissiveIntensity={active ? 0.6 : 0}
              roughness={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function EquipmentScene({
  kind,
  selected,
  onSelect,
  reducedMotion,
  visible,
}: {
  kind: SceneKind;
  selected: string | null;
  onSelect: (id: string) => void;
  reducedMotion: boolean;
  visible: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={!visible ? "never" : reducedMotion ? "demand" : "always"}
      camera={{ position: [3.4, 2, 4.4], fov: 38 }}
      gl={{ antialias: false, powerPreference: "low-power" }}
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <Model kind={kind} selected={selected} onSelect={onSelect} />
      <OrbitControls
        enablePan={false}
        minDistance={3.5}
        maxDistance={9}
        autoRotate={!reducedMotion && !selected}
        autoRotateSpeed={0.8}
      />
    </Canvas>
  );
}
