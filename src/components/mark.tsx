export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
      <circle
        cx="18"
        cy="24"
        r="11"
        className="stroke-muted"
        strokeWidth="1.75"
        strokeDasharray="56.8 12.3"
        strokeDashoffset="6.15"
      />
      <path d="M5 24H34" className="stroke-signal" strokeWidth="2" />
      <rect x="34" y="21" width="6" height="6" className="fill-signal" />
    </svg>
  );
}

export function Wordmark({ markClass = "size-8" }: { markClass?: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark className={markClass} />
      <span className="text-sm font-medium tracking-widest text-fg lowercase">phantomlink</span>
    </span>
  );
}
