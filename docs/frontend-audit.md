# Frontend audit

Baseline before this task: typecheck passes, lint has 1 pre-existing error
(`src/lib/app-data/client.server.ts:281`), `npm test` has 8 pre-existing
failures of 197.

Legend: [x] fixed in the data foundation change, [ ] open for later work.

## Mock data shown as live
- [x] Dashboard had no simulation label. Added `SimulationBanner`.
- [x] Agent call counts (1,284 / 316 / 92) were invented. Removed; tools are labeled planned.
- [x] "Agent calls" KPI summed the invented counts. Replaced with a planned tool count.
- [x] Chart title said "boiler-3 discharge pressure" for every device. Series are now per device.
- [x] Demo steps carry per-step `SimBadge`; the dashboard keeps section-level badges and the page banner.

## Unsupported protocol and device claims
- [x] `mock-telemetry.ts`: BACnet, OPC classic and 4-20 mA gateway buses removed.
- [x] `partDetails`: invented "9600 8E1, slave 01" and "12-bit, span-scaled" removed.
- [x] Devices named "Gateway 01..04" had no model identity. Renamed "Simulated device A..D", identity fields are null.
- [x] Landing rewritten in `src/components/home/*`; BACnet, OPC, S7, 4-20 mA, deployment, customer and timing claims removed.
- [x] Unsourced security and deployment claims removed from the landing page.

## Visual and component issues
- [x] Mark logo bobbed in dashboard sidebar and header. `animated` prop now defaults to false.
- [x] Mark doc comment said "bus trace". Fixed.
- [x] The ● glyph rendered as a box in headless Chromium. Replaced with a CSS dot.
- [x] Dashboard split into `src/components/dashboard/*` (FEAT-003).

## Accessibility and responsive
- [ ] Chart `role="img"` has no text alternative with the latest value.
- [ ] Device list selection state needs `aria-pressed` or `aria-current` verification.
- [x] 375 px layout verified for /, /devices, /dashboard, /demo (.agents/qa/final.mjs).
- [x] Reduced motion verified: `.ghost-float` animation is none under reduce; demo steps are manual.

## Verified in FEAT-004
- Mark `animated` is used only in the landing hero. The dashboard Overview Connection tile was screenshotted and reads "Simulated bus / No physical link".
- Arrow glyphs render as boxes in the mono font, so the journey line uses inline SVG arrows.
