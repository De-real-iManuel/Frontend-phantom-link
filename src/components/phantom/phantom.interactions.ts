import { useEffect, useRef, useState, type RefObject } from "react";
import { PHANTOM_CONFIG } from "./phantom.animations.ts";
import type { PhantomExpression } from "./phantom.types.ts";

export const MAX_TILT_DEG = 5;

export type PhantomFormat = "webp" | "png";

export function phantomAssetPath(expression: PhantomExpression, format: PhantomFormat): string {
  return `/phantom/${PHANTOM_CONFIG[expression].asset}.${format}`;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Maps a pointer position inside a rect to normalised -1..1 offsets and clamped tilt degrees. */
export function pointerToTilt(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  maxDeg = MAX_TILT_DEG,
) {
  if (rect.width <= 0 || rect.height <= 0) return { nx: 0, ny: 0, rotateX: 0, rotateY: 0 };
  const nx = clamp(((clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
  const ny = clamp(((clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
  return { nx, ny, rotateX: -ny * maxDeg, rotateY: nx * maxDeg };
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

interface PointerOptions {
  followPointer: boolean;
  interactive: boolean;
  onTap: () => void;
}

/**
 * Element-scoped pointer tracking. Writes CSS custom properties on the element
 * (no React state per move). Never listens on window or document.
 */
export function usePhantomPointer(ref: RefObject<HTMLElement | null>, opts: PointerOptions) {
  const { followPointer, interactive, onTap } = opts;
  const tapRef = useRef(onTap);
  tapRef.current = onTap;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let pending: PointerEvent | null = null;
    const track = followPointer && !prefersReducedMotion();

    const apply = () => {
      raf = 0;
      if (!pending) return;
      const t = pointerToTilt(pending.clientX, pending.clientY, el.getBoundingClientRect());
      pending = null;
      el.style.setProperty("--px", t.nx.toFixed(3));
      el.style.setProperty("--py", t.ny.toFixed(3));
      el.style.setProperty("--rx", `${t.rotateX.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${t.rotateY.toFixed(2)}deg`);
    };
    const onMove = (e: PointerEvent) => {
      pending = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const reset = () => {
      pending = null;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    const onClick = () => tapRef.current();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        tapRef.current();
      }
    };

    const passive = { passive: true } as const;
    if (track) {
      el.addEventListener("pointerenter", onMove, passive);
      el.addEventListener("pointermove", onMove, passive);
      el.addEventListener("pointerleave", reset, passive);
      el.addEventListener("pointercancel", reset, passive);
      el.addEventListener("pointerup", reset, passive);
    }
    if (interactive) {
      el.addEventListener("click", onClick);
      el.addEventListener("keydown", onKey);
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", onMove);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
      el.removeEventListener("pointercancel", reset);
      el.removeEventListener("pointerup", reset);
      el.removeEventListener("click", onClick);
      el.removeEventListener("keydown", onKey);
    };
  }, [ref, followPointer, interactive]);
}

/** Creates a resettable idle timer. Pure so it can be tested with fake timers. */
export function createIdleTimer(ms: number, onIdle: () => void) {
  let id: ReturnType<typeof setTimeout> | null = null;
  const stop = () => {
    if (id !== null) clearTimeout(id);
    id = null;
  };
  const reset = () => {
    stop();
    id = setTimeout(() => {
      id = null;
      onIdle();
    }, ms);
  };
  return { reset, stop };
}

/** Returns true after `ms` of inactivity. Only active when ms is a positive number. */
export function useIdleSleep(ms: number | undefined, resetKey: unknown) {
  const [asleep, setAsleep] = useState(false);
  useEffect(() => {
    setAsleep(false);
    if (!ms || ms <= 0) return;
    const timer = createIdleTimer(ms, () => setAsleep(true));
    timer.reset();
    return timer.stop;
  }, [ms, resetKey]);
  return ms && ms > 0 ? asleep : false;
}
