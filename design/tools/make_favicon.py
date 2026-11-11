"""Build the browser-tab icon from selected logo pieces (default: the French horn = icon3).

usage: python -I make_favicon.py <logo-parts dir> <out dir> [prefix]

Writes favicon.ico (16/32/48 px) and favicon-256.png, purple on a transparent background.
"""
import json
import sys
from pathlib import Path

from PIL import Image

parts_dir, out = Path(sys.argv[1]), Path(sys.argv[2])
prefix = sys.argv[3] if len(sys.argv) > 3 else "icon3-"
out.mkdir(parents=True, exist_ok=True)

manifest = json.loads((parts_dir / "manifest.json").read_text(encoding="utf8"))
W, H = manifest["canvas"]["width"], manifest["canvas"]["height"]
chosen = [p for p in manifest["parts"] if p["name"].startswith(prefix)]
assert chosen, f"no parts start with {prefix!r}"

canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
for p in chosen:
    canvas.alpha_composite(Image.open(parts_dir / p["file"]).convert("RGBA"), (p["x"], p["y"]))
box = canvas.getbbox()
art = canvas.crop(box)

# square canvas with a small margin
side = int(max(art.size) * 1.03)
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
sq.alpha_composite(art, ((side - art.width) // 2, (side - art.height) // 2))

master = sq.resize((512, 512), Image.LANCZOS)
master.resize((256, 256), Image.LANCZOS).save(out / "favicon-256.png", optimize=True)
master.save(out / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
print("pieces:", [p["name"] for p in chosen])
print("art size", art.size, "-> square", side)
