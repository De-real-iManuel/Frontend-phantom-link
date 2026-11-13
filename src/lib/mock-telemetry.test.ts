import assert from "node:assert/strict";
import test from "node:test";
import {
  BASELINE,
  devices,
  eventsPerMin,
  initialTelemetry,
  mulberry32,
  openDrifts,
  partDetails,
  tickTelemetry,
} from "./mock-telemetry.ts";

test("initialTelemetry is deterministic", () => {
  assert.deepEqual(initialTelemetry(), initialTelemetry());
});

test("initialTelemetry has a 12 event window and 40 point series", () => {
  const t = initialTelemetry();
  assert.equal(t.events.length, 12);
  assert.equal(t.series.length, 40);
});

test("tickTelemetry keeps window lengths and advances seq and clock", () => {
  const rand = mulberry32(7);
  let t = initialTelemetry();
  for (let n = 0; n < 100; n++) {
    const next = tickTelemetry(t, rand);
    assert.equal(next.events.length, 12);
    assert.equal(next.series.length, 40);
    assert.equal(next.seq, t.seq + 1);
    assert.equal(next.events[0].ts, t.events[0].ts + 1800);
    t = next;
  }
});

test("tickTelemetry clamps the series around the baseline", () => {
  for (const r of [0, 0.999999]) {
    let t = initialTelemetry();
    for (let n = 0; n < 200; n++) t = tickTelemetry(t, () => r);
    for (const p of t.series.slice(-10)) {
      assert.ok(p.v >= BASELINE - 1.2 && p.v <= BASELINE + 1.2);
    }
  }
});

test("KPIs derive from the event window", () => {
  const t = initialTelemetry();
  assert.equal(openDrifts(t.events), t.events.filter((e) => e.state !== "steady").length);
  assert.equal(eventsPerMin(t.events), 15);
  assert.equal(eventsPerMin([]), 0);
});

test("partDetails follows the selected device", () => {
  assert.match(partDetails(devices[0], "RS-485").detail, /62 points/);
  assert.match(partDetails(devices[2], "RS-485").detail, /BACnet/);
  assert.match(partDetails(devices[3], "Ethernet").detail, /offline/);
});
