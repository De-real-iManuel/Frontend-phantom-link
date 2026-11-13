export type PointState = "steady" | "drifting" | "high";
export type DeviceStatus = "online" | "degraded" | "offline";

export type Device = {
  id: string;
  name: string;
  bus: string;
  asset: string;
  points: number;
  status: DeviceStatus;
};

export type TelemetryEvent = {
  id: number;
  ts: number;
  asset: string;
  point: string;
  value: string;
  state: PointState;
};

export type SeriesPoint = { i: number; v: number };

export type AgentTool = { name: string; blurb: string; calls: number };

export type Telemetry = {
  seq: number;
  events: TelemetryEvent[];
  series: SeriesPoint[];
  tools: AgentTool[];
  eventsPerMin: number;
  openDrifts: number;
};

export const BASELINE = 6.4;
export const SITES = ["Boiler house", "Cold room", "Air handler row"] as const;

export const devices: Device[] = [
  {
    id: "gw-01",
    name: "Gateway 01",
    bus: "Modbus RTU",
    asset: "boiler-3",
    points: 62,
    status: "online",
  },
  {
    id: "gw-02",
    name: "Gateway 02",
    bus: "4-20 mA",
    asset: "line-2",
    points: 38,
    status: "online",
  },
  {
    id: "gw-03",
    name: "Gateway 03",
    bus: "BACnet",
    asset: "ahu-1",
    points: 27,
    status: "degraded",
  },
  {
    id: "gw-04",
    name: "Gateway 04",
    bus: "OPC classic",
    asset: "press-7",
    points: 13,
    status: "offline",
  },
];

const registers = [
  { asset: "boiler-3", point: "discharge pressure", unit: "bar", base: 6.4, spread: 0.7 },
  { asset: "line-2", point: "room temperature", unit: "°C", base: 4.1, spread: 0.9 },
  { asset: "ahu-1", point: "supply air", unit: "°F", base: 71.4, spread: 4 },
  { asset: "boiler-3", point: "fuel rate", unit: "m³/h", base: 112, spread: 9 },
];

/** Deterministic PRNG so server and client render the same first frame. */
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BASE_TS = Date.UTC(2026, 9, 31, 8, 0, 0);

function makeEvent(rand: () => number, id: number, ts: number): TelemetryEvent {
  const reg = registers[Math.floor(rand() * registers.length)];
  const offset = (rand() - 0.5) * 2 * reg.spread;
  const ratio = Math.abs(offset) / reg.spread;
  const state: PointState = ratio > 0.85 ? "high" : ratio > 0.55 ? "drifting" : "steady";
  const digits = reg.base > 50 ? 0 : 1;
  return {
    id,
    ts,
    asset: reg.asset,
    point: reg.point,
    value: `${(reg.base + offset).toFixed(digits)} ${reg.unit}`,
    state,
  };
}

export function initialTelemetry(): Telemetry {
  const rand = mulberry32(31);
  const events = Array.from({ length: 12 }, (_, i) => makeEvent(rand, 12 - i, BASE_TS - i * 4000));
  const series = Array.from({ length: 40 }, (_, i) => ({
    i,
    v: Number(
      (
        BASELINE +
        Math.sin(i / 4) * 0.25 +
        (rand() - 0.5) * 0.3 -
        (i > 30 ? (i - 30) * 0.06 : 0)
      ).toFixed(2),
    ),
  }));
  return {
    seq: 12,
    events,
    series,
    eventsPerMin: 84,
    openDrifts: 3,
    tools: [
      { name: "read_asset", blurb: "Read a named point with units and state", calls: 1284 },
      { name: "explain_drift", blurb: "Correlate a drift with nearby assets", calls: 316 },
      { name: "subscribe_alarm", blurb: "Stream state changes to an agent", calls: 92 },
    ],
  };
}

/** Advance telemetry by one tick. Uses a simulated clock that advances 1.8 s per tick. */
export function tickTelemetry(prev: Telemetry, rand: () => number = Math.random): Telemetry {
  const seq = prev.seq + 1;
  const event = makeEvent(rand, seq, prev.events[0].ts + 1800);
  const last = prev.series[prev.series.length - 1];
  const next = Number(
    Math.min(
      BASELINE + 1.2,
      Math.max(BASELINE - 1.2, last.v + (BASELINE - last.v) * 0.12 + (rand() - 0.5) * 0.35),
    ).toFixed(2),
  );
  const tools = prev.tools.map((tool) =>
    rand() < 0.35 ? { ...tool, calls: tool.calls + 1 } : tool,
  );
  const drifting = event.state === "steady" ? 0 : 1;
  return {
    seq,
    events: [event, ...prev.events].slice(0, 12),
    series: [...prev.series.slice(1), { i: last.i + 1, v: next }],
    tools,
    eventsPerMin: Math.max(60, Math.min(120, prev.eventsPerMin + Math.round((rand() - 0.5) * 6))),
    openDrifts: Math.max(
      0,
      Math.min(9, prev.openDrifts + (drifting && rand() < 0.2 ? 1 : rand() < 0.1 ? -1 : 0)),
    ),
  };
}

export function formatClock(ts: number) {
  return new Date(ts).toISOString().slice(11, 19);
}

export const partDetails: Record<string, { title: string; detail: string }> = {
  "RS-485": { title: "RS-485 bus", detail: "Modbus RTU, 9600 8E1, slave 01. 62 points mapped." },
  "4-20mA": {
    title: "4-20 mA loops",
    detail: "Four analog inputs, 12-bit, span-scaled per point.",
  },
  Ethernet: { title: "Ethernet uplink", detail: "Outbound events only. No inbound ports open." },
  Antenna: { title: "Antenna", detail: "Optional LTE fallback when the plant network is down." },
};
