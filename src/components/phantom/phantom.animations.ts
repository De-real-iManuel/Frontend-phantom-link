import type { PhantomExpression } from "./phantom.types.ts";

export interface PhantomExpressionConfig {
  /** Base file name, without extension. */
  asset: string;
  /** Signal Core centre as % of the 640px canvas (measured in public/phantom/poses.json). */
  core: { x: number; y: number };
  /** Core glow colour as "r, g, b". */
  coreRgb: string;
  /** Core pulse period in seconds. */
  pulseSeconds: number;
  /** Peak core glow opacity (kept restrained). */
  glow: number;
  rings: boolean;
  particles: boolean;
  alt: string;
}

const GREEN = "24, 224, 173";
const BRIGHT_GREEN = "60, 245, 150";
const WARN = "255, 106, 68";

export const PHANTOM_CONFIG: Record<PhantomExpression, PhantomExpressionConfig> = {
  default: { asset: "phantom-default", core: { x: 48.9, y: 65.22 }, coreRgb: GREEN, pulseSeconds: 4.7, glow: 0.4, rings: false, particles: false, alt: "Phantom, the PhantomLink mascot, resting" },
  curious: { asset: "phantom-curious", core: { x: 58.68, y: 62.27 }, coreRgb: GREEN, pulseSeconds: 3.9, glow: 0.45, rings: false, particles: false, alt: "Phantom, the PhantomLink mascot, curious" },
  working: { asset: "phantom-working", core: { x: 47.88, y: 65.9 }, coreRgb: GREEN, pulseSeconds: 1.9, glow: 0.6, rings: false, particles: false, alt: "Phantom, the PhantomLink mascot, working" },
  excited: { asset: "phantom-excited", core: { x: 51.0, y: 56.57 }, coreRgb: BRIGHT_GREEN, pulseSeconds: 2.3, glow: 0.6, rings: false, particles: false, alt: "Phantom, the PhantomLink mascot, excited" },
  sleeping: { asset: "phantom-sleeping", core: { x: 56.03, y: 66.05 }, coreRgb: GREEN, pulseSeconds: 7.3, glow: 0.2, rings: false, particles: false, alt: "Phantom, the PhantomLink mascot, sleeping" },
  warning: { asset: "phantom-warning", core: { x: 52.46, y: 68.05 }, coreRgb: WARN, pulseSeconds: 2.7, glow: 0.45, rings: false, particles: false, alt: "Phantom, the PhantomLink mascot, warning" },
  resurrection: { asset: "phantom-resurrection", core: { x: 60.21, y: 46.42 }, coreRgb: BRIGHT_GREEN, pulseSeconds: 2.9, glow: 0.55, rings: true, particles: false, alt: "Phantom, the PhantomLink mascot, awakening" },
  celebrating: { asset: "phantom-celebrating", core: { x: 56.63, y: 59.59 }, coreRgb: BRIGHT_GREEN, pulseSeconds: 2.1, glow: 0.6, rings: false, particles: true, alt: "Phantom, the PhantomLink mascot, celebrating" },
};

/** Poses that report real status and must not be overridden by reactions or idle sleep. */
const STATUS_EXPRESSIONS: ReadonlySet<PhantomExpression> = new Set(["warning", "working"]);

export function isStatusExpression(e: PhantomExpression): boolean {
  return STATUS_EXPRESSIONS.has(e);
}

/** The pose actually shown: status props win, then idle sleep, then a transient reaction, then the prop. */
export function resolveExpression(
  prop: PhantomExpression,
  reaction: PhantomExpression | null,
  asleep = false,
): PhantomExpression {
  if (isStatusExpression(prop)) return prop;
  if (asleep) return "sleeping";
  return reaction ?? prop;
}

export const PARTICLE_COUNT = 6;
export const RING_COUNT = 3;
/** How long a tap reaction lasts, in ms. */
export const REACTION_MS = 1400;
/** Crossfade duration, in ms (must match --phantom-fade in Phantom.css). */
export const FADE_MS = 420;
