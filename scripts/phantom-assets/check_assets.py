"""Numeric checks and Signal Core metrics. Usage: check_assets.py <phantom_dir> [--write-poses]"""
import json
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

NAMES = "default curious working excited sleeping warning resurrection celebrating".split()
d = sys.argv[1]
poses, ok = {}, True
for n in NAMES:
    im = Image.open(f"{d}/phantom-{n}.png")
    a = np.array(im.convert("RGBA")).astype(np.float32)
    al = a[..., 3]
    H, W = al.shape
    border = max(al[0].max(), al[-1].max(), al[:, 0].max(), al[:, -1].max())
    corners = max(al[:8, :8].max(), al[:8, -8:].max(), al[-8:, :8].max(), al[-8:, -8:].max())
    _, comps = ndi.label(ndi.binary_dilation(al > 40, iterations=3))
    ys, xs = np.where(al > 20)
    bbox = (xs.min(), ys.min(), xs.max(), ys.max())
    # luminance of semi transparent edge band composed on light bg
    band = (al > 8) & (al < 120)
    comp = a[..., :3] * (al[..., None] / 255) + 245 * (1 - al[..., None] / 255)
    edge_lum = float(comp[band].mean()) if band.any() else -1
    # signal core: saturated bright green (or red) blob near the chest
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mask = ((g > 200) & (r < 170) & (b < 200) & (g - b > 20)) | ((r > 230) & (g < 120) & (b < 90))
    mask &= (al > 200)
    yy = np.arange(H)[:, None] * np.ones((1, W))
    mask &= (yy > bbox[1] + 0.25 * (bbox[3] - bbox[1])) & (yy < bbox[1] + 0.75 * (bbox[3] - bbox[1]))
    lab, k = ndi.label(mask)
    if n == "resurrection":
        # the green aura matches the colour mask; use the bright white-green centre in the chest window
        m2 = (g > 235) & (r > 120) & (al > 200)
        m2[:, : int(W * 0.47)] = False
        m2[:, int(W * 0.66):] = False
        m2[: int(H * 0.39)] = False
        m2[int(H * 0.54):] = False
        ys2, xs2 = np.where(m2)
        cy, cx = ys2.mean(), xs2.mean()
    elif k:
        sizes = ndi.sum(mask, lab, range(1, k + 1))
        cy, cx = ndi.center_of_mass(mask, lab, 1 + int(np.argmax(sizes)))
    else:
        cy = cx = float("nan")
    poses[n] = {"core": {"x": round(cx / W * 100, 2), "y": round(cy / H * 100, 2)},
                "bbox": {"x0": int(bbox[0]), "y0": int(bbox[1]), "x1": int(bbox[2]), "y1": int(bbox[3])}}
    good = im.mode == "RGBA" and corners == 0 and border == 0 and im.size == (640, 640)
    ok &= good
    print(f"{n:12s} mode={im.mode} size={im.size} corner_a={corners:.0f} border_a={border:.0f} "
          f"components={comps} edge_lum_on_light={edge_lum:.0f} bbox={tuple(int(v) for v in bbox)} "
          f"core=({poses[n]['core']['x']},{poses[n]['core']['y']}) {'OK' if good else 'FAIL'}")
print("ALL OK" if ok else "FAILURES")
if "--write-poses" in sys.argv:
    json.dump({"canvas": 640, "poses": poses}, open(f"{d}/poses.json", "w"), indent=2)
