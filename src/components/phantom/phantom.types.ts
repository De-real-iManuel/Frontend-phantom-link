export const PHANTOM_EXPRESSIONS = [
  "default",
  "curious",
  "working",
  "excited",
  "sleeping",
  "warning",
  "resurrection",
  "celebrating",
] as const;

export type PhantomExpression = (typeof PHANTOM_EXPRESSIONS)[number];

export interface PhantomProps {
  /** Pose to show. Status poses (warning, working) always win over transient reactions. */
  expression?: PhantomExpression;
  /** Pixel number or any CSS length. Default 240. */
  size?: number | string;
  /** Enables tap, click and keyboard reactions. Default true. */
  interactive?: boolean;
  /** Enables idle float, breathing and core pulse. Default true. */
  animated?: boolean;
  /** Enables pointer tilt and parallax (fine pointers and touch drags). Default true. */
  followPointer?: boolean;
  className?: string;
  /** Receives event names such as "tap". */
  onInteraction?: (event: string) => void;
  /** Overrides the generated alt/aria label. */
  label?: string;
  /** Load the image eagerly (above the fold). Default false (lazy). */
  priority?: boolean;
  /** Opt-in: switch to the sleeping pose after this many ms without interaction. */
  idleSleepMs?: number;
}
