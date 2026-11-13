import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { PHANTOM_CONFIG, resolveExpression } from "./phantom.animations.ts";
import { MAX_TILT_DEG, createIdleTimer, phantomAssetPath, pointerToTilt } from "./phantom.interactions.ts";
import { PHANTOM_EXPRESSIONS } from "./phantom.types.ts";

describe("asset paths", () => {
  it("covers all 8 expressions in webp and png", () => {
    assert.equal(PHANTOM_EXPRESSIONS.length, 8);
    for (const e of PHANTOM_EXPRESSIONS) {
      assert.equal(phantomAssetPath(e, "webp"), `/phantom/phantom-${e}.webp`);
      assert.equal(phantomAssetPath(e, "png"), `/phantom/phantom-${e}.png`);
      assert.match(PHANTOM_CONFIG[e].alt, /Phantom/);
    }
  });
});

describe("pointerToTilt", () => {
  const rect = { left: 100, top: 100, width: 200, height: 200 };
  it("is centred at the middle", () => {
    const t = pointerToTilt(200, 200, rect);
    assert.equal(t.nx, 0);
    assert.ok(Math.abs(t.rotateX) < 1e-9);
    assert.ok(Math.abs(t.rotateY) < 1e-9);
  });
  it("clamps far outside the element", () => {
    const t = pointerToTilt(5000, -5000, rect);
    assert.equal(t.nx, 1);
    assert.equal(t.ny, -1);
    assert.equal(t.rotateY, MAX_TILT_DEG);
    assert.equal(t.rotateX, MAX_TILT_DEG);
  });
  it("tilts toward the cursor", () => {
    assert.ok(pointerToTilt(300, 200, rect).rotateY > 0);
    assert.ok(pointerToTilt(100, 200, rect).rotateY < 0);
  });
  it("handles zero-size rects", () => {
    assert.equal(pointerToTilt(1, 1, { left: 0, top: 0, width: 0, height: 0 }).rotateX, 0);
  });
});

describe("resolveExpression", () => {
  it("lets status props win over reactions and sleep", () => {
    assert.equal(resolveExpression("warning", "curious", true), "warning");
    assert.equal(resolveExpression("working", "curious"), "working");
  });
  it("applies reaction and idle sleep to non-status poses", () => {
    assert.equal(resolveExpression("default", "curious"), "curious");
    assert.equal(resolveExpression("default", null, true), "sleeping");
    assert.equal(resolveExpression("excited", null), "excited");
  });
});

describe("createIdleTimer", () => {
  it("fires after inactivity and resets on activity", () => {
    mock.timers.enable({ apis: ["setTimeout"] });
    try {
      let calls = 0;
      const t = createIdleTimer(1000, () => calls++);
      t.reset();
      mock.timers.tick(800);
      t.reset();
      mock.timers.tick(800);
      assert.equal(calls, 0);
      mock.timers.tick(300);
      assert.equal(calls, 1);
    } finally {
      mock.timers.reset();
    }
  });
  it("does not fire after stop", () => {
    mock.timers.enable({ apis: ["setTimeout"] });
    try {
      let calls = 0;
      const t = createIdleTimer(500, () => calls++);
      t.reset();
      t.stop();
      mock.timers.tick(1000);
      assert.equal(calls, 0);
    } finally {
      mock.timers.reset();
    }
  });
});
