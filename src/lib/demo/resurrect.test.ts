import assert from "node:assert/strict";
import { test } from "node:test";
import { buildProvenance, buildScenario, mcpExchange } from "./resurrect.ts";

test("valid scenario passes CRC and decodes the demonstration value", async () => {
  const s = buildScenario("sim-a", false);
  assert.equal(s.parsed.crcValid, true);
  assert.equal(s.value, 6.4);
  const p = await buildProvenance(s);
  assert.match(p.hash, /^[0-9a-f]{64}$/);
  assert.equal(p.verification, "unverified-simulated");
  assert.equal(mcpExchange(s, p).response.simulated, true);
});

test("corrupted scenario fails CRC", () => {
  const s = buildScenario("sim-b", true);
  assert.equal(s.parsed.crcValid, false);
  assert.equal(s.parsed.status, "crc-error");
});

test("every simulated device builds a valid frame", () => {
  for (const id of ["sim-a", "sim-b", "sim-c", "sim-d"]) {
    assert.equal(buildScenario(id, false).parsed.crcValid, true);
  }
});
