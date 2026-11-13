import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, RoundedBox } from "@react-three/drei";
import type { Group, Mesh, MeshStandardMaterial } from "three";

export type DevicePart = "RS-485" | "4-20mA" | "Ethernet" | "Antenna";

const SIGNAL = "#7dffa1";
const PUMPKIN = "#ff8a2b";

type PartProps = {
  name: DevicePart;
  position: [number, number, number];
  hovered: DevicePart | null;
  selected: DevicePart | null;
  setHovered: (part: DevicePart | null) => void;
  onSelect: (part: DevicePart) => void;
  labelOffset?: [number, number, number];
  children: React.ReactNode;
};

function Part({
  name,
  position,
  hovered,
  selected,
  setHovered,
  onSelect,
  labelOffset = [0, -0.34, 0.2],
  children,
}: PartProps) {
  const active = hovered === name || selected === name;
  return (
    <group
      position={position}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(name);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(null);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(name);
      }}
    >
      {children}
      {active ? (
        <Html position={labelOffset} center distanceFactor={6} zIndexRange={[10, 0]}>
          <span className="pointer-events-none block border border-signal bg-bg px-2 py-1 font-mono text-xs whitespace-nowrap text-signal">
            {name}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

function Screws({ count, x0, gap }: { count: number; x0: number; gap: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[x0 + i * gap, 0.03, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.04, 16]} />
          <meshStandardMaterial color="#b9b4cc" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </>
  );
}

function Led({ x, color, phase }: { x: number; color: string; phase: number }) {
  const material = useRef<MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (!material.current) return;
    material.current.emissiveIntensity = 1.2 + Math.sin(clock.elapsedTime * 2.4 + phase) * 0.9;
  });
  return (
    <mesh position={[x, 0.52, 0.46]}>
      <sphereGeometry args={[0.055, 16, 16]} />
      <meshStandardMaterial ref={material} color={color} emissive={color} emissiveIntensity={1.5} />
    </mesh>
  );
}

function Model({
  reducedMotion,
  selected,
  onSelect,
}: {
  reducedMotion: boolean;
  selected: DevicePart | null;
  onSelect: (part: DevicePart) => void;
}) {
  const [hovered, setHovered] = useState<DevicePart | null>(null);
  const group = useRef<Group>(null);
  const antenna = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    if (group.current) group.current.position.y = Math.sin(clock.elapsedTime * 0.9) * 0.08;
    if (antenna.current) antenna.current.rotation.z = Math.sin(clock.elapsedTime * 1.3) * 0.03;
  });

  const shared = { hovered, selected, setHovered, onSelect };
  const hot = (part: DevicePart) => (hovered === part || selected === part ? SIGNAL : "#000000");

  return (
    <group ref={group}>
      <RoundedBox args={[2.6, 1.5, 0.9]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color="#1d1836" metalness={0.35} roughness={0.55} />
      </RoundedBox>

      <mesh position={[0, 0.2, 0.455]}>
        <boxGeometry args={[2.3, 0.62, 0.02]} />
        <meshStandardMaterial color="#0a0813" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[-0.55, 0.2, 0.47]}>
        <boxGeometry args={[0.9, 0.02, 0.005]} />
        <meshBasicMaterial color={SIGNAL} />
      </mesh>

      <Led x={0.8} color={SIGNAL} phase={0} />
      <Led x={0.95} color={PUMPKIN} phase={2} />
      <Led x={1.1} color={SIGNAL} phase={4} />

      <mesh position={[0, -0.78, -0.2]}>
        <boxGeometry args={[1.2, 0.12, 0.5]} />
        <meshStandardMaterial color="#8a84a3" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.64, -0.5]}>
        <boxGeometry args={[1.6, 0.24, 0.14]} />
        <meshStandardMaterial color="#8a84a3" metalness={0.8} roughness={0.35} />
      </mesh>

      <Part name="RS-485" position={[-0.85, -0.38, 0.45]} {...shared}>
        <mesh>
          <boxGeometry args={[0.7, 0.32, 0.24]} />
          <meshStandardMaterial color="#2f8f56" emissive={hot("RS-485")} emissiveIntensity={0.35} />
        </mesh>
        <Screws count={3} x0={-0.2} gap={0.2} />
      </Part>

      <Part name="4-20mA" position={[-0.05, -0.38, 0.45]} {...shared}>
        <mesh>
          <boxGeometry args={[0.7, 0.32, 0.24]} />
          <meshStandardMaterial color="#e07a1f" emissive={hot("4-20mA")} emissiveIntensity={0.35} />
        </mesh>
        <Screws count={3} x0={-0.2} gap={0.2} />
      </Part>

      <Part name="Ethernet" position={[0.82, -0.38, 0.45]} {...shared}>
        <mesh>
          <boxGeometry args={[0.5, 0.36, 0.26]} />
          <meshStandardMaterial
            color="#9b97b0"
            metalness={0.7}
            roughness={0.35}
            emissive={hot("Ethernet")}
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[0.34, 0.2, 0.1]} />
          <meshStandardMaterial color="#05040a" />
        </mesh>
      </Part>

      <Part name="Antenna" position={[1.0, 0.75, -0.1]} labelOffset={[0, 1.15, 0]} {...shared}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.12, 16]} />
          <meshStandardMaterial color="#b9b4cc" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh ref={antenna} position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.0, 16]} />
          <meshStandardMaterial
            color="#14112a"
            emissive={hot("Antenna")}
            emissiveIntensity={0.35}
            roughness={0.5}
          />
        </mesh>
        <mesh position={[0, 1.07, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color={PUMPKIN} emissive={PUMPKIN} emissiveIntensity={1} />
        </mesh>
      </Part>

      <pointLight position={[0, 0.2, 1.6]} color={SIGNAL} intensity={6} distance={5} />
    </group>
  );
}

export type Device3DSceneProps = {
  selected?: DevicePart | null;
  onSelect?: (part: DevicePart) => void;
  reducedMotion?: boolean;
};

export default function Device3DScene({
  selected = null,
  onSelect,
  reducedMotion = false,
}: Device3DSceneProps) {
  return (
    <Canvas
      camera={{ position: [3.4, 1.4, 4.6], fov: 38 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      aria-label="Interactive 3D Phantomlink gateway. Drag to rotate, hover or click a port."
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 3]} intensity={1.4} color="#d9d2ff" />
      <directionalLight position={[-4, 1, -2]} intensity={0.8} color={PUMPKIN} />
      <Model reducedMotion={reducedMotion} selected={selected} onSelect={(p) => onSelect?.(p)} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.9}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(Math.PI * 2) / 3}
      />
    </Canvas>
  );
}
