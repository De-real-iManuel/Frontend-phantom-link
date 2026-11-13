import assert from "node:assert/strict";
import { test } from "node:test";
import { crc16Modbus, crcWireBytes } from "../../lib/modbus/crc16.ts";
import { hauntText } from "./haunt-text.ts";

test("every hex frame in the hero haunt text carries a correct CRC", () => {
  const frames = hauntText.match(/(?:[0-9A-F]{2} ){5,}[0-9A-F]{2}(?= {2})/g) ?? [];
  assert.ok(frames.length >= 8);
  for (const f of frames) {
    const b = f.split(" ").map((h) => parseInt(h, 16));
    const [lo, hi] = crcWireBytes(crc16Modbus(b.slice(0, -2)));
    assert.deepEqual(b.slice(-2), [lo, hi], f);
  }
});
