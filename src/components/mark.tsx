/**
 * Ghost-signal mark. The ghost's hem is a bus trace; the left eye is a dark
 * node, the right eye is the live signal.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
      <g className="ghost-float">
        <path d="M9 41V22a15 15 0 0 1 30 0v19l-5-5-5 5-5-5-5 5-5-5z" className="fill-fg" />
        <circle cx="18" cy="22" r="3" className="fill-bg" />
        <circle cx="30" cy="22" r="3" className="fill-signal flicker" />
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
