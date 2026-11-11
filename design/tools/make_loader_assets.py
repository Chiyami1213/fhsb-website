"""Group the cut logo pieces into the assets used by the loading-screen animation.

usage: python -I make_loader_assets.py <logo-parts dir> <out images dir> <layout.json>

Writes (at 1/3 of the logo-parts resolution, plenty for a ~300 px logo on 3x screens):
  instrument-1..4.png   each icon (ring + stick + inner pieces) as one purple image
  fhsb-F/H/S/B.png      the big black letters (used as CSS masks, so they follow the theme)
  word-F/H/S/B.png      the four purple capitals of "FuHsing Symphonic Band", one image each
  word-ink-1..4.png     the black text between them: "u", "sing", "ymphonic", "and"
and layout.json with each asset's position on the shared logo canvas.
"""
import json
import sys
from pathlib import Path

from PIL import Image

parts_dir, out_dir, layout_path = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
out_dir.mkdir(parents=True, exist_ok=True)
for old in [f for pat in ("instrument-*.png", "fhsb-*.png", "name-*.png", "word-*.png") for f in out_dir.glob(pat)]:
    old.unlink()

m = json.loads((parts_dir / "manifest.json").read_text(encoding="utf8"))
W, H = m["canvas"]["width"], m["canvas"]["height"]
SCALE = 3


def compose(parts):
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for p in parts:
        canvas.alpha_composite(Image.open(parts_dir / p["file"]).convert("RGBA"), (p["x"], p["y"]))
    box = canvas.getbbox()
    return canvas.crop(box), box


def save(name, parts):
    img, box = compose(parts)
    small = img.resize((max(1, round(img.width / SCALE)), max(1, round(img.height / SCALE))), Image.LANCZOS)
    small.save(out_dir / name, optimize=True)
    return dict(src=f"/images/{out_dir.name}/{name}", x=box[0], y=box[1], w=box[2] - box[0], h=box[3] - box[1])


layout = dict(canvas=dict(w=W, h=H), instruments=[], fhsb=[], name={})
for i in (1, 2, 3, 4):
    layout["instruments"].append(save(f"instrument-{i}.png", [p for p in m["parts"] if p["name"].startswith(f"icon{i}-")]))
for ch in "FHSB":
    layout["fhsb"].append(save(f"fhsb-{ch}.png", [p for p in m["parts"] if p["name"] == f"fhsb-{ch}"]))
name_parts = {int(p["name"].split("-")[1]): p for p in m["parts"] if p["group"] == "name"}  # 1..20, letters F u H s i n g S y m p h o n i c B a n d
purple_idx = [1, 3, 8, 17]
ink_runs = [[2], [4, 5, 6, 7], [9, 10, 11, 12, 13, 14, 15, 16], [18, 19, 20]]
assert all(name_parts[i]["color"] == "purple" for i in purple_idx)
assert all(name_parts[i]["color"] == "ink" for run in ink_runs for i in run)
layout["name"] = dict(purple=[], ink=[])
for ch, i in zip("FHSB", purple_idx):
    layout["name"]["purple"].append(save(f"word-{ch}.png", [name_parts[i]]))
for k, run in enumerate(ink_runs, start=1):
    layout["name"]["ink"].append(save(f"word-ink-{k}.png", [name_parts[i] for i in run]))

layout_path.parent.mkdir(parents=True, exist_ok=True)
layout_path.write_text(json.dumps(layout, indent=1), encoding="utf8")
total = sum(f.stat().st_size for f in out_dir.glob("*.png") if f.name.startswith(("instrument-", "fhsb-", "word-")))
print("assets:", len(list(out_dir.glob("*.png"))), "files, bytes", total)
