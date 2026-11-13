"""Prepare the concert-band instrument icons for the Members page.

usage: python -I prep_instrument_icons.py <folder with the supplied PNGs> <web out dir> <originals out dir>

Takes the supplied single-colour PNGs (purple on transparent), keeps the 18 concert-band instruments, and writes
  - web versions (max 224 px on the long side, shape only = alpha mask) named <id>.png, e.g. alto-saxophone.png
  - an untouched copy of each original in the originals folder
Violin, viola, cello and harp are deliberately not included (not concert-band instruments).
"""
import shutil
import sys
from pathlib import Path

from PIL import Image

src, web, originals = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
web.mkdir(parents=True, exist_ok=True)
originals.mkdir(parents=True, exist_ok=True)

# supplied file name -> id used on the site (same order as src/data/members.ts)
FILES = {
    "Piccolo.png": "piccolo",
    "Flute.png": "flute",
    "Oboe.png": "oboe",
    "Bassoon.png": "bassoon",
    "Eb Clarinet.png": "eb-clarinet",
    "Clarinet.png": "clarinet",
    "Bass Clarinet.png": "bass-clarinet",
    "Soprano Saxophone.png": "soprano-saxophone",
    "Alto Saxophone.png": "alto-saxophone",
    "Tenor Saxophone.png": "tenor-saxophone",
    "Baritone Saxophone.png": "baritone-saxophone",
    "Trumpet.png": "trumpet",
    "French Horn.png": "horn",
    "Trombone.png": "trombone",
    "Euphonium.png": "euphonium",
    "Tuba.png": "tuba",
    "Double Bass.png": "double-bass",
    "Percussion.png": "percussion",
}

total = 0
for name, ident in FILES.items():
    f = src / name
    if not f.exists():
        raise SystemExit(f"missing: {f}")
    shutil.copyfile(f, originals / name)
    im = Image.open(f).convert("RGBA")
    im.thumbnail((224, 224), Image.LANCZOS)
    out = web / f"{ident}.png"
    # the icons are one flat colour, so only the shape (alpha) is stored; the page colours it through a CSS mask
    Image.merge("LA", (Image.new("L", im.size, 0), im.getchannel("A"))).save(out, optimize=True)
    total += out.stat().st_size
    print(f"{ident:20s} {im.size}  {out.stat().st_size:6d} bytes")
print("web total:", total, "bytes for", len(FILES), "icons")
