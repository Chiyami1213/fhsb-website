import json, sys
from pathlib import Path
from PIL import Image
d = Path(sys.argv[1]); out = Path(sys.argv[2])
m = json.loads((d / "manifest.json").read_text(encoding="utf8"))
W, H = m["canvas"]["width"], m["canvas"]["height"]
for tag, bg, ink in (("light", (255, 255, 255), (28, 28, 34)), ("dark", (19, 19, 24), (236, 236, 241))):
    canvas = Image.new("RGBA", (W, H), bg + (255,))
    for p in m["parts"]:
        im = Image.open(d / p["file"]).convert("RGBA")
        if p["color"] == "ink":
            t = Image.new("RGBA", im.size, ink + (255,)); t.putalpha(im.getchannel("A")); im = t
        canvas.alpha_composite(im, (p["x"], p["y"]))
    canvas.convert("RGB").resize((1000, round(1000 * H / W)), Image.LANCZOS).save(out / f"reassembled-{tag}.png")
print("canvas", W, H, "parts", len(m["parts"]))
