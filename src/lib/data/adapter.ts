import { createContext, createElement, useContext, type ReactNode } from "react";
import {
  devices,
  initialTelemetry,
  seriesSpecs,
  tickTelemetry,
  type Telemetry,
} from "../mock-telemetry.ts";
import { buildException, buildReadRequest, parseFrame } from "../modbus/frame.ts";
import { toHexByte } from "../modbus/crc16.ts";
import type {
  AgentActivity,
  ConnectionState,
  DataSourceState,
  DeviceIdentity,
  DeviceSummary,
  McpToolInfo,
  ProvenanceRecord,
  RawFrame,
  TelemetryReading,
} from "./contracts.ts";

export type DataSourceKind = "simulation" | "backend";

export interface PhantomLinkDataSource {
  readonly kind: DataSourceKind;
  /** True when every value from this source is synthetic. */
  readonly simulated: boolean;
  getDevices(): DataSourceState<DeviceIdentity[]>;
  getTools(): DataSourceState<McpToolInfo[]>;
  initialTelemetry(): DataSourceState<Telemetry>;
  tick(prev: Telemetry): Telemetry;
  getDeviceSummaries(): DataSourceState<DeviceSummary[]>;
  getFrames(t: Telemetry): DataSourceState<RawFrame[]>;
  getReadings(t: Telemetry): DataSourceState<TelemetryReading[]>;
  getProvenance(t: Telemetry): DataSourceState<ProvenanceRecord[]>;
  getAgentActivity(t: Telemetry): DataSourceState<AgentActivity[]>;
}

const CONNECTION: Record<string, ConnectionState> = {
  online: "connected",
  degraded: "degraded",
  offline: "disconnected",
};

/** Demonstration-only request: register content is not attributed to any manufacturer map. */
function simulatedFrame(id: number, ts: number): RawFrame {
  const slave = 1 + (id % devices.length);
  const register = (id * 2) % 64;
  let bytes: number[];
  if (id % 7 === 0) {
    bytes = buildException(slave, 3, 2);
  } else {
    bytes = buildReadRequest(slave, 3, register, 2);
    // Every fifth frame has a deliberately corrupted CRC so the rejected path is visible.
    if (id % 5 === 0) bytes[bytes.length - 1] ^= 0xff;
  }
  const parsed = parseFrame(bytes);
  return {
    id: `sim-frm-${id}`,
    timestamp: ts,
    hexBytes: bytes.map(toHexByte),
    slaveAddress: parsed.slaveAddress,
    functionCode: parsed.functionCode,
    registerAddress: parsed.registerAddress,
    crcExpected: parsed.crcCarried,
    crcComputed: parsed.crcComputed,
    status: parsed.status,
    simulated: true,
  };
}

export class SimulationDataSource implements PhantomLinkDataSource {
  readonly kind = "simulation" as const;
  readonly simulated = true;

  getDevices(): DataSourceState<DeviceIdentity[]> {
    return {
      status: "ready",
      data: devices.map((d) => ({
        id: d.id,
        name: d.name,
        manufacturer: null,
        model: null,
        firmware: null,
        serial: null,
        protocol: null,
        simulated: true,
      })),
    };
  }

  getTools(): DataSourceState<McpToolInfo[]> {
    return {
      status: "ready",
      data: initialTelemetry().tools.map((t) => ({
        name: t.name,
        description: t.blurb,
        planned: true,
      })),
    };
  }

  initialTelemetry(): DataSourceState<Telemetry> {
    return { status: "ready", data: initialTelemetry() };
  }

  tick(prev: Telemetry): Telemetry {
    return tickTelemetry(prev);
  }

  getDeviceSummaries(): DataSourceState<DeviceSummary[]> {
    return {
      status: "ready",
      data: devices.map((d) => ({
        id: d.id,
        name: d.name,
        manufacturer: null,
        model: null,
        firmware: null,
        serial: null,
        protocol: "Modbus RTU (simulated)",
        interface: d.bus,
        connection: CONNECTION[d.status] ?? "unavailable",
        telemetryPoints: d.points,
        simulated: true,
      })),
    };
  }

  getFrames(t: Telemetry): DataSourceState<RawFrame[]> {
    if (t.events.length === 0) return { status: "empty" };
    return { status: "ready", data: t.events.map((e) => simulatedFrame(e.id, e.ts)) };
  }

  getReadings(t: Telemetry): DataSourceState<TelemetryReading[]> {
    const ts = t.events[0]?.ts ?? 0;
    const data = devices.map((d) => {
      const spec = seriesSpecs[d.id];
      const series = t.seriesByDevice[d.id];
      const last = series[series.length - 1];
      return {
        name: spec.point,
        value: last.v,
        unit: spec.unit,
        deviceId: d.id,
        timestamp: ts,
        source: "Simulation (src/lib/mock-telemetry.ts)",
        decoder: "Demonstration scaling. No manufacturer register map applied.",
        simulated: true,
      };
    });
    return { status: "ready", data };
  }

  getProvenance(t: Telemetry): DataSourceState<ProvenanceRecord[]> {
    if (t.events.length === 0) return { status: "empty" };
    return {
      status: "ready",
      data: t.events.map((e) => ({
        eventId: `sim-evt-${e.id}`,
        sequence: e.id,
        sourceFrameRef: `sim-frm-${e.id}`,
        timestamp: e.ts,
        schemaVersion: "simulation-placeholder",
        hash: null,
        verification: "unverified-simulated" as const,
      })),
    };
  }

  getAgentActivity(t: Telemetry): DataSourceState<AgentActivity[]> {
    const tools = t.tools;
    if (t.events.length === 0 || tools.length === 0) return { status: "empty" };
    const data = t.events.slice(0, 6).map((e, i) => {
      const device = devices.find((d) => d.asset === e.asset) ?? null;
      return {
        id: `sim-req-${e.id}`,
        timestamp: e.ts,
        tool: tools[i % tools.length].name,
        summary: `Simulated request about ${e.asset}`,
        status: "simulated" as const,
        deviceId: device?.id ?? null,
        telemetryRef: e.point,
        simulated: true,
      };
    });
    return { status: "ready", data };
  }
}

const BACKEND_UNAVAILABLE = "No backend is connected. Nothing is requested.";

/** Placeholder. Performs no network calls and invents no routes. */
export class BackendDataSource implements PhantomLinkDataSource {
  readonly kind = "backend" as const;
  readonly simulated = false;

  getDevices(): DataSourceState<DeviceIdentity[]> {
    return { status: "unavailable", reason: BACKEND_UNAVAILABLE };
  }

  getTools(): DataSourceState<McpToolInfo[]> {
    return { status: "unavailable", reason: BACKEND_UNAVAILABLE };
  }

  initialTelemetry(): DataSourceState<Telemetry> {
    return { status: "unavailable", reason: BACKEND_UNAVAILABLE };
  }

  tick(prev: Telemetry): Telemetry {
    return prev;
  }

  getDeviceSummaries(): DataSourceState<DeviceSummary[]> {
    return { status: "unavailable", reason: BACKEND_UNAVAILABLE };
  }

  getFrames(): DataSourceState<RawFrame[]> {
    return { status: "unavailable", reason: BACKEND_UNAVAILABLE };
  }

  getReadings(): DataSourceState<TelemetryReading[]> {
    return { status: "unavailable", reason: BACKEND_UNAVAILABLE };
  }

  getProvenance(): DataSourceState<ProvenanceRecord[]> {
    return { status: "unavailable", reason: BACKEND_UNAVAILABLE };
  }

  getAgentActivity(): DataSourceState<AgentActivity[]> {
    return { status: "unavailable", reason: BACKEND_UNAVAILABLE };
  }
}

const DataSourceContext = createContext<PhantomLinkDataSource>(new SimulationDataSource());

export function DataSourceProvider({
  source,
  children,
}: {
  source: PhantomLinkDataSource;
  children: ReactNode;
}) {
  return createElement(DataSourceContext.Provider, { value: source }, children);
}

export function useDataSource(): PhantomLinkDataSource {
  return useContext(DataSourceContext);
}
