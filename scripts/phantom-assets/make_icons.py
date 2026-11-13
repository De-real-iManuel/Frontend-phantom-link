"""Build the PhantomLink icon set from the cleaned poses.

Dev-only tooling. Usage: python make_icons.py <phantom_dir>
Writes favicon-16/32/48/64/180/192/512, favicon.ico, android maskable 192/512,
phantom-icon.png/.webp (512) and mono variants into <phantom_dir>.
The mascot's larger bbox dimension fills OCCUPANCY of the canvas on regular icons.
"""
import json
import sys

import numpy as np
from PIL import Image, ImageDraw

OCC = 0.82          # mascot occupancy on regular icons
OCC_MASKABLE = 0.62  # maskable: inside the 80 percent safe circle
BG_TOP, BG_BOT = (26, 22, 64), (8, 8, 24)


def load(d, n):
    return Image.open(f"{d}/phantom-{n}.png").convert("RGBA")


def tight(im, box=None):
    if box:
        im = im.crop(box)
    return im.crop(im.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox())


def tile(size, radius_frac=0.22, opaque=False):
    g = np.linspace(0, 1, size)[:, None, None]
    top, bot = np.array(BG_TOP), np.array(BG_BOT)
    arr = (top * (1 - g) + bot * g) * np.ones((1, size, 1))
    im = Image.fromarray(arr.astype(np.uint8), "RGB").convert("RGBA")
    if not opaque:
        m = Image.new("L", (size * 4, size * 4), 0)
        ImageDraw.Draw(m).rounded_rectangle((0, 0, size * 4 - 1, size * 4 - 1), int(size * 4 * radius_frac), fill=255)
        im.putalpha(m.resize((size, size), Image.LANCZOS))
    return im


def place(canvas, mascot, occ):
    size = canvas.width
    s = occ * size / max(mascot.size)
    m = mascot.resize((max(1, round(mascot.width * s)), max(1, round(mascot.height * s))), Image.LANCZOS)
    canvas.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
    return m.size


def build(size, mascot, occ, opaque=False, radius=0.22):
    c = tile(size, radius, opaque)
    return c, place(c, mascot, occ)


def main(d):
    full = tight(load(d, "default"))
    head = tight(full, (0, 0, full.width, int(full.height * 0.56)))  # head plus Signal Core
    report = {}
    # master 512 icon with the whole mascot
    ic, sz = build(512, full, OCC)
    ic.save(f"{d}/phantom-icon.png", optimize=True)
    ic.save(f"{d}/phantom-icon.webp", quality=95, method=6)
    report["phantom-icon"] = {"mascot_px": sz, "occupancy": round(max(sz) / 512, 3)}
    for s in (16, 32, 48, 64):
        im, sz = build(s * 8, head, OCC, radius=0.2)
        im = im.resize((s, s), Image.LANCZOS)
        im.save(f"{d}/favicon-{s}.png", optimize=True)
        report[f"favicon-{s}"] = {"occupancy": round(max(sz) / (s * 8), 3), "art": "head+core"}
    ico_src, _ = build(256, head, OCC, radius=0.2)
    ico_src.save(f"{d}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    for s, name in ((180, "favicon-180"), (192, "favicon-192"), (512, "favicon-512")):
        im, sz = build(s * 4, full if s != 180 else full, OCC, opaque=(s == 180), radius=0.22)
        im = im.resize((s, s), Image.LANCZOS)
        im.save(f"{d}/{name}.png", optimize=True)
        report[name] = {"occupancy": round(max(sz) / (s * 4), 3), "opaque": s == 180}
    for s in (192, 512):
        im, sz = build(s * 2, full, OCC_MASKABLE, opaque=True, radius=0)
        im.resize((s, s), Image.LANCZOS).save(f"{d}/maskable-{s}.png", optimize=True)
        report[f"maskable-{s}"] = {"occupancy": round(max(sz) / (s * 2), 3), "opaque": True}
    # monochrome silhouettes: eyes and the core stay as cut-outs
    arr = np.array(full).astype(np.float32)
    a = arr[..., 3] / 255
    lum = arr[..., :3].mean(-1)
    cut = (lum < 70)  # eyes and dark features
    a = np.where(cut, 0, np.clip((a - 0.25) / 0.5, 0, 1))
    for name, rgb in (("phantom-icon-mono", 255), ("phantom-icon-mono-dark", 20)):
        out = np.zeros(arr.shape, np.uint8)
        out[..., :3] = rgb
        out[..., 3] = (a * 255).astype(np.uint8)
        m = Image.fromarray(out, "RGBA")
        c = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        report[name] = {"occupancy": round(max(place(c, m, OCC)) / 512, 3)}
        c.save(f"{d}/{name}.png", optimize=True)
    json.dump(report, open(f"{d}/_icon-report.json", "w"), indent=2)
    print(json.dumps(report, indent=1))


if __name__ == "__main__":
    main(sys.argv[1])
