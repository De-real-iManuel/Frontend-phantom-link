"""Contact sheet of poses on dark and light backgrounds. Usage: contact_sheet.py <dir> <out.png> [label]"""
import sys
from PIL import Image
names = "default curious working excited sleeping warning resurrection celebrating".split()
d, out = sys.argv[1], sys.argv[2]
bgs = [(8, 8, 20), (245, 245, 250), (128, 128, 128)]
c = 256
S = Image.new("RGB", (4 * c, 2 * c * len(bgs)), (0, 0, 0))
for b, bg in enumerate(bgs):
    for i, n in enumerate(names):
        tile = Image.new("RGBA", (c, c), bg + (255,))
        im = Image.open(f"{d}/phantom-{n}.png").convert("RGBA").resize((c, c), Image.LANCZOS)
        tile.alpha_composite(im)
        S.paste(tile.convert("RGB"), ((i % 4) * c, (b * 2 + i // 4) * c))
S.save(out)
