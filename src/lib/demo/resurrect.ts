import { devices, seriesSpecs, type Device } from "../mock-telemetry.ts";
import { buildReadRequest, parseFrame, type ParsedFrame } from "../modbus/frame.ts";
import { crc16Modbus, crcWireBytes, toHexByte } from "../modbus/crc16.ts";

/**
 * Scripted "Resurrect device" scenario. Everything here is synthetic.
 * The register is a demonstration register, not a manufacturer map.
 */

export const DEMO_REGISTER = 0;
export const DEMO_SCALE = 0.01;
export const DEMO_FIXED_TIME = Date.UTC(2026, 0, 1, 12, 0, 0);

export type DemoStepId = "connect" | "bytes" | "crc" | "decode" | "provenance" | "telemetry" | "mcp";

export const DEMO_STEPS: { id: DemoStepId; title: string; plain: string }[] = [
  { id: "connect", title: "Connection sequence", plain: "PhantomLink wakes up the serial link to the silent machine." },
  { id: "bytes", title: "Raw Modbus bytes", plain: "The device answers with a short string of bytes. This is all an old meter can say." },
  { id: "crc", title: "CRC validation", plain: "A checksum at the end proves the bytes were not damaged on the wire." },
  { id: "decode", title: "Decode one register", plain: "The raw number becomes a reading with a name and a unit." },
  { id: "provenance", title: "Provenance record", plain: "A fingerprint ties the reading to the exact bytes that produced it." },
  { id: "telemetry", title: "Telemetry", plain: "The reading appears next to the other telemetry an operator watches." },
  { id: "mcp", title: "AI agent via MCP", plain: "An AI agent asks for the value and receives it with its evidence." },
];

export type DemoScenario = {
  device: Device;
  pointName: string;
  unit: string;
  slave: number;
  request: number[];
  response: number[];
  /** Response as received, possibly with a deliberately flipped byte. */
  received: number[];
  corrupted: boolean;
  parsed: ParsedFrame;
  rawValue: number;
  value: number;
  connectLines: string[];
};

export function buildScenario(deviceId: string, corrupt: boolean): DemoScenario {
  const device = devices.find((d) => d.id === deviceId) ?? devices[0];
  const spec = seriesSpecs[device.id];
  const slave = devices.indexOf(device) + 1;
  const rawValue = Math.round(spec.base / DEMO_SCALE);
  const request = buildReadRequest(slave, 3, DEMO_REGISTER, 1);
  const body = [slave, 3, 2, (rawValue >> 8) & 0xff, rawValue & 0xff];
  const response = [...body, ...crcWireBytes(crc16Modbus(body))];
  const received = response.slice();
  if (corrupt) received[3] ^= 0x04;
  const parsed = parseFrame(received);
  const decodedRaw = (received[3] << 8) | received[4];
  return {
    device,
    pointName: spec.point,
    unit: spec.unit,
    slave,
    request,
    response,
    received,
    corrupted: corrupt,
    parsed,
    rawValue: decodedRaw,
    value: Math.round(decodedRaw * DEMO_SCALE * 100) / 100,
    connectLines: [
      `open serial link (simulated)`,
      `probe slave 0x${toHexByte(slave)} (simulated)`,
      `slave 0x${toHexByte(slave)} answered, link up (simulated)`,
    ],
  };
}

export type SimProvenance = {
  eventId: string;
  sequence: number;
  hash: string;
  algorithm: "SHA-256";
  timestamp: number;
  verification: "unverified-simulated";
};

export function provenancePayload(s: DemoScenario): string {
  return JSON.stringify({
    device: s.device.id,
    request: s.request.map(toHexByte).join(" "),
    response: s.received.map(toHexByte).join(" "),
    register: DEMO_REGISTER,
    value: s.value,
    unit: s.unit,
    simulated: true,
  });
}

/** Real SHA-256 over the simulated payload. The record itself is not anchored to any ledger. */
export async function buildProvenance(s: DemoScenario): Promise<SimProvenance> {
  const data = new TextEncoder().encode(provenancePayload(s));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  const hash = [...new Uint8Array(digest)].map(toHexByte).join("").toLowerCase();
  return {
    eventId: `sim-evt-${s.device.id}-0001`,
    sequence: 1,
    hash,
    algorithm: "SHA-256",
    timestamp: DEMO_FIXED_TIME,
    verification: "unverified-simulated",
  };
}

export function mcpExchange(s: DemoScenario, p: SimProvenance) {
  return {
    request: { tool: "read_asset", arguments: { asset: s.device.asset, point: s.pointName } },
    response: {
      simulated: true,
      asset: s.device.asset,
      point: s.pointName,
      value: s.value,
      unit: s.unit,
      provenance: { eventId: p.eventId, hash: p.hash, verification: p.verification },
    },
  };
}
