import { createContext, createElement, useContext, type ReactNode } from "react";
import { devices, initialTelemetry, tickTelemetry, type Telemetry } from "../mock-telemetry.ts";
import type { DataSourceState, DeviceIdentity, McpToolInfo } from "./contracts.ts";

export type DataSourceKind = "simulation" | "backend";

export interface PhantomLinkDataSource {
  readonly kind: DataSourceKind;
  /** True when every value from this source is synthetic. */
  readonly simulated: boolean;
  getDevices(): DataSourceState<DeviceIdentity[]>;
  getTools(): DataSourceState<McpToolInfo[]>;
  initialTelemetry(): DataSourceState<Telemetry>;
  tick(prev: Telemetry): Telemetry;
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
