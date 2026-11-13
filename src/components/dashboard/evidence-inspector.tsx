import { useState } from "react";
import { SimBadge } from "@/components/simulation-banner";
import { formatClock } from "@/lib/mock-telemetry";
import type { ProvenanceRecord } from "@/lib/data/contracts";
import type { DashboardData } from "./use-dashboard-data";
import { Panel, StateGate, focus } from "./common";

const VERIFICATION_TEXT: Record<ProvenanceRecord["verification"], string> = {
  "unverified-simulated": "Simulated, not cryptographically verified",
  "not-available": "Not available",
  "verified-by-backend": "Verified by backend (frontend did not check)",
};

export function EvidenceInspector({ data }: { data: DashboardData }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return (
    <Panel id="evidence" title="Evidence inspector" right={<SimBadge />}>
      <StateGate state={data.provenance} emptyText="No provenance records.">
        {(records) => {
          const rec = records.find((r) => r.eventId === selectedId) ?? records[0];
          return (
            <div className="grid min-w-0 gap-px bg-line xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <ul className="bg-surface" aria-label="Evidence records">
                {records.map((r) => (
                  <li key={r.eventId} className="border-t border-line first:border-t-0">
                    <button
                      type="button"
                      aria-pressed={r.eventId === rec.eventId}
                      onClick={() => setSelectedId(r.eventId)}
                      className={`flex min-h-11 w-full items-center justify-between gap-3 px-4 py-2 text-left font-mono text-xs hover:bg-bg ${r.eventId === rec.eventId ? "bg-bg" : ""} ${focus}`}
                    >
                      <span>{r.eventId}</span>
                      <span className="text-muted tabular-nums">#{r.sequence}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="min-w-0 bg-surface p-4">
                <dl className="grid grid-cols-2 gap-4">
                  {[
                    ["Event identifier", rec.eventId],
                    ["Sequence number", String(rec.sequence)],
                    ["Source frame reference", rec.sourceFrameRef ?? "Not available"],
                    ["Timestamp", formatClock(rec.timestamp)],
                    ["Schema version", rec.schemaVersion ?? "Not available"],
                    ["Hash", rec.hash ?? "None. No hash exists for simulated records."],
                  ].map(([k, v]) => (
                    <div key={k} className="min-w-0">
                      <dt className="font-mono text-xs text-muted">{k}</dt>
                      <dd className="mt-0.5 text-sm break-all">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 border border-pumpkin px-3 py-2 font-mono text-xs text-pumpkin">
                  {VERIFICATION_TEXT[rec.verification]}
                </p>
                <p className="mt-2 font-mono text-xs text-muted">Not verified by frontend</p>
                <p className="mt-3 text-xs text-muted">
                  This page never computes or checks signatures or hashes. A verification result can only
                  come from a backend.
                </p>
              </div>
            </div>
          );
        }}
      </StateGate>
    </Panel>
  );
}
