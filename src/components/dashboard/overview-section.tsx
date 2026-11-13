import { SimBadge } from "@/components/simulation-banner";
import { formatClock } from "@/lib/mock-telemetry";
import type { PointState } from "@/lib/mock-telemetry";
import type { DashboardData } from "./use-dashboard-data";
import { useThrottled } from "./use-dashboard-data";
import { Panel, StateGate, Th } from "./common";

const stateChip: Record<PointState, string> = {
  steady: "border-line text-muted",
  drifting: "border-pumpkin text-pumpkin",
  high: "border-signal bg-signal text-bg",
};

function Kpi({ label, value, note, text }: { label: string; value: string; note?: string; text?: boolean }) {
  return (
    <div className="bg-surface p-4">
      <p className="font-mono text-xs text-muted">{label}</p>
      <p className={`mt-2 font-mono tabular-nums break-words ${text ? "text-base md:text-lg" : "text-2xl md:text-3xl"}`}>{value}</p>
      {note ? <p className="mt-1 font-mono text-[10px] text-muted">{note}</p> : null}
    </div>
  );
}

export function OverviewSection({ data }: { data: DashboardData }) {
  const { devices, frames, provenance, agents, telemetry, tools } = data;
  const latest = telemetry.status === "ready" ? telemetry.data.events[0] : undefined;
  const announce = useThrottled(
    latest ? `Latest simulated event: ${latest.asset} ${latest.point} ${latest.value}, ${latest.state}` : "",
    10000,
  );

  return (
    <div className="grid min-w-0 gap-4">
      <Panel id="overview" title="Overview" right={<SimBadge />}>
        <StateGate state={devices}>
          {(list) => {
            const connected = list.filter(
              (d) => d.connection === "connected" || d.connection === "degraded",
            ).length;
            const frameList = frames.status === "ready" ? frames.data : null;
            const verified = frameList?.filter((f) => f.status === "ok").length;
            const rejected = frameList?.filter((f) => f.status === "crc-error").length;
            const provCount = provenance.status === "ready" ? provenance.data.length : null;
            const agentCount = agents.status === "ready" ? agents.data.length : null;
            const fmt = (n: number | null | undefined) => (n == null ? "n/a" : String(n));
            return (
              <div
                className="grid grid-cols-2 gap-px bg-line lg:grid-cols-3 xl:grid-cols-6"
                role="group"
                aria-label="Key figures, all simulated"
              >
                <Kpi
                  label="Connection"
                  value={connected > 0 ? "Simulated bus" : "Disconnected"}
                  note="No physical link"
                  text
                />
                <Kpi label="Devices responding" value={`${connected}/${list.length}`} note="simulated" />
                <Kpi label="Frames CRC valid" value={fmt(verified)} note="simulated, in window" />
                <Kpi label="Frames rejected" value={fmt(rejected)} note="simulated, in window" />
                <Kpi label="Provenance records" value={fmt(provCount)} note="simulated, unverified" />
                <Kpi label="MCP agent requests" value={fmt(agentCount)} note="simulated, none executed" />
              </div>
            );
          }}
        </StateGate>
        <p className="border-t border-line px-4 py-3 text-xs text-muted">
          {tools.status === "ready"
            ? `${tools.data.length} MCP tools are planned designs, not callable endpoints. `
            : ""}
          Frame counts use only the latest window of generated frames.
        </p>
      </Panel>

      <Panel id="recent-events" title="Recent telemetry events" right={<SimBadge />}>
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
        <StateGate state={telemetry} emptyText="No events yet. The bus is quiet.">
          {(t) => (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] border-collapse font-mono text-xs">
                <caption className="sr-only">Latest synthetic telemetry events</caption>
                <thead>
                  <tr className="text-left text-muted">
                    <Th>Time</Th>
                    <Th>Asset</Th>
                    <Th>Point</Th>
                    <Th>Value</Th>
                    <Th>State</Th>
                  </tr>
                </thead>
                <tbody>
                  {t.events.map((e) => (
                    <tr key={e.id} className="rise border-t border-line">
                      <td className="px-3 py-2 text-muted tabular-nums">{formatClock(e.ts)}</td>
                      <td className="px-3 py-2">{e.asset}</td>
                      <td className="px-3 py-2 text-muted">{e.point}</td>
                      <td className="px-3 py-2 tabular-nums">{e.value}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-block border px-2 py-0.5 ${stateChip[e.state]}`}>
                          {e.state}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </StateGate>
      </Panel>
    </div>
  );
}
