import { useEffect, useRef, type ReactNode } from "react";

/** Slow-drifting ectoplasm fog. Decorative. */
export function FogLayer({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="fog" />
      <div className="fog fog-2" />
    </div>
  );
}

export function TinyGhost({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M4 22V11a8 8 0 0 1 16 0v11l-2.67-2.67L14.67 22 12 19.33 9.33 22 6.67 19.33z" />
      <circle cx="9.3" cy="11" r="1.4" className="fill-bg" />
      <circle cx="14.7" cy="11" r="1.4" className="fill-bg" />
    </svg>
  );
}

const ghosts = [
  { pos: "left-[6%] top-[22%] size-8", delay: "0s" },
  { pos: "right-[8%] top-[14%] size-6", delay: "-2s" },
  { pos: "right-[22%] bottom-[12%] size-10", delay: "-4s" },
];

/** A few faint ghosts drifting behind content. Decorative. */
export function FloatingGhosts() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {ghosts.map((g) => (
        <TinyGhost key={g.pos} className={`ghost-float absolute text-fg/10 ${g.pos}`} />
      ))}
    </div>
  );
}

/** Pointer-following light that reveals hidden register text under it. */
export function Flashlight({
  children,
  hidden,
  className = "",
}: {
  children: ReactNode;
  hidden: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    function move(event: PointerEvent) {
      if (!node) return;
      const rect = node.getBoundingClientRect();
      node.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      node.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }
    function leave() {
      node?.style.removeProperty("--mx");
      node?.style.removeProperty("--my");
    }
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    return () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div
        className="flashlight-layer pointer-events-none absolute inset-0 overflow-hidden font-mono text-xs leading-6 break-all text-signal/60 select-none"
        aria-hidden="true"
      >
        {hidden}
      </div>
      {children}
    </div>
  );
}
