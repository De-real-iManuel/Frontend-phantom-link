import { memo, useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import "./Phantom.css";
import {
  FADE_MS,
  PARTICLE_COUNT,
  PHANTOM_CONFIG,
  REACTION_MS,
  RING_COUNT,
  resolveExpression,
} from "./phantom.animations.ts";
import { phantomAssetPath, useIdleSleep, usePhantomPointer } from "./phantom.interactions.ts";
import type { PhantomExpression, PhantomProps } from "./phantom.types.ts";

function Layer({
  expression,
  eager,
  state,
}: {
  expression: PhantomExpression;
  eager: boolean;
  state: "current" | "leaving";
}) {
  const cfg = PHANTOM_CONFIG[expression];
  const style = {
    "--core-x": `${cfg.core.x}%`,
    "--core-y": `${cfg.core.y}%`,
    "--core-rgb": cfg.coreRgb,
    "--core-glow": cfg.glow,
    "--pulse": `${cfg.pulseSeconds}s`,
  } as CSSProperties;
  return (
    <span className="phantom__layer" data-state={state} data-pose={expression} style={style} aria-hidden="true">
      <span className="phantom__core" />
      <picture>
        <source srcSet={phantomAssetPath(expression, "webp")} type="image/webp" />
        <img
          className="phantom__img"
          src={phantomAssetPath(expression, "png")}
          alt=""
          width={640}
          height={640}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
        />
      </picture>
    </span>
  );
}

export const Phantom = memo(function Phantom({
  expression = "default",
  size = 240,
  interactive = true,
  animated = true,
  followPointer = true,
  className,
  onInteraction,
  label,
  priority = false,
  idleSleepMs,
}: PhantomProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [reaction, setReaction] = useState<PhantomExpression | null>(null);
  const [activity, setActivity] = useState(0);
  const asleep = useIdleSleep(idleSleepMs, activity);
  const target = resolveExpression(expression, reaction, asleep);

  // Crossfade: preload the next pose, then stack it over the current one.
  const [shown, setShown] = useState<PhantomExpression>(target);
  const [leaving, setLeaving] = useState<PhantomExpression | null>(null);
  useEffect(() => {
    if (target === shown) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const commit = () => {
      if (cancelled) return;
      setLeaving(shown);
      setShown(target);
      timer = setTimeout(() => !cancelled && setLeaving(null), FADE_MS + 60);
    };
    const img = new Image();
    img.onload = commit;
    img.onerror = commit;
    img.src = phantomAssetPath(target, "png");
    if (img.complete) commit();
    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
      if (timer) clearTimeout(timer);
    };
  }, [target, shown]);

  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (reactionTimer.current) clearTimeout(reactionTimer.current);
  }, []);

  const onInteractionRef = useRef(onInteraction);
  onInteractionRef.current = onInteraction;
  const onTap = useCallback(() => {
    setActivity((n) => n + 1);
    setReaction("curious");
    if (reactionTimer.current) clearTimeout(reactionTimer.current);
    reactionTimer.current = setTimeout(() => setReaction(null), REACTION_MS);
    onInteractionRef.current?.("tap");
  }, []);

  usePhantomPointer(rootRef, { followPointer, interactive, onTap });

  const cfg = PHANTOM_CONFIG[shown];
  const alt = label ?? cfg.alt;
  const dimension = typeof size === "number" ? `${size}px` : size;
  const style = { "--phantom-size": dimension } as CSSProperties;

  return (
    <span
      ref={rootRef}
      className={["phantom", className].filter(Boolean).join(" ")}
      style={style}
      data-expression={shown}
      data-animated={animated ? "true" : "false"}
      data-follow={followPointer ? "true" : "false"}
      data-interactive={interactive ? "true" : "false"}
      {...(interactive
        ? { role: "button", tabIndex: 0, "aria-label": alt }
        : { role: "img", "aria-label": alt })}
    >
      <span className="phantom__glow" aria-hidden="true" />
      <span className="phantom__stage" aria-hidden="true">
        <span className="phantom__body">
          {leaving ? <Layer key={`l-${leaving}`} expression={leaving} eager state="leaving" /> : null}
          <Layer key={`c-${shown}`} expression={shown} eager={priority} state="current" />
        </span>
      </span>
      <span className="phantom__front" aria-hidden="true">
        {cfg.rings
          ? Array.from({ length: RING_COUNT }, (_, i) => (
              <span key={`r${i}`} className="phantom__ring" style={{ "--i": i } as CSSProperties} />
            ))
          : null}
        {cfg.particles
          ? Array.from({ length: PARTICLE_COUNT }, (_, i) => (
              <span key={`p${i}`} className="phantom__particle" style={{ "--i": i } as CSSProperties} />
            ))
          : null}
      </span>
      <span className="phantom__shadow" aria-hidden="true" />
    </span>
  );
});

export default Phantom;
