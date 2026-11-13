import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Wordmark } from "@/components/mark";
import { FogLayer } from "@/components/ghost-effects";
import { Device3D, type DevicePart } from "@/components/device-view";
import {
  BASELINE,
  devices,
  formatClock,
  eventsPerMin,
  initialTelemetry,
  openDrifts,
  partDetails,
  tickTelemetry,
  type DeviceStatus,
  type PointState,
  type Telemetry,
} from "@/lib/mock-telemetry";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

const nav = [
  ["overview", "Overview"],
  ["devices", "Devices"],
  ["events", "Events"],
  ["agents", "Agents"],
  ["settings", "Settings"],
] as const;

const stateChip: Record<PointState, string> = {
  steady: "border-line text-muted",
  drifting: "border-pumpkin text-pumpkin",
  high: "border-signal bg-signal text-bg",
};

const statusDot: Record<DeviceStatus, string> = {
  online: "bg-signal",
  degraded: "bg-pumpkin",
  offline: "bg-muted",
};

function Panel({
  id,
  title,
  children,
  right,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id ?? title}-h`}
      className="scroll-mt-24 border border-line bg-surface"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2
          id={`${id ?? title}-h`}
          className="font-mono text-xs tracking-widest text-muted uppercase"
        >
          {title}
        </h2>
        {right}
      </div>
      {children}
    </section>
  );
}

export function DashboardPage() {
  const [data, setData] = useState<Telemetry>(initialTelemetry);
  const [mounted, setMounted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [band, setBand] = useState(0.5);
  const [selectedDevice, setSelectedDevice] = useState(devices[0].id);
  const [part, setPart] = useState<DevicePart | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setData((prev) => tickTelemetry(prev));
    }, 1800);
    return () => window.clearInterval(timer);
  }, [paused]);

  const device = devices.find((d) => d.id === selectedDevice) ?? devices[0];
  const online = devices.filter((d) => d.status !== "offline").reduce((n, d) => n + d.points, 0);
  const total = devices.reduce((n, d) => n + d.points, 0);
  const agentCalls = data.tools.reduce((n, t) => n + t.calls, 0);

  const kpis = [
    ["Points online", `${online}/${total}`],
    ["Events per min (window)", String(eventsPerMin(data.events))],
    ["Drifts in window", String(openDrifts(data.events))],
    ["Agent calls", agentCalls.toLocaleString("en-US")],
  ];

  return (
    <div className="relative min-h-screen bg-bg text-fg md:grid md:grid-cols-[13rem_minmax(0,1fr)]">
      <aside className="border-b border-line bg-bg md:sticky md:top-0 md:h-screen md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:block md:py-5">
          <Link to="/" className={focus} aria-label="Phantomlink home">
            <Wordmark />
          </Link>
          <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto md:mt-8 md:flex-col">
            {nav.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className={`flex h-11 shrink-0 items-center px-3 text-sm text-muted transition-colors duration-200 hover:bg-surface hover:text-fg ${focus}`}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <div className="relative min-w-0">
        <FogLayer className="opacity-60" />
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur-md">
          <p className="inline-flex h-11 items-center gap-2 border border-pumpkin px-3 font-mono text-xs text-pumpkin">
            Simulated data
          </p>
          <button
            type="button"
            aria-pressed={!paused}
            onClick={() => setPaused((value) => !value)}
            className={`inline-flex h-11 items-center gap-2 border border-line px-3 font-mono text-xs transition-colors duration-200 hover:border-signal active:scale-[0.96] ${focus}`}
          >
            <span
              className={`size-2 rounded-full ${paused ? "bg-muted" : "bg-signal flicker"}`}
              aria-hidden="true"
            />
            {paused ? "Paused" : "Live"}
          </button>
        </header>

        <main className="relative grid grid-cols-[minmax(0,1fr)] gap-4 p-4 md:p-6">
          <h1 className="sr-only">Phantomlink dashboard, simulated data</h1>

          <section
            id="overview"
            className="scroll-mt-24 grid grid-cols-2 gap-px bg-line lg:grid-cols-4"
            aria-label="Key figures"
          >
            {kpis.map(([label, value]) => (
              <div key={label} className="bg-surface p-4">
                <p className="font-mono text-xs text-muted">{label}</p>
                <p className="mt-2 font-mono text-2xl tabular-nums md:text-3xl">{value}</p>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Panel
              title="Reference: boiler-3 discharge pressure (bar)"
              right={<span className="font-mono text-xs text-muted">baseline {BASELINE}</span>}
            >
              <div
                className="h-64 p-2"
                role="img"
                aria-label="Line chart of discharge pressure with a drift band around the baseline"
              >
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.series}
                      margin={{ top: 8, right: 12, bottom: 0, left: -12 }}
                    >
                      <CartesianGrid stroke="#2a2442" strokeDasharray="2 4" vertical={false} />
                      <XAxis dataKey="i" hide />
                      <YAxis
                        domain={[BASELINE - 1.4, BASELINE + 1.4]}
                        ticks={[5, 5.7, 6.4, 7.1, 7.8]}
                        tickFormatter={(value: number) => value.toFixed(1)}
                        tick={{ fill: "#a29cba", fontSize: 11, fontFamily: "IBM Plex Mono" }}
                        stroke="#2a2442"
                      />
                      <ReferenceArea
                        y1={BASELINE - band}
                        y2={BASELINE + band}
                        fill="#7dffa1"
                        fillOpacity={0.08}
                        stroke="#7dffa1"
                        strokeOpacity={0.3}
                        strokeDasharray="3 3"
                      />
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke="#7dffa1"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="p-4 font-mono text-xs text-muted">Reading the bus...</p>
                )}
              </div>
            </Panel>

            <Panel
              title={`Selected: ${device.name}`}
              right={<span className="font-mono text-xs text-muted">{device.bus}</span>}
            >
              <Device3D selected={part} onSelect={setPart} className="h-56 md:h-64" />
              <div className="border-t border-line p-4" aria-live="polite">
                {part ? (
                  <>
                    <p className="font-mono text-sm text-signal">
                      {partDetails(device, part).title}
                    </p>
                    <p className="mt-1 text-sm text-muted">{partDetails(device, part).detail}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted">
                    Drag to turn the gateway. Click a port for details.
                  </p>
                )}
              </div>
            </Panel>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Panel id="events" title="Event stream">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[30rem] border-collapse font-mono text-xs">
                  <caption className="sr-only">
                    Latest named events from the plant. Rows for the selected device are
                    highlighted.
                  </caption>
                  <thead>
                    <tr className="text-left text-muted">
                      <th scope="col" className="px-4 py-2 font-normal">
                        Time
                      </th>
                      <th scope="col" className="px-2 py-2 font-normal">
                        Asset
                      </th>
                      <th scope="col" className="px-2 py-2 font-normal">
                        Point
                      </th>
                      <th scope="col" className="px-2 py-2 font-normal">
                        Value
                      </th>
                      <th scope="col" className="px-4 py-2 font-normal">
                        State
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.events.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-muted">
                          No events yet. The bus is quiet.
                        </td>
                      </tr>
                    ) : (
                      data.events.map((event) => (
                        <tr
                          key={event.id}
                          className={`rise border-t border-line ${event.asset === device.asset ? "bg-bg" : ""}`}
                        >
                          <td className="px-4 py-2 text-muted tabular-nums">
                            {formatClock(event.ts)}
                          </td>
                          <td className="px-2 py-2">{event.asset}</td>
                          <td className="px-2 py-2 text-muted">{event.point}</td>
                          <td className="px-2 py-2 tabular-nums">{event.value}</td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-block border px-2 py-0.5 ${stateChip[event.state]}`}
                            >
                              {event.state}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>

            <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
              <Panel id="devices" title="Devices">
                <ul>
                  {devices.map((d) => {
                    const on = d.id === selectedDevice;
                    return (
                      <li key={d.id} className="border-t border-line first:border-t-0">
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => {
                            setSelectedDevice(d.id);
                            setPart(null);
                          }}
                          className={`flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-bg ${on ? "bg-bg" : ""} ${focus}`}
                        >
                          <span className="min-w-0">
                            <span className="block text-sm">{d.name}</span>
                            <span className="block font-mono text-xs text-muted">
                              {d.bus} · {d.points} points
                            </span>
                          </span>
                          <span className="flex items-center gap-2 font-mono text-xs text-muted">
                            <span
                              className={`size-2 rounded-full ${statusDot[d.status]}`}
                              aria-hidden="true"
                            />
                            {d.status}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Panel>

              <Panel id="agents" title="Agents">
                <ul>
                  {data.tools.map((tool) => (
                    <li
                      key={tool.name}
                      className="flex items-baseline justify-between gap-3 border-t border-line px-4 py-3 first:border-t-0"
                    >
                      <span className="min-w-0">
                        <span className="block font-mono text-sm">{tool.name}</span>
                        <span className="block text-xs text-muted">{tool.blurb}</span>
                      </span>
                      <span className="font-mono text-sm text-signal tabular-nums">
                        {tool.calls.toLocaleString("en-US")}
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </div>

          <Panel id="settings" title="Settings">
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-muted">
                Drift band (bar, plus or minus)
                <input
                  type="number"
                  min={0.1}
                  max={1.2}
                  step={0.1}
                  value={band}
                  onChange={(event) =>
                    setBand(Math.min(1.2, Math.max(0.1, Number(event.target.value) || 0.1)))
                  }
                  className={`h-11 border border-line bg-bg px-3 font-mono text-fg ${focus}`}
                />
              </label>
              <p className="self-end text-sm text-muted">
                Data on this page is simulated. Nothing leaves the browser.
              </p>
            </div>
          </Panel>
        </main>
      </div>
    </div>
  );
}
