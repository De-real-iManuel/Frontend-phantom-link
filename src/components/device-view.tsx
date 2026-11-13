import { lazy, Suspense, useEffect, useState } from "react";
import type { DevicePart } from "@/components/device-3d";

const Device3DScene = lazy(() => import("@/components/device-3d"));

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
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
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
