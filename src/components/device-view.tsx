import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { DevicePart } from "@/components/device-3d";
import { detectWebGL } from "@/lib/devices/webgl";
import type { SceneKind } from "@/lib/devices/catalogue";
import { SCENES } from "@/components/three/equipment-parts";

const Device3DScene = lazy(() => import("@/components/device-3d"));
const EquipmentScene = lazy(() => import("@/components/three/equipment-scene"));

export type { DevicePart };

export function DeviceFallback({ pulse = true }: { pulse?: boolean }) {
  return (
    <svg
      viewBox="0 0 320 280"
      className="mx-auto w-full max-w-sm"
      role="img"
      aria-label="Phantomlink edge device with three bus ports and a glowing status light"
    >
      <rect
        x="40"
        y="70"
        width="240"
        height="140"
        className="fill-surface stroke-line"
        strokeWidth="2"
      />
      <rect
        x="56"
        y="86"
        width="208"
        height="64"
        className="fill-bg stroke-line"
        strokeWidth="1.5"
      />
      <path
        d="M64 130h28l8-24 12 40 10-28 8 12h30"
        className="stroke-signal"
        strokeWidth="2"
        fill="none"
      />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={64 + i * 36}
          y="170"
          width="24"
          height="22"
          className="fill-bg stroke-muted"
          strokeWidth="1.5"
        />
      ))}
      <circle cx="248" cy="181" r="6" className={pulse ? "fill-signal flicker" : "fill-signal"} />
      <path d="M160 70V30M120 70V46M200 70V46" className="stroke-muted" strokeWidth="2" />
      <circle cx="160" cy="26" r="5" className="fill-pumpkin" />
    </svg>
  );
}

function hasWebGL() {
  return detectWebGL(() => document.createElement("canvas"));
}

/** Client-only 3D gateway. Renders the SVG until mounted, or when WebGL is missing. */
export function Device3D({
  selected,
  onSelect,
  className = "h-80 md:h-[26rem]",
}: {
  selected?: DevicePart | null;
  onSelect?: (part: DevicePart) => void;
  className?: string;
}) {
  const [state, setState] = useState<"server" | "webgl" | "none">("server");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setState(hasWebGL() ? "webgl" : "none");
  }, []);

  if (state !== "webgl") {
    return (
      <div className={`flex items-center ${className}`}>
        <DeviceFallback />
      </div>
    );
  }

  return (
    <div className={className}>
      <Suspense
        fallback={
          <div className="flex h-full items-center">
            <DeviceFallback />
          </div>
        }
      >
        <Device3DScene selected={selected} onSelect={onSelect} reducedMotion={reduced} />
      </Suspense>
    </div>
  );
}

/** Static, model-neutral outline of an equipment scene. Used when WebGL is unavailable. */
export function EquipmentFallback({ kind, label }: { kind: SceneKind; label: string }) {
  const spec = SCENES[kind];
  const [w, h] = spec.body.size;
  const scale = 100;
  const bw = w * scale;
  const bh = h * scale;
  const ox = (320 - bw) / 2;
  const oy = (260 - bh) / 2;
  return (
    <svg
      viewBox="0 0 320 260"
      className="mx-auto h-full max-h-80 w-full max-w-sm"
      role="img"
      aria-label={`${label}. Static illustration, not manufacturer CAD.`}
    >
      <rect x={ox} y={oy} width={bw} height={bh} className="fill-surface stroke-line" strokeWidth="2" />
      {spec.parts.map((p) => {
        const px = 160 + p.position[0] * scale - (p.size[0] * scale) / 2;
        const py = 130 - p.position[1] * scale - (p.size[1] * scale) / 2;
        return (
          <rect
            key={p.id}
            x={px}
            y={py}
            width={Math.max(p.size[0] * scale, 6)}
            height={Math.max(p.size[1] * scale, 6)}
            className="fill-bg stroke-muted"
            strokeWidth="1.5"
          />
        );
      })}
    </svg>
  );
}

/** Lazy 3D equipment viewer. Falls back to EquipmentFallback without WebGL, and pauses offscreen. */
export function Equipment3D({
  kind,
  label,
  selected,
  onSelect,
  className = "h-72 md:h-96",
}: {
  kind: SceneKind;
  label: string;
  selected: string | null;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const [state, setState] = useState<"server" | "webgl" | "none">("server");
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setState(hasWebGL() ? "webgl" : "none");
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const fallback = (
    <div className="flex h-full items-center">
      <EquipmentFallback kind={kind} label={label} />
    </div>
  );

  return (
    <div ref={ref} className={`border border-line bg-surface ${className}`} data-viewer={state}>
      {state !== "webgl" ? (
        fallback
      ) : (
        <Suspense fallback={fallback}>
          <EquipmentScene
            kind={kind}
            selected={selected}
            onSelect={onSelect}
            reducedMotion={reduced}
            visible={visible}
          />
        </Suspense>
      )}
    </div>
  );
}
