# PhantomLink Kiroween frontend report

Frontend only. `server/`, `migrations/`, `src/lib/auth`, `src/lib/app-data` and `src/lib/db.ts` were not touched.

## What changed
- **Brand**: ghost kept. The mark gains a pulse line across the body as the signal path cue; favicon redrawn to match and checked at small sizes. `Mark` animates only in the landing hero.
- **Landing** (`/`): headline "Bring legacy industrial equipment back to life." with the brief's supporting paragraph verbatim, "Silent machines. Speaking models." kept as the creative line, "The Haunted Industrial Network" tag, problem section, keyboard-operable 7-stage journey (arrow keys, Home, End), provenance, MCP and operator sections, simulation banner. Unsupported BACnet, OPC, S7, 4-20 mA, deployment, customer and timing claims removed.
- **Mascots** (`src/components/mascots.tsx`): Phantom, Byte, Cipher, Echo as original inline SVG. Used in the footer, evidence cards and demo steps. Easter eggs: footer "Press for a boo" and the flashlight reveal.
- **Demo** (`/demo`): choose a simulated device, optionally damage a byte, Resurrect device, then 7 steps (connection, raw Modbus bytes, CRC check, decode, provenance, telemetry, simulated MCP call). Each step has a Simulated badge, a plain-language line and collapsible Technical details. Manual "Next step" plus optional "Play through". The damaged-byte path turns orange and stops at CRC rejection. CRC uses the real `crc16.ts`; the provenance hash is a real SHA-256 over the simulated payload; the MCP exchange is labelled "Simulated. MCP service not connected."
- **Navigation**: shared `SiteHeader` on `/`, `/devices`, `/demo`; the dashboard links to Demo and Devices. Root meta description updated.
- **Banners**: `SimulationBanner` now on /, /devices, /dashboard, /demo.

## Files
New: `src/lib/demo/resurrect.ts` (+ test), `src/components/demo/*`, `src/components/home/*`, `src/components/mascots.tsx`, `src/components/site-header.tsx`, `src/routes/demo.tsx`, `.agents/qa/final.mjs`.
Modified: `home-page.tsx`, `mark.tsx`, `public/favicon.svg`, `devices-page.tsx`, `dashboard-page.tsx`, `__root.tsx`, `catalogue.ts` and `three/equipment-parts.ts` (4-20 mA wording), `routeTree.gen.ts`, `package.json` (test script), `docs/frontend-audit.md`.

## Assets and licences
No third-party assets were added. Mascots, mark, favicon and 3D scenes are original code-drawn SVG/procedural geometry. Fonts are the existing Outfit and IBM Plex Mono. No GLB models (see `public/models/ATTRIBUTION.md`).

## Verification
- `npm run typecheck`: pass. `npm run lint`: 1 error, the pre-existing `src/lib/app-data/client.server.ts:281`; no new warnings.
- `npm test`: 197 tests, 189 pass, 8 fail (the pre-existing og/injector failures). New resurrect tests pass.
- `npm run build`: pass.
- Playwright (`node .agents/qa/final.mjs`): /, /devices, /dashboard, /demo at 1280 and 375, WebGL on and off, no console errors, no horizontal overflow, banner present, SVG fallback shown with WebGL off, demo valid and damaged paths complete, reduced motion disables animation.

## Limitations
- All device data, frames, provenance and agent output are synthetic. The demo register and 0.01 scale are invented, not a manufacturer map.
- Schneider PM5350 and PM5110 data is "Not verified" (manufacturer sites returned 403).
- No GLB models; 3D is illustrative and procedural.
- The contact form stores nothing.

## Backend contracts still required
Frame ingestion and device connection state; telemetry decoding with device register maps; signed, stored and verifiable provenance records; a real MCP server with `read_asset`, `explain_drift`, `subscribe_alarm`; agent activity logging. See `docs/backend-contracts.md`.
