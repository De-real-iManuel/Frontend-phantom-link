# Phantom mascot

Interactive 2.5D mascot for PhantomLink. Source: `src/components/phantom/`. Assets: `public/phantom/` (see [ASSET-CLEANUP.md](./ASSET-CLEANUP.md) for how the transparent poses and icons were produced and what the limits are).

## Usage

```tsx
import { Phantom } from "@/components/phantom";

<Phantom expression="working" size={96} />
```

| Prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `expression` | one of the 8 expressions | `default` | Pose to show. |
| `size` | number (px) or CSS length | `240` | Rendered square size. |
| `interactive` | boolean | `true` | Click, tap and Enter/Space reactions (shows `curious` briefly). Renders as a button. |
| `animated` | boolean | `true` | Idle float, breathing, core pulse. |
| `followPointer` | boolean | `true` | Pointer tilt and parallax, limited to 5 degrees. |
| `className` | string | none | Extra classes on the root. |
| `onInteraction` | `(event: string) => void` | none | Receives `"tap"`. Hook for future events. |
| `label` | string | generated | Overrides the accessible name. |
| `priority` | boolean | `false` | Eager image load for above-the-fold use. |
| `idleSleepMs` | number | off | Opt-in: switch to `sleeping` after this many ms without interaction. |

`warning` and `working` always win over transient tap and idle reactions, so a status pose is never masked.

## Expressions

| Expression | Behaviour | Used for |
| --- | --- | --- |
| `default` | Calm float, slow core pulse | Resting state |
| `curious` | Leaning pose, quicker pulse | Reaction to a tap or click |
| `working` | Fast pulse, orbiting rings | Work in progress |
| `excited` | Bright core, particles | A check that really passed |
| `sleeping` | Dim, slow breathing | Idle or paused |
| `warning` | Amber core, rings | A failure or unavailable service |
| `resurrection` | Rising glow, rings and particles | A device flow that really completed |
| `celebrating` | Particles | Brief follow-up to resurrection |

Poses crossfade after the next image has preloaded.

## Event to expression mapping

Only events that exist in the app are wired. The mascot echoes status; it never replaces text, errors or indicators.

Actual (all simulated):

| Where | State | Expression |
| --- | --- | --- |
| Home hero | Loaded | `default` (opt-in `sleeping` after 45 s idle); tap gives `curious` |
| Demo | Not started | `default` |
| Demo | Connection, bytes, decode, provenance, telemetry, MCP steps | `working` |
| Demo | CRC step, frame valid | `excited` |
| Demo | CRC step, damaged byte rejected | `warning` (error text stays) |
| Demo | Provenance hash failed in the browser | `warning` |
| Demo | Last step reached, not rejected | `resurrection`, then `celebrating` after 2.6 s |
| Dashboard | Data loading | `working` |
| Dashboard | Backend source selected (service unavailable) | `warning` next to the existing text |
| Dashboard | Paused or telemetry empty | `sleeping` |
| Dashboard | Otherwise | `default`, `sleeping` after 90 s idle |

The demo mapping is `demoExpression()` in `src/components/demo/resurrect-demo.tsx`; the dashboard mapping is in `src/components/dashboard-page.tsx`.

Future (no such events exist yet, nothing is faked): real device discovery start (`working`), real verification result (`excited` or `celebrating`), real device awakened (`resurrection`), real connection failure (`warning`). To integrate, pass the new state as the `expression` prop and use `onInteraction` for user events.

## Accessibility and reduced motion

- Interactive instances are `role="button"`, focusable, with an accessible name that follows the pose, and respond to Enter and Space. Non-interactive instances are `role="img"`.
- With `prefers-reduced-motion: reduce`, pointer tracking is off and all infinite animations (float, core pulse, rings, particles) stop; poses still switch.
- Decorative layers are `aria-hidden`.

## Performance

- Pointer handling is scoped to the element, throttled with `requestAnimationFrame`, and writes CSS variables, so React does not re-render per move.
- WebP with PNG fallback, 640 px square. Only the hero image is eager.
- Only one Phantom per page is used in the demo and dashboard.

## Limitations

The poses are flattened images, not layered art. There is no eye tracking, and no independent animation of the lower extension or face. Tilt, parallax, glow, pulse, particles and crossfades are applied to the whole pose. See ASSET-CLEANUP.md for the cleanup limits.

## QA

`node scripts/phantom-assets/qa.mjs` starts a dev server (port `QA_PORT`, default 8097), runs 52 checks (all eight expressions, desktop tilt and reset, touch tap and scroll, reduced motion, favicon, console errors, 375 px overflow), and writes screenshots to `docs/phantom/qa/`.
