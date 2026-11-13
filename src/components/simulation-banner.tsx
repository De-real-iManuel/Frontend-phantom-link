export const SIMULATION_BANNER_TEXT = "SIMULATION MODE — SYNTHETIC DEVICE DATA";

/** Page-level notice that everything shown is generated, not measured. */
export function SimulationBanner({ className = "" }: { className?: string }) {
  return (
    <div
      role="status"
      className={`border border-pumpkin bg-surface px-3 py-2 font-mono text-xs tracking-widest text-pumpkin ${className}`}
    >
      {SIMULATION_BANNER_TEXT}
    </div>
  );
}

/** Small per-item label for simulated values. */
export function SimBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block border border-pumpkin px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-pumpkin uppercase ${className}`}
    >
      Simulated
    </span>
  );
}
