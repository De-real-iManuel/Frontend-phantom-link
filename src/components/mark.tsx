/**
 * Ghost-signal mark. The left eye is a dark node, the right eye is the
 * signal, and the pulse line across the body is the communication path.
 * Motion is opt-in via `animated` (landing hero only).
 */
export function Mark({ className, animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
      <g className={animated ? "ghost-float" : undefined}>
        <path d="M9 41V22a15 15 0 0 1 30 0v19l-5-5-5 5-5-5-5 5-5-5z" className="fill-fg" />
        <circle cx="18" cy="22" r="3" className="fill-bg" />
        <circle cx="30" cy="22" r="3" className={animated ? "fill-signal flicker" : "fill-signal"} />
        <path
          d="M14 31h6l2.5-4 3 8 2.5-4H34"
          className="stroke-bg"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function Wordmark({ markClass = "size-8" }: { markClass?: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark className={markClass} />
      <span className="font-mono text-sm font-medium tracking-widest text-fg lowercase">
        phantom<span className="text-signal">link</span>
      </span>
    </span>
  );
}
