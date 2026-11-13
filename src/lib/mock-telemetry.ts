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

export type AgentTool = { name: string; blurb: string };

export type Telemetry = {
  seq: number;
  events: TelemetryEvent[];
  /** Series of the first device. Kept for callers that do not select a device. */
  series: SeriesPoint[];
  /** One synthetic series per device id. */
  seriesByDevice: Record<string, SeriesPoint[]>;
  tools: AgentTool[];
};

/** Synthetic chart point per device. Values are generated, not measured. */
export type SeriesSpec = {
  point: string;
  unit: string;
  base: number;
  /** Half-width of the clamp and chart domain. */
  range: number;
};

export const BASELINE = 6.4;

export const devices: Device[] = [
  { id: "sim-a", name: "Simulated device A", bus: "Modbus RTU", asset: "boiler-3", points: 62, status: "online" },
  { id: "sim-b", name: "Simulated device B", bus: "Modbus RTU", asset: "line-2", points: 38, status: "online" },
  { id: "sim-c", name: "Simulated device C", bus: "Modbus RTU", asset: "ahu-1", points: 27, status: "degraded" },
  { id: "sim-d", name: "Simulated device D", bus: "Modbus RTU", asset: "press-7", points: 13, status: "offline" },
];

export const seriesSpecs: Record<string, SeriesSpec> = {
  "sim-a": { point: "discharge pressure", unit: "bar", base: 6.4, range: 1.2 },
  "sim-b": { point: "room temperature", unit: "°C", base: 4.1, range: 1.2 },
  "sim-c": { point: "supply air", unit: "°F", base: 71.4, range: 4 },
  "sim-d": { point: "stroke count rate", unit: "/min", base: 18, range: 3 },
};

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
  const seriesByDevice: Record<string, SeriesPoint[]> = {};
  for (const device of devices) {
    const spec = seriesSpecs[device.id];
    const scale = spec.range / 1.2;
    seriesByDevice[device.id] = Array.from({ length: 40 }, (_, i) => ({
      i,
      v: Number(
        (
          spec.base +
          (Math.sin(i / 4) * 0.25 +
            (rand() - 0.5) * 0.3 -
            (i > 30 && device.id === "sim-a" ? (i - 30) * 0.06 : 0)) *
            scale
        ).toFixed(2),
      ),
    }));
  }
  return {
    seq: 12,
    events,
    series: seriesByDevice[devices[0].id],
    seriesByDevice,
    tools: [
      { name: "read_asset", blurb: "Planned: read a named point with units and state" },
      { name: "explain_drift", blurb: "Planned: correlate a drift with nearby assets" },
      { name: "subscribe_alarm", blurb: "Planned: stream state changes to an agent" },
    ],
  };
}

/** Advance telemetry by one tick. Uses a simulated clock that advances 1.8 s per tick. */
export function tickTelemetry(prev: Telemetry, rand: () => number = Math.random): Telemetry {
  const seq = prev.seq + 1;
  const event = makeEvent(rand, seq, prev.events[0].ts + 1800);
  const seriesByDevice: Record<string, SeriesPoint[]> = {};
  for (const device of devices) {
    const spec = seriesSpecs[device.id];
    const series = prev.seriesByDevice[device.id];
    const last = series[series.length - 1];
    const next = Number(
      Math.min(
        spec.base + spec.range,
        Math.max(
          spec.base - spec.range,
          last.v + (spec.base - last.v) * 0.12 + (rand() - 0.5) * 0.35 * (spec.range / 1.2),
        ),
      ).toFixed(2),
    );
    seriesByDevice[device.id] = [...series.slice(1), { i: last.i + 1, v: next }];
  }
  return {
    seq,
    events: [event, ...prev.events].slice(0, 12),
    series: seriesByDevice[devices[0].id],
    seriesByDevice,
    tools: prev.tools,
  };
}

export function formatClock(ts: number) {
  return new Date(ts).toISOString().slice(11, 19);
}

/** Drift count over the visible event window. */
export function openDrifts(events: TelemetryEvent[]) {
  return events.filter((event) => event.state !== "steady").length;
}

/** Event rate implied by the spacing of the visible event window. */
export function eventsPerMin(events: TelemetryEvent[]) {
  if (events.length < 2) return 0;
  const span = events[0].ts - events[events.length - 1].ts;
  if (span <= 0) return 0;
  return Math.round(((events.length - 1) * 60000) / span);
}

export type PartName = "RS-485" | "4-20mA" | "Ethernet" | "Antenna";

/** Part copy for the selected device. The 3D model is a generic illustrative gateway. */
export function partDetails(device: Device, part: PartName): { title: string; detail: string } {
  const sim = `${device.name} is simulated. ${device.points} synthetic points.`;
  switch (part) {
    case "RS-485":
      return { title: "RS-485 port", detail: `Serial side of a generic gateway. ${sim}` };
    case "4-20mA":
      return { title: "Analog inputs", detail: `Illustrative analog terminals. ${sim}` };
    case "Ethernet":
      return {
        title: "Ethernet uplink",
        detail:
          device.status === "offline"
            ? `${device.name} is shown offline in this simulation.`
            : "Illustrative uplink. No network traffic is generated by this view.",
      };
    case "Antenna":
      return { title: "Antenna", detail: "Illustrative antenna. Not tied to a real device." };
  }
}
