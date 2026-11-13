import assert from "node:assert/strict";
import test from "node:test";
import { BackendDataSource, SimulationDataSource } from "./adapter.ts";

test("SimulationDataSource is flagged simulated and returns ready data", () => {
  const src = new SimulationDataSource();
  assert.equal(src.simulated, true);
  const devices = src.getDevices();
  assert.equal(devices.status, "ready");
  if (devices.status === "ready") {
    assert.ok(devices.data.every((d) => d.simulated && d.model === null));
  }
  const tools = src.getTools();
  assert.ok(tools.status === "ready" && tools.data.every((t) => t.planned));
});

test("BackendDataSource is unavailable and does not fetch", () => {
  const original = globalThis.fetch;
  let called = false;
  globalThis.fetch = (() => {
    called = true;
    throw new Error("fetch must not be called");
  }) as typeof fetch;
  try {
    const src = new BackendDataSource();
    assert.equal(src.getDevices().status, "unavailable");
    assert.equal(src.getTools().status, "unavailable");
    assert.equal(src.initialTelemetry().status, "unavailable");
    assert.equal(called, false);
  } finally {
    globalThis.fetch = original;
  }
});
