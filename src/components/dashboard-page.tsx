import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/mark";
import { SimulationBanner } from "@/components/simulation-banner";
import { FogLayer } from "@/components/ghost-effects";
import { BackendDataSource, DataSourceProvider, SimulationDataSource } from "@/lib/data/adapter";
import { focus } from "@/components/dashboard/common";
import { useDashboardData } from "@/components/dashboard/use-dashboard-data";
import { OverviewSection } from "@/components/dashboard/overview-section";
import { DeviceExplorer } from "@/components/dashboard/device-explorer";
import { FrameInspector } from "@/components/dashboard/frame-inspector";
import { TelemetryExplorer } from "@/components/dashboard/telemetry-explorer";
import { EvidenceInspector } from "@/components/dashboard/evidence-inspector";
import { AgentActivityPanel } from "@/components/dashboard/agent-activity";

const sections = [
  ["overview", "Overview"],
  ["devices", "Devices"],
  ["frames", "Frames"],
  ["telemetry", "Telemetry"],
  ["evidence", "Evidence"],
  ["agents", "Agents"],
] as const;

type SectionId = (typeof sections)[number][0];

const simulation = new SimulationDataSource();
const backend = new BackendDataSource();

function DashboardBody({ useBackend, onToggleSource }: { useBackend: boolean; onToggleSource: () => void }) {
  const data = useDashboardData();
  const [section, setSection] = useState<SectionId>("overview");

  useEffect(() => {
    const id = window.location.hash.slice(1);
    const match = sections.find(([s]) => s === id);
    if (match) setSection(match[0]);
  }, []);

  const choose = (id: SectionId) => {
    setSection(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="relative min-h-screen bg-bg text-fg md:grid md:grid-cols-[13rem_minmax(0,1fr)]">
      <aside className="border-b border-line bg-bg md:sticky md:top-0 md:h-screen md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:block md:py-5">
          <Link to="/" className={focus} aria-label="Phantomlink home">
            <Wordmark />
          </Link>
          <nav aria-label="Dashboard sections" className="flex gap-1 overflow-x-auto md:mt-8 md:flex-col">
            {sections.map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-current={section === id ? "page" : undefined}
                onClick={() => choose(id)}
                className={`flex h-11 shrink-0 items-center px-3 text-left text-sm transition-colors duration-200 hover:bg-surface hover:text-fg ${section === id ? "bg-surface text-fg" : "text-muted"} ${focus}`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <div className="relative min-w-0">
        <FogLayer className="opacity-60" />
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur-md">
          <p
            className={`inline-flex h-11 items-center border px-3 font-mono text-xs ${useBackend ? "border-line text-muted" : "border-pumpkin text-pumpkin"}`}
          >
            {useBackend ? "Backend: not connected" : "Simulated data"}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={useBackend}
              onClick={onToggleSource}
              className={`inline-flex h-11 items-center border border-line px-3 font-mono text-xs transition-colors duration-200 hover:border-signal ${focus}`}
            >
              {useBackend ? "Use simulation" : "Try backend source"}
            </button>
            <Link
              to="/devices"
              className={`inline-flex h-11 items-center border border-line px-3 font-mono text-xs transition-colors duration-200 hover:border-signal ${focus}`}
            >
              Devices
            </Link>
            <button
              type="button"
              aria-pressed={!data.paused}
              disabled={!data.simulated}
              onClick={() => data.setPaused(!data.paused)}
              className={`inline-flex h-11 items-center gap-2 border border-line px-3 font-mono text-xs transition-colors duration-200 hover:border-signal active:scale-[0.96] disabled:opacity-50 ${focus}`}
            >
              <span
                className={`size-2 rounded-full ${data.paused || !data.simulated ? "bg-muted" : "bg-signal flicker"}`}
                aria-hidden="true"
              />
              {data.paused ? "Paused" : data.simulated ? "Live (simulated)" : "Idle"}
            </button>
          </div>
        </header>

        <main className="relative grid grid-cols-[minmax(0,1fr)] gap-4 p-4 md:p-6">
          {data.simulated ? (
            <SimulationBanner />
          ) : (
            <p role="status" className="border border-line bg-surface px-3 py-2 font-mono text-xs text-muted">
              No backend is connected. Every section reports its service as unavailable.
            </p>
          )}
          <h1 className="sr-only">Phantomlink dashboard</h1>
          {section === "overview" ? <OverviewSection data={data} /> : null}
          {section === "devices" ? <DeviceExplorer data={data} /> : null}
          {section === "frames" ? <FrameInspector data={data} /> : null}
          {section === "telemetry" ? <TelemetryExplorer data={data} /> : null}
          {section === "evidence" ? <EvidenceInspector data={data} /> : null}
          {section === "agents" ? <AgentActivityPanel data={data} /> : null}
        </main>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [useBackend, setUseBackend] = useState(false);
  return (
    <DataSourceProvider source={useBackend ? backend : simulation}>
      <DashboardBody useBackend={useBackend} onToggleSource={() => setUseBackend((v) => !v)} />
    </DataSourceProvider>
  );
}
