"""Split the FHSB logo (white background, purple + near-black ink) into two transparent layers.

usage: python -I split_logo.py <logo.png> <out_dir> [target_width]

  logo-purple.png : constant purple colour, alpha = purple coverage
  logo-ink.png    : alpha = ink coverage (used as a CSS mask so the ink follows the theme colour)
Also writes previews of the layers on white and on dark, and prints the sampled colours.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

src, out = Path(sys.argv[1]), Path(sys.argv[2])
target_w = int(sys.argv[3]) if len(sys.argv) > 3 else 1000
out.mkdir(parents=True, exist_ok=True)

im = Image.open(src).convert("RGB")
a = np.asarray(im).astype(np.float32)
R, B = a[..., 0], a[..., 2]
s = B - R  # purple: strongly positive; white / grey / near-black: ~0

strong = s > 60
P = np.median(a[strong], axis=0)
ink_px = (a.sum(-1) < 150) & (s < 12)
K = np.median(a[ink_px], axis=0)
print("purple RGB", P.round(1), "hex #%02x%02x%02x" % tuple(int(round(v)) for v in P))
print("ink    RGB", K.round(1), "pixels purple/ink", int(strong.sum()), int(ink_px.sum()))

# Anti-aliased purple edge pixels have a weak blue-red difference; keep them in the purple layer by
# treating everything within a few pixels of solid purple as purple (otherwise they leak into ink as a halo).
zone = np.asarray(Image.fromarray((strong * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))) > 0

alpha_p = np.clip((255 - R) / (255 - P[0]), 0, 1)
alpha_k = np.clip((255 - R) / (255 - K[0]), 0, 1)
alpha_p = np.where(zone, alpha_p, 0)
alpha_k = np.where(~zone, alpha_k, 0)
alpha_p[alpha_p < 0.04] = 0
alpha_k[alpha_k < 0.04] = 0

# crop to the content, small padding
both = np.maximum(alpha_p, alpha_k) > 0.1
ys, xs = np.where(both)
pad = 8
y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, both.shape[0])
x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, both.shape[1])
print("crop", (x0, y0, x1, y1), "size", (x1 - x0, y1 - y0))


def layer(alpha):
    img = Image.fromarray((alpha[y0:y1, x0:x1] * 255).round().astype(np.uint8), "L")
    h = round(img.height * target_w / img.width)
    return img.resize((target_w, h), Image.LANCZOS)


ap, ak = layer(alpha_p), layer(alpha_k)


def rgba(alpha_img, color):
    arr = np.zeros((alpha_img.height, alpha_img.width, 4), np.uint8)
    arr[..., :3] = color
    arr[..., 3] = np.asarray(alpha_img)
    return Image.fromarray(arr, "RGBA")


purple = rgba(ap, [int(round(v)) for v in P])
ink = rgba(ak, [0, 0, 0])
purple.save(out / "logo-purple.png", optimize=True)
ink.save(out / "logo-ink.png", optimize=True)
print("size", purple.size, "bytes", (out / "logo-purple.png").stat().st_size, (out / "logo-ink.png").stat().st_size)


def preview(bg, inkcolor, name):
    canvas = Image.new("RGBA", purple.size, bg + (255,))
    canvas.alpha_composite(purple)
    tint = Image.new("RGBA", ink.size, inkcolor + (255,))
    tint.putalpha(ink.getchannel("A"))
    canvas.alpha_composite(tint)
    canvas.convert("RGB").save(out / name)


preview((255, 255, 255), (28, 28, 34), "preview-light.png")
preview((19, 19, 24), (236, 236, 241), "preview-dark.png")
