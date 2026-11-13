/**
 * Frontend data contracts. These describe what the UI needs. No backend
 * implements them yet; see docs/backend-contracts.md.
 */

export type DeviceIdentity = {
  id: string;
  /** Display name. Never a real model name unless the backend supplied it. */
  name: string;
  manufacturer: string | null;
  model: string | null;
  firmware: string | null;
  serial: string | null;
  protocol: string | null;
  simulated: boolean;
};

export type ConnectionState = "connected" | "connecting" | "degraded" | "disconnected" | "unavailable";

export type FrameStatus = "ok" | "crc-error" | "exception" | "timeout" | "unparsed";

export type RawFrame = {
  id: string;
  timestamp: number;
  /** Frame bytes as two-digit hex strings. */
  hexBytes: string[];
  slaveAddress: number | null;
  functionCode: number | null;
  registerAddress: number | null;
  crcExpected: string | null;
  crcComputed: string | null;
  status: FrameStatus;
  simulated: boolean;
};

export type TelemetryReading = {
  name: string;
  value: number | string;
  unit: string;
  deviceId: string;
  timestamp: number;
  source: string;
  decoder: string | null;
  simulated: boolean;
};

export type ProvenanceVerification = "unverified-simulated" | "not-available" | "verified-by-backend";

export type ProvenanceRecord = {
  eventId: string;
  sequence: number;
  sourceFrameRef: string | null;
  timestamp: number;
  schemaVersion: string | null;
  hash: string | null;
  verification: ProvenanceVerification;
};

export type McpToolInfo = {
  name: string;
  description: string;
  /** True while the tool is a planned design, not a callable endpoint. */
  planned: boolean;
};

export type AgentActivity = {
  id: string;
  timestamp: number;
  tool: string;
  summary: string;
  simulated: boolean;
};

export type DataSourceState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "empty" }
  | { status: "error"; message: string }
  | { status: "unavailable"; reason: string };
