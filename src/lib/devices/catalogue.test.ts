import assert from "node:assert/strict";
import test from "node:test";
import { catalogue, filterCatalogue, getDevice } from "./catalogue.ts";
import { detectWebGL } from "./webgl.ts";

test("ids are unique", () => {
  assert.equal(new Set(catalogue.map((d) => d.id)).size, catalogue.length);
});

test("every device has a product URL", () => {
  for (const d of catalogue) assert.match(d.productUrl, /^https:\/\//, d.id);
});

test("no device claims implemented-tested", () => {
  assert.equal(catalogue.filter((d) => d.integrationStatus === "implemented-tested").length, 0);
});

test("PM5350 and PM5110 are distinct entries", () => {
  const a = getDevice("se-pm5350");
  const b = getDevice("se-pm5110");
  assert.ok(a && b);
  assert.notEqual(a.id, b.id);
  assert.notEqual(a.model, b.model);
  assert.notEqual(a.productUrl, b.productUrl);
});

test("unread product pages do not state protocols", () => {
  for (const d of catalogue.filter((x) => !x.productPageRead)) {
    assert.equal(d.protocol, null, d.id);
    assert.equal(d.physicalInterface, null, d.id);
  }
});

test("catalogue has a gateway and a controller", () => {
  assert.ok(catalogue.some((d) => d.category === "RS-485/Modbus gateway"));
  assert.ok(catalogue.some((d) => d.category === "Controller (PLC)"));
});

test("filterCatalogue combines filters", () => {
  assert.equal(filterCatalogue(catalogue, { manufacturer: "Moxa" }).length, 2);
  assert.equal(filterCatalogue(catalogue, { status: "simulated-demo" }).length, 1);
  assert.equal(filterCatalogue(catalogue, { status: "planned" }).length, 0);
  assert.equal(filterCatalogue(catalogue, { status: "all", category: "all" }).length, catalogue.length);
});

test("detectWebGL", () => {
  assert.equal(detectWebGL(() => ({ getContext: (id) => (id === "webgl" ? {} : null) })), true);
  assert.equal(detectWebGL(() => ({ getContext: () => null })), false);
  assert.equal(
    detectWebGL(() => {
      throw new Error("no canvas");
    }),
    false,
  );
});
