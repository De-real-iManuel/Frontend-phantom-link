import { SimBadge } from "@/components/simulation-banner";
import { formatClock } from "@/lib/mock-telemetry";
import type { DashboardData } from "./use-dashboard-data";
import { Panel, StateGate, Th } from "./common";

export function AgentActivityPanel({ data }: { data: DashboardData }) {
  return (
    <div className="grid min-w-0 gap-4">
      <Panel id="agents" title="Available MCP tools" right={<SimBadge />}>
        <StateGate state={data.tools} emptyText="No tools declared.">
          {(tools) => (
            <ul>
              {tools.map((t) => (
                <li key={t.name} className="border-t border-line px-4 py-3 first:border-t-0">
                  <p className="font-mono text-sm">
                    {t.name}
                    {t.planned ? (
                      <span className="ml-2 border border-line px-1.5 py-0.5 text-[10px] tracking-widest text-muted uppercase">
                        Planned
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted">{t.description}</p>
                </li>
              ))}
            </ul>
          )}
        </StateGate>
      </Panel>
      <Panel id="agent-requests" title="Agent requests" right={<SimBadge />}>
        <StateGate state={data.agents} emptyText="No agent requests.">
          {(items) => (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] border-collapse font-mono text-xs">
                <caption className="sr-only">
                  Simulated agent requests. No MCP tool was executed.
                </caption>
                <thead>
                  <tr className="text-left text-muted">
                    <Th>Time</Th>
                    <Th>Tool</Th>
                    <Th>Status</Th>
                    <Th>Device</Th>
                    <Th>Telemetry</Th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a) => (
                    <tr key={a.id} className="border-t border-line">
                      <td className="px-3 py-2 text-muted tabular-nums">{formatClock(a.timestamp)}</td>
                      <td className="px-3 py-2">{a.tool}</td>
                      <td className="px-3 py-2 text-pumpkin">{a.status}</td>
                      <td className="px-3 py-2 text-muted">{a.deviceId ?? "n/a"}</td>
                      <td className="px-3 py-2 text-muted">{a.telemetryRef ?? "n/a"}</td>
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
