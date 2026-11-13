import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { SimBadge } from "@/components/simulation-banner";
import { formatClock, seriesSpecs } from "@/lib/mock-telemetry";
import type { DashboardData } from "./use-dashboard-data";
import { Panel, StateGate, Th, focus } from "./common";

export function TelemetryExplorer({ data }: { data: DashboardData }) {
  const [selected, setSelected] = useState("sim-a");
  const [band, setBand] = useState(0.5);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Panel id="telemetry" title="Telemetry explorer" right={<SimBadge />}>
      <StateGate state={data.readings} emptyText="No measurements decoded.">
        {(readings) => {
          const current = readings.find((r) => r.deviceId === selected) ?? readings[0];
          const spec = seriesSpecs[current.deviceId];
          const series = data.telemetry.status === "ready" ? data.telemetry.data.seriesByDevice[current.deviceId] : undefined;
          return (
            <div className="grid min-w-0 gap-px bg-line">
              <div className="min-w-0 overflow-x-auto bg-surface">
                <table className="w-full min-w-[34rem] border-collapse font-mono text-xs">
                  <caption className="sr-only">
                    Named synthetic measurements. Select a measurement to chart it.
                  </caption>
                  <thead>
                    <tr className="text-left text-muted">
                      <Th>Measurement</Th>
                      <Th>Value</Th>
                      <Th>Device</Th>
                      <Th>Timestamp</Th>
                      <Th>Source</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.map((r) => (
                      <tr key={r.deviceId} className={`border-t border-line ${r.deviceId === current.deviceId ? "bg-bg" : ""}`}>
                        <td className="px-1 py-1">
                          <button
                            type="button"
                            aria-pressed={r.deviceId === current.deviceId}
                            onClick={() => setSelected(r.deviceId)}
                            className={`min-h-11 px-2 text-left underline-offset-2 hover:underline ${focus}`}
                          >
                            {r.name}
                          </button>
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {r.value} {r.unit}
                        </td>
                        <td className="px-3 py-2 text-muted">{r.deviceId}</td>
                        <td className="px-3 py-2 text-muted tabular-nums">{formatClock(r.timestamp)}</td>
                        <td className="px-3 py-2 text-muted">simulation</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="min-w-0 bg-surface p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <p className="font-mono text-xs text-muted">
                    {current.name} ({current.unit}), synthetic, device {current.deviceId}
                  </p>
                  <label className="flex items-center gap-2 text-xs text-muted">
                    Drift band, plus or minus
                    <input
                      type="number"
                      min={0.1}
                      max={1.2}
                      step={0.1}
                      value={band}
                      onChange={(e) => setBand(Math.min(1.2, Math.max(0.1, Number(e.target.value) || 0.1)))}
                      className={`h-11 w-20 border border-line bg-bg px-2 font-mono text-fg ${focus}`}
                    />
                  </label>
                </div>
                <div className="h-56" role="img" aria-label={`Line chart of synthetic ${current.name} readings`}>
                  {mounted && series ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                        <CartesianGrid stroke="#2a2442" strokeDasharray="2 4" vertical={false} />
                        <XAxis dataKey="i" hide />
                        <YAxis
                          domain={[spec.base - spec.range - 0.2, spec.base + spec.range + 0.2]}
                          tickFormatter={(v: number) => v.toFixed(1)}
                          tick={{ fill: "#a29cba", fontSize: 11, fontFamily: "IBM Plex Mono" }}
                          stroke="#2a2442"
                        />
                        <ReferenceArea
                          y1={spec.base - band}
                          y2={spec.base + band}
                          fill="#7dffa1"
                          fillOpacity={0.08}
                          stroke="#7dffa1"
                          strokeOpacity={0.3}
                          strokeDasharray="3 3"
                        />
                        <Line type="monotone" dataKey="v" stroke="#7dffa1" strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="font-mono text-xs text-muted">Source</dt>
                    <dd className="text-sm break-words">{current.source}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs text-muted">Decoding</dt>
                    <dd className="text-sm break-words">{current.decoder ?? "Not available"}</dd>
                  </div>
                </dl>
              </div>
            </div>
          );
        }}
      </StateGate>
    </Panel>
  );
}
