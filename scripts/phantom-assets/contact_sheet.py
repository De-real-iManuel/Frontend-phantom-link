"""QA sheets. Usage: contact_sheet.py <dir> <qa_out_dir> [<original_dir>]
Writes contact-dark/light/grey.png, icons.png and (with original_dir) compare-before-after.png."""
import os
import sys

from PIL import Image

names = "default curious working excited sleeping warning resurrection celebrating".split()
d, out = sys.argv[1], sys.argv[2]
orig = sys.argv[3] if len(sys.argv) > 3 else None
os.makedirs(out, exist_ok=True)
BG = {"dark": (8, 8, 20), "light": (245, 245, 250), "grey": (128, 128, 128)}
c = 320


def sheet(src, bg, cols=4, size=c):
    rows = (len(names) + cols - 1) // cols
    S = Image.new("RGB", (cols * size, rows * size), bg)
    for i, n in enumerate(names):
        im = Image.open(f"{src}/phantom-{n}.png").convert("RGBA").resize((size, size), Image.LANCZOS)
        t = Image.new("RGBA", (size, size), bg + (255,))
        t.alpha_composite(im)
        S.paste(t.convert("RGB"), ((i % cols) * size, (i // cols) * size))
    return S


for k, bg in BG.items():
    sheet(d, bg).save(f"{out}/contact-{k}.png", optimize=True)
if orig:
    a, b = sheet(orig, BG["light"], 8, 160), sheet(d, BG["light"], 8, 160)
    a2, b2 = sheet(orig, BG["dark"], 8, 160), sheet(d, BG["dark"], 8, 160)
    S = Image.new("RGB", (8 * 160, 4 * 160))
    for i, im in enumerate((a2, a, b2, b)):
        S.paste(im, (0, i * 160))
    S.save(f"{out}/compare-before-after.png", optimize=True)  # rows: before dark, before light, after dark, after light
# icon sheet
files = ["favicon-16", "favicon-32", "favicon-48", "favicon-64", "favicon-180", "favicon-192", "favicon-512",
         "maskable-192", "maskable-512", "phantom-icon-mono", "phantom-icon-mono-dark"]
S = Image.new("RGB", (len(files) * 140, 280), (200, 200, 205))
for i, f in enumerate(files):
    im = Image.open(f"{d}/{f}.png").convert("RGBA")
    t = im.resize((128, 128), Image.NEAREST if im.width < 100 else Image.LANCZOS)
    S.paste(t, (i * 140 + 6, 6), t)
    s = im.resize((32, 32), Image.LANCZOS)
    S.paste(s, (i * 140 + 6, 150), s)
S.save(f"{out}/icons.png", optimize=True)
