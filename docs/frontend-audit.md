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
- [ ] Event list and device list need per-item `SimBadge` labels.

## Unsupported protocol and device claims
- [x] `mock-telemetry.ts`: BACnet, OPC classic and 4-20 mA gateway buses removed.
- [x] `partDetails`: invented "9600 8E1, slave 01" and "12-bit, span-scaled" removed.
- [x] Devices named "Gateway 01..04" had no model identity. Renamed "Simulated device A..D", identity fields are null.
- [ ] `home-page.tsx` line ~37-39, 61, 79-80, 149: BACnet, OPC Classic, S7 and 4-20 mA copy still present.
- [ ] `home-page.tsx`: "Outbound events only. No inbound ports open." style security claims need a source.

## Visual and component issues
- [x] Mark logo bobbed in dashboard sidebar and header. `animated` prop now defaults to false.
- [x] Mark doc comment said "bus trace". Fixed.
- [x] The ● glyph rendered as a box in headless Chromium. Replaced with a CSS dot.
- [ ] `dashboard-page.tsx` is a 380 line monolith; split into panels.

## Accessibility and responsive
- [ ] Chart `role="img"` has no text alternative with the latest value.
- [ ] Device list selection state needs `aria-pressed` or `aria-current` verification.
- [ ] Verify 375 px layout of the KPI row and device panel after changes.
- [ ] Confirm all new motion respects `prefers-reduced-motion`.
