import assert from "node:assert/strict";
import { test } from "node:test";
import { crc16Modbus, crcWireBytes, crcWireHex } from "./crc16.ts";
import { buildException, buildReadRequest, parseFrame } from "./frame.ts";
import { SimulationDataSource } from "../data/adapter.ts";

test("CRC-16/Modbus matches the published check value for ASCII 123456789", () => {
  const bytes = [...Buffer.from("123456789")];
  assert.equal(crc16Modbus(bytes), 0x4b37);
});

test("CRC of 01 03 00 00 00 0A is C5 CD on the wire", () => {
  const crc = crc16Modbus([0x01, 0x03, 0x00, 0x00, 0x00, 0x0a]);
  assert.deepEqual(crcWireBytes(crc), [0xc5, 0xcd]);
  assert.equal(crcWireHex(crc), "C5 CD");
});

test("parseFrame reads fields and accepts a correct CRC", () => {
  const f = parseFrame([0x01, 0x03, 0x00, 0x00, 0x00, 0x0a, 0xc5, 0xcd]);
  assert.equal(f.slaveAddress, 1);
  assert.equal(f.functionCode, 3);
  assert.equal(f.registerAddress, 0);
  assert.equal(f.crcCarried, "C5 CD");
  assert.equal(f.crcComputed, "C5 CD");
  assert.equal(f.crcValid, true);
  assert.equal(f.status, "ok");
  assert.deepEqual(
    f.segments.map((s) => s.field),
    ["address", "function", "register", "data", "crc"],
  );
});

test("parseFrame flags a corrupted CRC", () => {
  const f = parseFrame([0x01, 0x03, 0x00, 0x00, 0x00, 0x0a, 0xc4, 0xcd]);
  assert.equal(f.crcValid, false);
  assert.equal(f.status, "crc-error");
  assert.equal(f.crcComputed, "C5 CD");
});

test("parseFrame recognises an exception response and short frames", () => {
  const ex = parseFrame(buildException(2, 3, 2));
  assert.equal(ex.status, "exception");
  assert.equal(ex.functionCode, 0x83);
  assert.equal(parseFrame([1, 2]).status, "unparsed");
});

test("buildReadRequest produces a frame that parses as valid", () => {
  const f = parseFrame(buildReadRequest(7, 4, 0x0102, 2));
  assert.equal(f.registerAddress, 0x0102);
  assert.equal(f.crcValid, true);
});

test("simulation frames are labelled simulated and mix valid and rejected", () => {
  const source = new SimulationDataSource();
  const t = source.initialTelemetry();
  assert.equal(t.status, "ready");
  if (t.status !== "ready") return;
  const frames = source.getFrames(t.data);
  assert.equal(frames.status, "ready");
  if (frames.status !== "ready") return;
  assert.ok(frames.data.every((f) => f.simulated));
  assert.ok(frames.data.some((f) => f.status === "ok"));
  assert.ok(frames.data.some((f) => f.status === "crc-error"));
  const prov = source.getProvenance(t.data);
  assert.equal(prov.status, "ready");
  if (prov.status === "ready") assert.ok(prov.data.every((p) => p.verification === "unverified-simulated" && p.hash === null));
});

test("backend stub reports unavailable for all new reads", async () => {
  const { BackendDataSource } = await import("../data/adapter.ts");
  const b = new BackendDataSource();
  const t = source0();
  assert.equal(b.getFrames(t).status, "unavailable");
  assert.equal(b.getProvenance(t).status, "unavailable");
  assert.equal(b.getAgentActivity(t).status, "unavailable");
  assert.equal(b.getReadings(t).status, "unavailable");
  assert.equal(b.getDeviceSummaries().status, "unavailable");
});

function source0() {
  const r = new SimulationDataSource().initialTelemetry();
  if (r.status !== "ready") throw new Error("expected ready");
  return r.data;
}
