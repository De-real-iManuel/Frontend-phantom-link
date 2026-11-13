"""Re-extract the eight Phantom poses from the approved character board with true alpha.

Dev-only tooling (not an app dependency). Requires: pillow numpy scipy.
Usage: python extract_poses.py <board.png> <out_dir>

Method (see docs/phantom/ASSET-CLEANUP.md):
  1. Crop each pose by x-range (ranges sit in the gaps between poses).
  2. Model the dark board background per row from the crop side columns.
  3. "Colour to alpha": alpha = brightest per-channel excess over the background,
     colour = excess / alpha. Glow and soft edges therefore never carry dark
     background pixels, so no dark rim appears on light backgrounds.
  4. A filled body hull (eyes, outlines and dark facial features) is kept opaque
     with the original colours, blended smoothly into the colour-to-alpha edge.
  5. Small stray components are dropped, rows below the feet are cut, then the
     pose is scaled with a single factor for all poses and bottom-aligned.
"""
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

NAMES = "default curious working excited sleeping warning resurrection celebrating".split()
# x-ranges sit in the gaps between poses so neighbours never leak in.
XR = [(0, 200), (200, 385), (385, 575), (575, 785), (785, 955), (955, 1140), (1140, 1335), (1335, 1536)]
Y0 = 560
Y1 = {n: 862 for n in NAMES}
Y1["default"] = 846  # app icon tile and floor glow start below this
Y1["resurrection"] = 892
Y0_OVERRIDE = {"default": 560}
X0_OVERRIDE = {"default": 20}  # skip the bottom-left tile column edge
OUT = 640
HULL_THR = {"resurrection": 170}
FLOOR_CUT = {}  # rows (in crop space) to blank, per pose
MARGIN = 20
SCALE = None  # computed once: common scale for all poses


def matte(crop: np.ndarray, name: str):
    h, w, _ = crop.shape
    f = crop.astype(np.float32)
    side = np.concatenate([f[:, :5], f[:, -5:]], axis=1)
    bg_row = ndi.uniform_filter1d(np.median(side, axis=1), 15, axis=0)
    bg = np.repeat(bg_row[:, None, :], w, axis=1)
    exc = np.clip(f - bg, 0, None)
    head = np.clip(255.0 - bg, 1, None)
    # colour to alpha with a small dead zone to suppress background noise
    ratio = (exc / head).max(-1)
    a_c2a = np.clip((ratio - 0.08) / (0.9 - 0.08), 0, 1)
    a_c2a = np.minimum(1.0, a_c2a * 1.0) ** 0.9
    col_c2a = np.clip(exc / np.maximum(a_c2a[..., None] * head, 1e-3), 0, 1) * head + 0  # additive colour
    col_c2a = np.clip(col_c2a, 0, 255)
    # lift colour so a half transparent light pixel does not look muddy
    # (colour already normalised so the brightest channel hits full excess)

    # hull from stricter threshold; largest component plus real effects
    dist = np.sqrt(((f - bg) ** 2).sum(-1))
    thr = HULL_THR.get(name, 115)
    core = ndi.binary_opening(dist > thr, iterations=1)
    lab, n = ndi.label(ndi.binary_dilation(core, iterations=2))
    sizes = ndi.sum(np.ones_like(lab), lab, range(1, n + 1))
    biggest = 1 + int(np.argmax(sizes))
    body = lab == biggest
    hull = ndi.binary_fill_holes(ndi.binary_closing(body, iterations=5))
    hull = ndi.binary_opening(hull, iterations=2)
    inner = ndi.binary_erosion(hull, iterations=3)
    hull_soft = ndi.gaussian_filter(inner.astype(np.float32), 1.3)
    hull_soft = np.clip(hull_soft * 1.15, 0, 1)

    # keep only meaningful components of the c2a layer (effects) near content
    lab2, n2 = ndi.label(ndi.binary_dilation(a_c2a > 0.12, iterations=2))
    sz2 = ndi.sum(np.ones_like(lab2), lab2, range(1, n2 + 1))
    keep = np.zeros(n2 + 1, bool)
    for i, s in enumerate(sz2, 1):
        if s > 40:
            keep[i] = True
    a_c2a = a_c2a * keep[lab2]

    alpha = np.maximum(a_c2a, hull_soft)
    col = col_c2a * (1 - hull_soft[..., None]) + f * hull_soft[..., None]
    # inside the hull keep original colour, outside use c2a
    if name in FLOOR_CUT:
        alpha[FLOOR_CUT[name]:] = 0
    alpha[:3] = 0
    if name != "resurrection":
        # drop the faint floor reflection haze below the feet (low alpha only)
        low = np.zeros_like(alpha, bool)
        low[-32:] = True
        alpha = np.where(low & (alpha < 0.4) & ~(hull_soft > 0.05), 0, alpha)
    return np.clip(col, 0, 255).astype(np.uint8), (np.clip(alpha, 0, 1) * 255).astype(np.uint8)


def resize_premul(rgba: Image.Image, s: float) -> Image.Image:
    arr = np.array(rgba).astype(np.float32)
    arr[..., :3] *= arr[..., 3:] / 255
    sz = (max(1, round(rgba.width * s)), max(1, round(rgba.height * s)))
    ch = [np.array(Image.fromarray(arr[..., i]).resize(sz, Image.LANCZOS)) for i in range(4)]
    r = np.dstack(ch)
    al = np.clip(r[..., 3:], 0, 255)
    rgb = np.where(al > 0.5, r[..., :3] / np.maximum(al, 1) * 255, 0)
    return Image.fromarray(np.clip(np.dstack([rgb, al]), 0, 255).astype(np.uint8), "RGBA")


def main(board, out):
    im = np.array(Image.open(board).convert("RGB"))
    os.makedirs(out, exist_ok=True)
    pieces = {}
    for n, (x0, x1) in zip(NAMES, XR):
        x0 = X0_OVERRIDE.get(n, x0)
        col, a = matte(im[Y0:Y1[n], x0:x1], n)
        rgba = Image.fromarray(np.dstack([col, a]), "RGBA")
        bbox = rgba.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
        pieces[n] = rgba.crop(bbox)
    # one scale for every pose: the tallest pose fits the canvas
    s = min((OUT - 2 * MARGIN) / max(p.height for p in pieces.values()),
            (OUT - 2 * MARGIN) / max(p.width for p in pieces.values()))
    metrics = {}
    for n, p in pieces.items():
        q = resize_premul(p, s)
        canvas = Image.new("RGBA", (OUT, OUT), (0, 0, 0, 0))
        ox, oy = (OUT - q.width) // 2, OUT - q.height - MARGIN
        canvas.paste(q, (ox, oy), q)
        canvas.save(f"{out}/phantom-{n}.png", optimize=True)
        canvas.save(f"{out}/phantom-{n}.webp", quality=95, method=6)
        print(n, q.size, "scale", round(s, 3))
    json.dump({"scale": s}, open(f"{out}/_scale.json", "w"))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
