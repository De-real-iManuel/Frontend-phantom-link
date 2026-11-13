import assert from "node:assert/strict";
import test from "node:test";
import {
  devices,
  eventsPerMin,
  initialTelemetry,
  mulberry32,
  openDrifts,
  partDetails,
  seriesSpecs,
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
      assert.ok(p.v >= 6.4 - 1.2 && p.v <= 6.4 + 1.2);
    }
  }
});

test("KPIs derive from the event window", () => {
  const t = initialTelemetry();
  assert.equal(openDrifts(t.events), t.events.filter((e) => e.state !== "steady").length);
  assert.equal(eventsPerMin(t.events), 15);
  assert.equal(eventsPerMin([]), 0);
});

test("each device has its own series that follows its spec", () => {
  let t = initialTelemetry();
  for (let n = 0; n < 50; n++) t = tickTelemetry(t, mulberry32(n + 1));
  const firsts = devices.map((d) => t.seriesByDevice[d.id][0].v);
  assert.equal(new Set(firsts).size, devices.length);
  for (const d of devices) {
    const spec = seriesSpecs[d.id];
    const series = t.seriesByDevice[d.id];
    assert.equal(series.length, 40);
    for (const p of series.slice(-10)) {
      assert.ok(p.v >= spec.base - spec.range && p.v <= spec.base + spec.range);
    }
  }
});

test("no unsupported protocol or fake counts remain", () => {
  const blob = JSON.stringify([devices, initialTelemetry().tools, partDetails(devices[0], "RS-485")]);
  assert.doesNotMatch(blob, /BACnet|OPC|4-20 mA|8E1|slave 01|calls/);
});

test("partDetails follows the selected device", () => {
  assert.match(partDetails(devices[0], "RS-485").detail, /62 synthetic points/);
  assert.match(partDetails(devices[3], "Ethernet").detail, /offline/);
});
