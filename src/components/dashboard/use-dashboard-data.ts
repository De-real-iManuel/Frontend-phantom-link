import { useEffect, useMemo, useRef, useState } from "react";
import { useDataSource } from "@/lib/data/adapter";
import type {
  AgentActivity,
  DataSourceState,
  DeviceSummary,
  McpToolInfo,
  ProvenanceRecord,
  RawFrame,
  TelemetryReading,
} from "@/lib/data/contracts";
import type { Telemetry } from "@/lib/mock-telemetry";

export type DashboardData = {
  simulated: boolean;
  paused: boolean;
  setPaused: (value: boolean) => void;
  telemetry: DataSourceState<Telemetry>;
  devices: DataSourceState<DeviceSummary[]>;
  tools: DataSourceState<McpToolInfo[]>;
  frames: DataSourceState<RawFrame[]>;
  readings: DataSourceState<TelemetryReading[]>;
  provenance: DataSourceState<ProvenanceRecord[]>;
  agents: DataSourceState<AgentActivity[]>;
};

function passthrough<T>(
  telemetry: DataSourceState<Telemetry>,
  ready: (t: Telemetry) => DataSourceState<T>,
): DataSourceState<T> {
  return telemetry.status === "ready" ? ready(telemetry.data) : telemetry;
}

/** Single place the dashboard reads data. Everything goes through the adapter. */
export function useDashboardData(): DashboardData {
  const source = useDataSource();
  const [telemetry, setTelemetry] = useState<DataSourceState<Telemetry>>({ status: "loading" });
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setTelemetry(source.initialTelemetry());
  }, [source]);

  useEffect(() => {
    if (paused || !source.simulated) return;
    const timer = window.setInterval(() => {
      setTelemetry((prev) =>
        prev.status === "ready" ? { status: "ready", data: source.tick(prev.data) } : prev,
      );
    }, 1800);
    return () => window.clearInterval(timer);
  }, [paused, source]);

  return useMemo(
    () => ({
      simulated: source.simulated,
      paused,
      setPaused,
      telemetry,
      devices: telemetryGate(telemetry, source.getDeviceSummaries()),
      tools: telemetryGate(telemetry, source.getTools()),
      frames: passthrough(telemetry, (t) => source.getFrames(t)),
      readings: passthrough(telemetry, (t) => source.getReadings(t)),
      provenance: passthrough(telemetry, (t) => source.getProvenance(t)),
      agents: passthrough(telemetry, (t) => source.getAgentActivity(t)),
    }),
    [source, telemetry, paused],
  );
}

/** Show loading until the first read resolves so server and client first paint match. */
function telemetryGate<T>(
  telemetry: DataSourceState<Telemetry>,
  own: DataSourceState<T>,
): DataSourceState<T> {
  return telemetry.status === "loading" ? { status: "loading" } : own;
}

/** Returns the latest value, refreshed at most once per interval. Used for aria-live text. */
export function useThrottled<T>(value: T, ms: number): T {
  const [held, setHeld] = useState(value);
  const latest = useRef(value);
  latest.current = value;
  useEffect(() => {
    const timer = window.setInterval(() => setHeld(latest.current), ms);
    return () => window.clearInterval(timer);
  }, [ms]);
  return held;
}
