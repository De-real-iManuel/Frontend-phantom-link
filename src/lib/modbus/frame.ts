import type { FrameStatus } from "../data/contracts.ts";
import { crc16Modbus, crcWireBytes, crcWireHex } from "./crc16.ts";

export type FrameField = "address" | "function" | "register" | "data" | "crc";

export type FrameSegment = { field: FrameField; start: number; end: number };

export type ParsedFrame = {
  bytes: number[];
  segments: FrameSegment[];
  slaveAddress: number | null;
  functionCode: number | null;
  registerAddress: number | null;
  /** CRC bytes carried inside the frame, wire order, or null if too short. */
  crcCarried: string | null;
  /** CRC computed locally over the frame body, wire order. */
  crcComputed: string | null;
  crcValid: boolean;
  status: FrameStatus;
};

const REGISTER_READ_FUNCTIONS = new Set([1, 2, 3, 4]);

/** Build a Modbus RTU read request with a correct CRC. */
export function buildReadRequest(slave: number, fn: number, register: number, quantity: number): number[] {
  const body = [slave, fn, (register >> 8) & 0xff, register & 0xff, (quantity >> 8) & 0xff, quantity & 0xff];
  return [...body, ...crcWireBytes(crc16Modbus(body))];
}

/** Build an exception response with a correct CRC. */
export function buildException(slave: number, fn: number, code: number): number[] {
  const body = [slave, fn | 0x80, code];
  return [...body, ...crcWireBytes(crc16Modbus(body))];
}

/** Parse a frame by position. Does not assume which manufacturer produced it. */
export function parseFrame(bytes: number[]): ParsedFrame {
  const len = bytes.length;
  if (len < 4) {
    return {
      bytes,
      segments: bytes.map((_, i) => ({ field: "data" as const, start: i, end: i + 1 })),
      slaveAddress: null,
      functionCode: null,
      registerAddress: null,
      crcCarried: null,
      crcComputed: null,
      crcValid: false,
      status: "unparsed",
    };
  }
  const body = bytes.slice(0, len - 2);
  const computed = crc16Modbus(body);
  const carried = bytes[len - 2] | (bytes[len - 1] << 8);
  const crcValid = computed === carried;
  const fn = bytes[1];
  const isException = (fn & 0x80) !== 0;
  const isRead = !isException && REGISTER_READ_FUNCTIONS.has(fn) && len === 8;
  const segments: FrameSegment[] = [
    { field: "address", start: 0, end: 1 },
    { field: "function", start: 1, end: 2 },
  ];
  let register: number | null = null;
  if (isRead) {
    register = (bytes[2] << 8) | bytes[3];
    segments.push({ field: "register", start: 2, end: 4 }, { field: "data", start: 4, end: 6 });
  } else if (len > 4) {
    segments.push({ field: "data", start: 2, end: len - 2 });
  }
  segments.push({ field: "crc", start: len - 2, end: len });
  return {
    bytes,
    segments,
    slaveAddress: bytes[0],
    functionCode: fn,
    registerAddress: register,
    crcCarried: crcWireHex(carried),
    crcComputed: crcWireHex(computed),
    crcValid,
    status: !crcValid ? "crc-error" : isException ? "exception" : "ok",
  };
}
