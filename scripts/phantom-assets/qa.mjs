// Playwright QA for the Phantom mascot. Not bundled with the app.
// Usage: node scripts/phantom-assets/qa.mjs   (starts its own dev server on QA_PORT, default 8097)
// Screenshots go to docs/phantom/qa/.
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const PORT = Number(process.env.QA_PORT ?? 8097);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = "docs/phantom/qa";
mkdirSync(OUT, { recursive: true });

const srv = spawn("npm", ["run", "dev", "--", "--port", String(PORT)], { stdio: "pipe" });
for (let i = 0; i < 90; i++) {
  try {
    const r = await fetch(`${BASE}/`);
    if (r.status < 500) break;
  } catch {
    /* not up yet */
  }
  await new Promise((r) => setTimeout(r, 1000));
}

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` | ${detail}` : ""}`);
};
const errorsFor = (page, errs) => {
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  page.on("pageerror", (e) => errs.push(String(e)));
};
const exprOf = (page, scope) => page.locator(`${scope} .phantom`).first().getAttribute("data-expression");
const waitExpr = (page, scope, expr) =>
  page.waitForFunction(
    ([s, e]) => document.querySelector(`${s} .phantom`)?.getAttribute("data-expression") === e &&
      !document.querySelector(`${s} .phantom__layer[data-state="leaving"]`),
    [scope, expr],
    { timeout: 5000 },
  );
const seen = new Set();
async function shot(page, scope, expr) {
  seen.add(expr);
  await page.locator(`${scope} .phantom`).first().screenshot({ path: `${OUT}/expression-${expr}.png` });
}

try {
  const browser = await chromium.launch();

  // Routes at both widths: render, no console errors, no horizontal overflow, Phantom present
  for (const [w, h] of [[1280, 900], [375, 800]]) {
    for (const route of ["/", "/demo", "/dashboard"]) {
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      const errs = [];
      errorsFor(page, errs);
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1200);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      const count = await page.locator(".phantom").count();
      const banner = await page.getByText("SIMULATION MODE").count();
      const tag = `${route === "/" ? "home" : route.slice(1)}-${w}`;
      await page.screenshot({ path: `${OUT}/${tag}.png`, fullPage: route === "/" });
      check(`${route} @${w} renders Phantom`, count >= 1, `count ${count}`);
      check(`${route} @${w} no overflow`, !overflow);
      check(`${route} @${w} no console errors`, errs.length === 0, JSON.stringify(errs));
      check(`${route} @${w} simulation banner kept`, banner >= 1);
      await page.close();
    }
  }

  // Demo flow drives expressions from real step state
  for (const corrupt of [false, true]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${BASE}/demo`, { waitUntil: "networkidle" });
    const scope = 'section[aria-labelledby="run-title"]';
    check("demo idle is default", (await exprOf(page, scope)) === "default");
    if (!seen.has("default")) await shot(page, scope, "default");
    if (corrupt) await page.getByLabel(/Damage one byte/).check();
    await page.getByRole("button", { name: "Resurrect device" }).click();
    await waitExpr(page, scope, "working");
    check("demo connect step is working", true);
    if (!seen.has("working")) await shot(page, scope, "working");
    const next = page.getByRole("button", { name: "Next step" });
    await next.click(); // bytes
    await next.click(); // crc
    if (corrupt) {
      await waitExpr(page, scope, "warning");
      check("damaged byte shows warning", true);
      await shot(page, scope, "warning");
      const alertText = await page.getByRole("alert").first().innerText();
      check("error text unchanged", /failed its checksum/.test(alertText), alertText.slice(0, 40));
    } else {
      await waitExpr(page, scope, "excited");
      check("CRC pass shows excited", true);
      await shot(page, scope, "excited");
      for (let i = 0; i < 4; i++) await next.click();
      await waitExpr(page, scope, "resurrection");
      check("flow complete shows resurrection", true);
      await shot(page, scope, "resurrection");
      await waitExpr(page, scope, "celebrating");
      check("then celebrating", true);
      await shot(page, scope, "celebrating");
    }
    await page.close();
  }

  // Dashboard: paused shows sleeping; tap shows curious
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    const scope = "main";
    await waitExpr(page, scope, "default");
    check("dashboard live is default", true);
    await page.getByRole("button", { name: /Live \(simulated\)/ }).click();
    await waitExpr(page, scope, "sleeping");
    check("dashboard paused shows sleeping", true);
    await shot(page, scope, "sleeping");
    await page.getByRole("button", { name: "Paused" }).click();
    await page.getByRole("button", { name: "Try backend source" }).click();
    await waitExpr(page, scope, "warning");
    check("dashboard backend unavailable shows warning", true);
    check(
      "unavailable text still shown",
      (await page.getByText(/No backend is connected/).count()) >= 1,
    );
    await page.close();
  }

  // Pointer tilt on desktop (home hero)
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const ph = page.locator("#device-slot .phantom");
    await ph.scrollIntoViewIfNeeded();
    const box = await ph.boundingBox();
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.2, { steps: 5 });
    await page.waitForTimeout(250);
    const ry = await ph.evaluate((el) => el.style.getPropertyValue("--ry"));
    const tf = await ph.locator(".phantom__stage").evaluate((el) => getComputedStyle(el).transform);
    check("pointer move sets tilt var", ry !== "" && ry !== "0deg", `--ry=${ry}`);
    check("pointer move changes transform", tf !== "none", tf);
    await page.mouse.move(5, 5, { steps: 3 });
    await page.waitForTimeout(250);
    const ry2 = await ph.evaluate((el) => el.style.getPropertyValue("--ry"));
    check("tilt resets on leave", ry2 === "0deg", `--ry=${ry2}`);
    // Dark and light backgrounds
    for (const [name, bg] of [["dark", "#05070a"], ["light", "#f4f4f0"]]) {
      await page.addStyleTag({ content: `.phantom{background:${bg} !important}` });
      await ph.screenshot({ path: `${OUT}/background-${name}.png` });
    }
    // Favicon links
    const links = await page.evaluate(() =>
      [...document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')].map((l) => l.href),
    );
    check("favicon links present", links.length >= 1, links.join(", "));
    for (const href of links) {
      const r = await fetch(href);
      check(`favicon 200 ${new URL(href).pathname}`, r.status === 200 && /image/.test(r.headers.get("content-type") ?? ""), String(r.status));
    }
    await page.close();
  }

  // Touch: tap reacts, page still scrolls with a swipe that starts on Phantom
  {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 700 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    const errs = [];
    errorsFor(page, errs);
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const ph = page.locator("#device-slot .phantom");
    await ph.scrollIntoViewIfNeeded();
    await waitExpr(page, "#device-slot", "default");
    const box = await ph.boundingBox();
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await waitExpr(page, "#device-slot", "curious");
    check("touch tap shows curious", true);
    await shot(page, "#device-slot", "curious");
    const cdp = await ctx.newCDPSession(page);
    const y0 = await page.evaluate(() => scrollY);
    const sx = box.x + box.width / 2;
    const sy = Math.min(box.y + box.height / 2, 600);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: sx, y: sy }] });
    for (let i = 1; i <= 8; i++) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: sx, y: sy - i * 25 }] });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(500);
    const y1 = await page.evaluate(() => scrollY);
    check("page scrolls from a swipe on Phantom", y1 !== y0, `${y0} -> ${y1}`);
    check("touch session no console errors", errs.length === 0, JSON.stringify(errs));
    await ctx.close();
  }

  // Reduced motion: no running infinite animations on Phantom
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const running = await page.evaluate(() =>
      document
        .querySelector("#device-slot .phantom")
        .getAnimations({ subtree: true })
        .filter((a) => a.playState === "running" && a.effect?.getComputedTiming().iterations === Infinity)
        .map((a) => a.animationName ?? "anim"),
    );
    check("reduced motion: no infinite animations on Phantom", running.length === 0, JSON.stringify(running));
    await ctx.close();
  }

  await browser.close();
  const missing = ["default", "curious", "working", "excited", "sleeping", "warning", "resurrection", "celebrating"].filter((e) => !seen.has(e));
  check("all eight expressions captured", missing.length === 0, `missing: ${missing.join(",") || "none"}`);
} finally {
  srv.kill("SIGTERM");
}
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
