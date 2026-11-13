# Phantom asset cleanup

The pack poses (`public/phantom/*` in `phantomlink-mascot-production-pack.zip`) are crops of the concept board. They carried an opaque dark rectangle with a grey halo, the resurrection pose had a blue fragment from its neighbour, and excited, celebrating and resurrection had a dark line on the top edge. They were not used. Every pose is re-extracted from the higher resolution approved board (`docs/phantom-approved-character-board.png` in the pack, 1536x1024).

## Method (scripts/phantom-assets/extract_poses.py)

1. Crop each pose from the lower row of the board by x-range. The ranges sit in the gaps between poses, so no neighbour can leak in (this removes the resurrection blue fragment). The default crop starts at x=20 and ends at y=846 so the bottom-left app icon tile and the floor glow are excluded.
2. Model the board background per row from the crop side columns.
3. Colour to alpha: alpha is the largest per-channel excess over the background (dead zone 0.08), colour is the excess divided by alpha. Soft glow and edges therefore never contain dark background pixels, which removes the dark rim seen on light backgrounds in the first prototype.
4. A filled body hull (largest component with distance from background above 115, 170 for resurrection, holes filled) keeps eyes, mouth and other dark features opaque with their original colour, blended into the edge with a 1.3 px gaussian.
5. Components smaller than 40 px in the alpha layer are dropped. Faint low alpha pixels in the last 32 rows (floor reflection haze) are cleared, except for resurrection whose portal ring belongs to the pose.
6. One common scale (about 1.93x) is applied to all poses (premultiplied Lanczos), centred horizontally and bottom aligned with a 20 px margin on a 640x640 canvas, so crossfades do not jump. Both PNG and WebP (quality 95, alpha) are written.

Per-pose source: all eight come from the board. None needed the pack 640 px poses as a fallback.

Kept as part of the approved poses: question mark, Zz, exclamation mark, sparks, confetti, green rings and portal.

## Icons (scripts/phantom-assets/make_icons.py)

The mascot's larger bounding box dimension fills 82% of the canvas on regular icons, measured and stored in `docs/phantom/icon-report.json`.

| File | Art | Occupancy |
| --- | --- | --- |
| phantom-icon.png / .webp (512) | full body on dark rounded tile | 0.82 |
| favicon-16/32/48/64 | head plus Signal Core crop (the full body is illegible at small sizes) | 0.82 |
| favicon.ico | 16, 32, 48 in one file | 0.82 |
| favicon-180 (Apple) | full body, opaque background, no transparency | 0.82 |
| favicon-192 / favicon-512 (Android) | full body on rounded tile | 0.82 |
| maskable-192 / maskable-512 | full body, full-bleed opaque background | 0.62 |
| phantom-icon-mono.png, phantom-icon-mono-dark.png | white or near black silhouette, eyes cut out, transparent | 0.82 |

Maskable icons deliberately use 0.62 so the mascot stays inside the 80 percent safe circle; they are the one exception to the 80-85% target.

## Wiring

`src/routes/__root.tsx` now links `/phantom/favicon.ico` and the 16/32/48 PNGs, plus a sized 180x180 `apple-touch-icon`. The old `/favicon.svg` link was removed (the file itself is untouched). The platform manifest link and `/__grok/icon-180.png` are intentionally left alone: `grokPwaPlugin` and `server/middleware/grok-pwa.ts` inject both if missing, so replacing them would produce duplicates. The sized Phantom apple icon sits beside the injected one. `public/phantom/manifest.json` carries the correct PhantomLink names, sizes and purposes but is not linked from the head. `mark.tsx`, the header, sidebar and wordmark are unchanged.

## Regenerating

```
python -m venv _work/venv && _work/venv/bin/pip install pillow numpy scipy   # dev only
python scripts/phantom-assets/extract_poses.py <board.png> <out>
python scripts/phantom-assets/make_icons.py <out>
python scripts/phantom-assets/check_assets.py <out> --write-poses
python scripts/phantom-assets/contact_sheet.py <out> docs/phantom/qa <pack/public/phantom>
```

`public/phantom/poses.json` holds each pose's Signal Core centre (percent of canvas) and bounding box.

## QA

`docs/phantom/qa/` holds contact-dark, contact-light, contact-grey, compare-before-after (rows: before dark, before light, after dark, after light), icons and numeric-checks.txt (RGBA, 640x640, corner and border alpha 0 for every pose).

## Limitations

- The source poses are about 300x290 px on the board and are upscaled about 1.93x. They are soft at 640 px; use them at 320 px or less for crisp results.
- The board has no separate layers, so glow is derived from a dark background. On light backgrounds glow and edges become slightly translucent and lighter than on dark; a faint pale rim can be seen at 1:1 on grey.
- Small dark navy patches remain inside some silhouettes (behind the head curl, between arm and body on celebrating, excited, warning). They are the character's own shadowed material that is dark on the board, and removing them would cut into the body.
- Resurrection keeps a wide green aura. Its fine particles are semi-transparent and some are lost by the small component filter.
- Small dark features other than eyes (outlines) are kept opaque.
- The 16 px favicon is a 16x16 downscale of the head crop and is inevitably coarse.
