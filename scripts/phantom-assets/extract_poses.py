"""Re-extract the eight Phantom poses from the approved character board with true alpha.

Dev-only tooling (not an app dependency). Requires: pillow numpy scipy.
Usage: python extract_poses.py <board.png> <out_dir>
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

NAMES = "default curious working excited sleeping warning resurrection celebrating".split()
# x-ranges sit in the gaps between poses so neighbours never leak in.
XR = [(0, 200), (200, 385), (385, 575), (575, 785), (785, 955), (955, 1140), (1140, 1335), (1335, 1536)]
Y0, Y1 = 560, 862  # row of poses, excludes the floor reflection below feet
Y1_OVERRIDE = {'resurrection': 892}
OUT = 640
SCALE = 2.0


def matte(crop: np.ndarray, name: str):
    h, w, _ = crop.shape
    f = crop.astype(np.float32)
    # background estimate: per-row median of the outer 6px columns, smoothed
    side = np.concatenate([f[:, :6], f[:, -6:]], axis=1)
    bg_row = np.median(side, axis=1)
    bg_row = ndi.uniform_filter1d(bg_row, 15, axis=0)
    bg = np.repeat(bg_row[:, None, :], w, axis=1)
    dist = np.sqrt(((f - bg) ** 2).sum(-1))
    lo, hi = 45.0, 105.0
    soft = np.clip((dist - lo) / (hi - lo), 0, 1)
    # hard foreground: clearly different from background
    core = dist > 38
    core = ndi.binary_opening(core, iterations=1)
    lab, n = ndi.label(ndi.binary_dilation(core, iterations=3))
    keep = np.zeros(n + 1, bool)
    sizes = ndi.sum(np.ones_like(lab), lab, range(1, n + 1))
    biggest = 1 + int(np.argmax(sizes))
    for i, s in enumerate(sizes, 1):
        # keep body plus meaningful floating effects (?, Zz, !, confetti, rings)
        if i == biggest or s > 25:
            keep[i] = True
    region = keep[lab]
    region = ndi.binary_dilation(region, iterations=10)  # allow soft glow around kept pieces
    # fill holes (dark eyes) of the main body so they stay opaque
    body = lab == biggest
    body_filled = ndi.binary_fill_holes(ndi.binary_closing(body, iterations=4))
    alpha = soft * region
    alpha = np.where(body_filled & ~ndi.binary_dilation(~body_filled, iterations=1), 1.0, alpha)
    # edge pixels of the body: use soft alpha but never below 0.85 inside the eroded hull
    alpha = np.clip(alpha, 0, 1)
    # unpremultiply against bg so no dark halo remains in edge pixels
    a3 = np.maximum(alpha, 1e-3)[..., None]
    col = np.where(alpha[..., None] > 0.02, (f - bg * (1 - a3)) / a3, f)
    col = np.clip(col, 0, 255)
    # colour bleed: edge pixels take the colour of the nearest solid pixel, so no dark rim
    solid = alpha > 0.97
    idx = ndi.distance_transform_edt(~solid, return_distances=False, return_indices=True)
    bleed = col[idx[0], idx[1]]
    edge = (alpha > 0.02) & ~solid
    lum = col.mean(-1) < bleed.mean(-1)
    col = np.where((edge & lum)[..., None], bleed, col)
    return col.astype(np.uint8), (alpha * 255).astype(np.uint8)


def main(board, out):
    im = np.array(Image.open(board).convert("RGB"))
    import os
    os.makedirs(out, exist_ok=True)
    for n, (x0, x1) in zip(NAMES, XR):
        col, a = matte(im[Y0:Y1_OVERRIDE.get(n, Y1), x0:x1], n)
        rgba = Image.fromarray(np.dstack([col, a]), "RGBA")
        bbox = rgba.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()
        rgba = rgba.crop(bbox)
        s = min((OUT - 24) / rgba.width, (OUT - 24) / rgba.height, SCALE)
        # premultiplied resize avoids fringes
        arr = np.array(rgba).astype(np.float32)
        arr[..., :3] *= arr[..., 3:] / 255
        sz = (round(rgba.width * s), round(rgba.height * s))
        ch = [Image.fromarray(arr[..., i]).resize(sz, Image.LANCZOS) for i in range(4)]
        r = np.dstack([np.array(c) for c in ch])
        al = np.clip(r[..., 3:], 0, 255)
        r[..., :3] = np.where(al > 0.5, r[..., :3] / np.maximum(al, 1) * 255, 0)
        r = np.clip(np.dstack([r[..., :3], al]), 0, 255).astype(np.uint8)
        canvas = Image.new("RGBA", (OUT, OUT), (0, 0, 0, 0))
        p = Image.fromarray(r, "RGBA")
        canvas.paste(p, ((OUT - p.width) // 2, OUT - p.height - 8), p)
        canvas.save(f"{out}/phantom-{n}.png", optimize=True)
        print(n, p.size)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
