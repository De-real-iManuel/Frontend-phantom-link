type CanvasLike = { getContext: (id: string) => unknown };

/** Pure WebGL check. Pass a canvas factory so it can be tested without a DOM. */
export function detectWebGL(createCanvas: () => CanvasLike): boolean {
  try {
    const canvas = createCanvas();
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
