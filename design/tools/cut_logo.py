"""Cut the FHSB logo into single objects: one transparent PNG per object + manifest.json.

usage: python -I cut_logo.py <logo.png> <parts_dir> <overview.png>

* Shapes that do not touch are separated by connected-component labelling (letters, dots, tubes).
* The dot of an "i" stays with its stem.
* Rings that are joined to sticks (the icon row) are separated geometrically: circles are fitted
  (RANSAC) and re-drawn as complete rings, the stick is fitted as a capsule and drawn complete,
  so a stick can move away from a ring without leaving a gap. The union is checked against the original.
Pieces are saved at half the resolution of the full-size logo, positioned on a shared canvas.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

src, parts_dir, overview = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
parts_dir.mkdir(parents=True, exist_ok=True)
for old in parts_dir.glob("*.png"):
    old.unlink()
rng = np.random.default_rng(7)
EDGE = 0.5  # boundary pixel centres lie ~half a pixel inside the true edge

# ---------------- layers ----------------
a = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
R, B = a[..., 0], a[..., 2]
s = B - R
strong = s > 60
P = np.median(a[strong], axis=0)
K = np.median(a[(a.sum(-1) < 150) & (s < 12)], axis=0)
zone = np.asarray(Image.fromarray((strong * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))) > 0
alpha_p = np.where(zone, np.clip((255 - R) / (255 - P[0]), 0, 1), 0)
alpha_k = np.where(~zone, np.clip((255 - R) / (255 - K[0]), 0, 1), 0)
alpha_p[alpha_p < 0.04] = 0
alpha_k[alpha_k < 0.04] = 0
ys, xs = np.where(np.maximum(alpha_p, alpha_k) > 0.1)
x0, x1, y0, y1 = xs.min() - 8, xs.max() + 9, ys.min() - 8, ys.max() + 9
x0 -= x0 % 2; y0 -= y0 % 2; x1 += x1 % 2; y1 += y1 % 2
alpha_p, alpha_k = alpha_p[y0:y1, x0:x1], alpha_k[y0:y1, x0:x1]
H, W = alpha_p.shape
print("full-res canvas", W, H)

# ---------------- bands ----------------
rows = (np.maximum(alpha_p, alpha_k) > 0.1).any(axis=1)
bands, st = [], None
for y, on in enumerate(rows):
    if on and st is None:
        st = y
    if not on and st is not None:
        bands.append((st, y)); st = None
if st is not None:
    bands.append((st, H))
assert len(bands) == 3, bands
BN = ["icon", "fhsb", "name"]
band_of = lambda cy: next(n for (b0, b1), n in zip(bands, BN) if b0 <= cy < b1)

# ---------------- connected objects ----------------
S8 = np.ones((3, 3), bool)
objs = []
for color, alpha in (("purple", alpha_p), ("ink", alpha_k)):
    lab, _ = ndi.label(alpha > 0.1, structure=S8)
    for i, sl in enumerate(ndi.find_objects(lab), start=1):
        m = lab[sl] == i
        area = int(m.sum())
        if area < 60:
            continue
        cx, cy = (sl[1].start + sl[1].stop) / 2, (sl[0].start + sl[0].stop) / 2
        objs.append(dict(color=color, alpha=alpha, lab=lab, id=i, sl=sl, area=area, cx=cx, cy=cy, band=band_of(cy), mask_sl=m))
print("connected objects:", len(objs))

# i-dots join their stems
name_ink = [o for o in objs if o["band"] == "name" and o["color"] == "ink"]
med = float(np.median([o["area"] for o in name_ink]))
for o in name_ink:
    if o["area"] < 0.1 * med:
        best = None
        for t in name_ink:
            if t is o or t["area"] < 0.1 * med:
                continue
            gap = t["sl"][0].start - o["sl"][0].stop
            if t["sl"][1].start <= o["cx"] <= t["sl"][1].stop and 0 <= gap < 120:
                if best is None or gap < best[0]:
                    best = (gap, t)
        if best:
            best[1].setdefault("merge", []).append(o)
            o["gone"] = True
objs = [o for o in objs if not o.get("gone")]


def raster_piece(o):
    """alpha array + origin for a labelled object (with its merged dots)."""
    group = [o] + o.get("merge", [])
    pad = 8
    sy0 = max(min(g["sl"][0].start for g in group) - pad, 0)
    sy1 = min(max(g["sl"][0].stop for g in group) + pad, H)
    sx0 = max(min(g["sl"][1].start for g in group) - pad, 0)
    sx1 = min(max(g["sl"][1].stop for g in group) + pad, W)
    sub = o["lab"][sy0:sy1, sx0:sx1]
    core = np.isin(sub, [g["id"] for g in group])
    grown = ndi.binary_dilation(core, structure=np.ones((3, 3), bool), iterations=3)
    other = (sub > 0) & ~core
    return o["alpha"][sy0:sy1, sx0:sx1] * (grown & ~other), sx0, sy0


# ---------------- geometric split of ring + stick composites ----------------
def circle3(p):
    (x1, y1), (x2, y2), (x3, y3) = p
    d = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2))
    if abs(d) < 1e-6:
        return None
    ux = ((x1**2 + y1**2) * (y2 - y3) + (x2**2 + y2**2) * (y3 - y1) + (x3**2 + y3**2) * (y1 - y2)) / d
    uy = ((x1**2 + y1**2) * (x3 - x2) + (x2**2 + y2**2) * (x1 - x3) + (x3**2 + y3**2) * (x2 - x1)) / d
    return ux, uy, float(np.hypot(x1 - ux, y1 - uy))


def circle_ls(p):
    x, y = p[:, 0], p[:, 1]
    A = np.c_[2 * x, 2 * y, np.ones(len(x))]
    c = np.linalg.lstsq(A, x**2 + y**2, rcond=None)[0]
    return c[0], c[1], float(np.sqrt(c[2] + c[0] ** 2 + c[1] ** 2))


def ransac_circle(pts, tol=2.5, trials=3000):
    n = len(pts)
    sample = pts[:: max(1, n // 6000)]
    best, best_n = None, 0
    for _ in range(trials):
        c = circle3(sample[rng.choice(len(sample), 3, replace=False)])
        if not c or c[2] < 40 or c[2] > 3000:
            continue
        cnt = int((np.abs(np.hypot(sample[:, 0] - c[0], sample[:, 1] - c[1]) - c[2]) < tol).sum())
        if cnt > best_n:
            best, best_n = c, cnt
    if best is None:
        return None
    for _ in range(3):  # refine on all points
        inl = np.abs(np.hypot(pts[:, 0] - best[0], pts[:, 1] - best[1]) - best[2]) < tol
        if inl.sum() < 10:
            return None
        best = circle_ls(pts[inl])
    inl = np.abs(np.hypot(pts[:, 0] - best[0], pts[:, 1] - best[1]) - best[2]) < tol + 1
    return best, inl


def grid(x0_, y0_, x1_, y1_):
    yy, xx = np.mgrid[y0_:y1_, x0_:x1_].astype(np.float32)
    return xx, yy


def annulus_alpha(c, r_in, r_out, box):
    xx, yy = grid(*box)
    d = np.hypot(xx - c[0], yy - c[1])
    return np.clip(r_out - d + 0.5, 0, 1) * np.clip(d - r_in + 0.5, 0, 1)


def capsule_alpha(p, q, w, box):
    xx, yy = grid(*box)
    p, q = np.array(p), np.array(q)
    dv = q - p
    t = np.clip(((xx - p[0]) * dv[0] + (yy - p[1]) * dv[1]) / (dv @ dv), 0, 1)
    d = np.hypot(xx - (p[0] + t * dv[0]), yy - (p[1] + t * dv[1]))
    return np.clip(w / 2 - d + 0.5, 0, 1)


def split_composite(o):
    """returns ([(role, alpha, ox, oy, extra)], ring list) for a purple object that contains rings."""
    sl = o["sl"]
    pad = 12
    by0, by1 = max(sl[0].start - pad, 0), min(sl[0].stop + pad, H)
    bx0, bx1 = max(sl[1].start - pad, 0), min(sl[1].stop + pad, W)
    box = (bx0, by0, bx1, by1)
    mask = (o["lab"][by0:by1, bx0:bx1] == o["id"]) & (alpha_p[by0:by1, bx0:bx1] > 0.5)
    edge = mask & ~ndi.binary_erosion(mask)
    yy, xx = np.nonzero(edge)
    pts = np.c_[xx + bx0, yy + by0].astype(np.float64)
    circles = []
    for _ in range(6):
        if len(pts) < 600:
            break
        res = ransac_circle(pts)
        if res is None:
            break
        c, inl = res
        if inl.sum() < 500:
            break
        circles.append(c)
        pts = pts[~inl]
    # pair concentric circles into annuli
    used, rings = set(), []
    for i, ci in enumerate(circles):
        if i in used:
            continue
        for j in range(i + 1, len(circles)):
            cj = circles[j]
            if j not in used and np.hypot(ci[0] - cj[0], ci[1] - cj[1]) < 5:
                used |= {i, j}
                rings.append(((ci[0] + cj[0]) / 2, (ci[1] + cj[1]) / 2, min(ci[2], cj[2]) - EDGE, max(ci[2], cj[2]) + EDGE))
                break
    if len(used) != len(circles):
        print("  warning: unpaired circles", [tuple(round(v) for v in c) for k, c in enumerate(circles) if k not in used])
    ring_alpha = np.zeros(mask.shape, np.float32)
    for (cx, cy, ri, ro) in rings:
        ring_alpha = np.maximum(ring_alpha, annulus_alpha((cx, cy), ri, ro, box))
    rem = mask & ~ndi.binary_dilation(ring_alpha > 0.5, iterations=3)
    lab, n = ndi.label(rem, structure=S8)
    sizes = ndi.sum(rem, lab, range(1, n + 1))
    rem = np.isin(lab, [i + 1 for i, sz in enumerate(sizes) if sz >= 400])
    out = []
    for (cx, cy, ri, ro) in rings:
        out.append(("ring", annulus_alpha((cx, cy), ri, ro, box), bx0, by0, dict(c=(cx, cy), ri=ri, ro=ro)))
    if rem.any():
        # stick axis from the two straight edges of the union that are away from the rings
        ring_zone8 = ndi.binary_dilation(ring_alpha > 0.5, iterations=8)
        ey_, ex_ = np.nonzero(edge & ~ring_zone8)
        E = np.c_[ex_ + bx0, ey_ + by0].astype(np.float64)
        sub = E[:: max(1, len(E) // 4000)]
        best = (0, None)
        for _ in range(2500):
            i, j = rng.choice(len(sub), 2, replace=False)
            d_ = sub[j] - sub[i]
            L = float(np.hypot(*d_))
            if L < 100:
                continue
            nn = np.array([-d_[1], d_[0]]) / L
            cnt = int((np.abs((sub - sub[i]) @ nn) < 2.0).sum())
            if cnt > best[0]:
                best = (cnt, (sub[i].copy(), nn))
        p0, nn = best[1]
        for _ in range(3):
            inl = np.abs((E - p0) @ nn) < 2.0
            mu1 = E[inl].mean(0)
            _w, V = np.linalg.eigh(np.cov((E[inl] - mu1).T))
            e_ = V[:, 1]
            nn = np.array([-e_[1], e_[0]])
            p0 = mu1
        e = np.array([nn[1], -nn[0]])
        vv = (E - p0) @ nn
        bestc = (0, 0.0)
        for sgn in (-1, 1):
            for t in np.arange(40, 320, 0.5):
                c_ = int((np.abs(vv - sgn * t) < 1.5).sum())
                if c_ > bestc[0]:
                    bestc = (c_, sgn * t)
        v2 = float(vv[np.abs(vv - bestc[1]) < 1.5].mean())
        v_lo, v_hi = min(0.0, v2), max(0.0, v2)
        width = float(v_hi - v_lo) + 1.0  # edge pixels sit half a pixel inside the true edge
        v0 = (v_lo + v_hi) / 2
        base = p0 + v0 * nn
        yy, xx = np.nonzero(mask & ~ndi.binary_dilation(ring_alpha > 0.5, iterations=3))
        P2 = np.c_[xx + bx0, yy + by0].astype(np.float64)
        keep = np.abs((P2 - base) @ nn) < width / 2 + 1
        P2 = P2[keep]
        u = (P2 - base) @ e
        ends = []
        visible = []
        ring_zone = ndi.binary_dilation(ring_alpha > 0.5, iterations=5)
        for sign, ext in ((-1, np.percentile(u, 0.05)), (1, np.percentile(u, 99.95))):
            near = np.abs(u - ext) < 4
            pe = P2[near]
            frac = ring_zone[(pe[:, 1] - by0).astype(int), (pe[:, 0] - bx0).astype(int)].mean()
            if frac > 0.3:  # end is hidden inside a ring: run the axis to that ring's centre line
                cand = []
                for (cx, cy, ri, ro) in rings:
                    rm = (ri + ro) / 2
                    d0 = base - np.array([cx, cy])
                    bq, cq = d0 @ e, d0 @ d0 - rm**2
                    disc = bq * bq - cq
                    if disc >= 0:
                        for tt in (-bq - np.sqrt(disc), -bq + np.sqrt(disc)):
                            cand.append(tt)
                tgt = min(cand, key=lambda tt: abs(tt - ext)) if cand else ext
                ends.append(base + tgt * e)
                visible.append(False)
            else:  # visible round cap
                ends.append(base + (ext - sign * width / 2) * e)
                visible.append(True)
        # refine each visible (round-capped) end: slide it along the axis to best match the original pixels
        for k in (0, 1):
            if not visible[k]:
                continue
            c0 = ends[k]
            r_ = int(1.7 * width)
            sx0_, sx1_ = max(int(c0[0]) - r_, bx0), min(int(c0[0]) + r_, bx1)
            sy0_, sy1_ = max(int(c0[1]) - r_, by0), min(int(c0[1]) + r_, by1)
            sbox = (sx0_, sy0_, sx1_, sy1_)
            target = alpha_p[sy0_:sy1_, sx0_:sx1_]
            away = ~ring_zone[sy0_ - by0 : sy1_ - by0, sx0_ - bx0 : sx1_ - bx0]
            outward = (e if k == 1 else -e)
            best_d, best_err = 0.0, None
            for dlt in np.arange(-10, 10.01, 0.25):
                q = list(ends)
                q[k] = c0 + dlt * outward
                err = float((np.abs(capsule_alpha(q[0], q[1], width, sbox) - target) * away).sum())
                if best_err is None or err < best_err:
                    best_d, best_err = float(dlt), err
            ends[k] = c0 + best_d * outward
            print(f"    end {k}: moved {best_d:+.2f}px")
        out.append(("stick", capsule_alpha(ends[0], ends[1], width, box), bx0, by0, dict(p=tuple(ends[0]), q=tuple(ends[1]), width=width)))
        print(f"  stick: length {np.hypot(*(ends[1] - ends[0])):.0f}px width {width:.0f}px")
    return out, rings


pieces = []  # dict(key, band, color, alpha, ox, oy, cx, cy, role, ring)
icon_groups = []
for o in objs:
    if o["band"] == "icon" and o["color"] == "purple":
        filled = ndi.binary_fill_holes(o["mask_sl"]).sum()
        if filled > 1.15 * o["area"]:  # contains a ring
            res, rings = split_composite(o)
            print("composite at x~%d: %d ring(s)" % (o["cx"], len(rings)), [r[0] for r in res])
            outer = max(rings, key=lambda r: r[3])
            icon_groups.append(dict(cx=outer[0], cy=outer[1], r_in=outer[2], parts=res))
            o["gone"] = True
objs = [o for o in objs if not o.get("gone")]
icon_groups.sort(key=lambda g: g["cx"])
for gi, g in enumerate(icon_groups, start=1):
    rings = sorted([p for p in g["parts"] if p[0] == "ring"], key=lambda p: -p[4]["ro"])
    sticks = [p for p in g["parts"] if p[0] == "stick"]
    for k, (role, al, ox, oy, ex) in enumerate(rings):
        nm = f"icon{gi}-ring" if len(rings) == 1 else f"icon{gi}-ring-{'outer' if k == 0 else 'inner'}"
        pieces.append(dict(name=nm, band="icon", color="purple", alpha=al, ox=ox, oy=oy))
    for k, (role, al, ox, oy, ex) in enumerate(sticks):
        pieces.append(dict(name=f"icon{gi}-stick", band="icon", color="purple", alpha=al, ox=ox, oy=oy))
    g["inner"] = []

# remaining icon-band objects belong to the ring they sit inside
for o in sorted([o for o in objs if o["band"] == "icon"], key=lambda o: (o["cy"], o["cx"])):
    owner = min(icon_groups, key=lambda g: np.hypot(o["cx"] - g["cx"], o["cy"] - g["cy"]))
    if np.hypot(o["cx"] - owner["cx"], o["cy"] - owner["cy"]) > owner["r_in"]:
        print("  warning: icon object not inside a ring at", o["cx"], o["cy"])
    owner["inner"].append(o)
for gi, g in enumerate(icon_groups, start=1):
    def is_disc(o):
        h_, w_ = o["sl"][0].stop - o["sl"][0].start, o["sl"][1].stop - o["sl"][1].start
        return o["area"] / (h_ * w_) > 0.7 and 0.8 < w_ / h_ < 1.25
    tubes = [o for o in g["inner"] if not is_disc(o)]
    dots = [o for o in g["inner"] if is_disc(o)]
    for k, o in enumerate(sorted(tubes, key=lambda o: o["cy"]), start=1):
        al, ox, oy = raster_piece(o)
        pieces.append(dict(name=f"icon{gi}-tube-{k}", band="icon", color="purple", alpha=al, ox=ox, oy=oy))
    for k, o in enumerate(sorted(dots, key=lambda o: (o["cy"], o["cx"])), start=1):
        al, ox, oy = raster_piece(o)
        pieces.append(dict(name=f"icon{gi}-dot" + (f"-{k}" if len(dots) > 1 else ""), band="icon", color="purple", alpha=al, ox=ox, oy=oy))

objs = [o for o in objs if o["band"] != "icon"]
for band, labels in (("fhsb", list("FHSB")), ("name", list("FuHsingSymphonicBand"))):
    lst = sorted([o for o in objs if o["band"] == band], key=lambda o: o["cx"])
    assert len(lst) == len(labels), (band, len(lst), len(labels))
    for k, (o, ch) in enumerate(zip(lst, labels), start=1):
        al, ox, oy = raster_piece(o)
        nm = f"fhsb-{ch}" if band == "fhsb" else f"name-{k:02d}-{ch}"
        pieces.append(dict(name=nm, band=band, color=o["color"], alpha=al, ox=ox, oy=oy))

# ---------------- write ----------------
manifest = dict(
    source="FHSB official logo (cut into single objects)",
    canvas=dict(width=W // 2, height=H // 2),
    colors=dict(purple="#%02x%02x%02x" % tuple(int(round(v)) for v in P), ink="#%02x%02x%02x" % tuple(int(round(v)) for v in K)),
    parts=[],
)
rebuilt = {c: np.zeros((H // 2, W // 2), np.float32) for c in ("purple", "ink")}
sheet_items = []
for p in pieces:
    al = p["alpha"]
    oy, ox = p["oy"], p["ox"]
    # pad to even full-res coordinates, then halve exactly
    ey, ex = oy % 2, ox % 2
    al = np.pad(al, ((ey, 0), (ex, 0)))
    oy, ox = oy - ey, ox - ex
    al = np.pad(al, ((0, al.shape[0] % 2), (0, al.shape[1] % 2)))
    img = Image.fromarray((np.clip(al, 0, 1) * 255).round().astype(np.uint8), "L").reduce(2)
    bb = img.point(lambda v: 255 if v > 3 else 0).getbbox()
    img = img.crop(bb)
    px, py = ox // 2 + bb[0], oy // 2 + bb[1]
    col = P if p["color"] == "purple" else K
    arr = np.zeros((img.height, img.width, 4), np.uint8)
    arr[..., :3] = [int(round(v)) for v in col]
    arr[..., 3] = np.asarray(img)
    fname = p["name"] + ".png"
    Image.fromarray(arr, "RGBA").save(parts_dir / fname, optimize=True)
    rebuilt[p["color"]][py : py + img.height, px : px + img.width] = np.maximum(
        rebuilt[p["color"]][py : py + img.height, px : px + img.width], np.asarray(img).astype(np.float32) / 255)
    manifest["parts"].append(dict(name=p["name"], file=fname, group=p["band"], color=p["color"], x=int(px), y=int(py), width=img.width, height=img.height))
    sheet_items.append((p["name"], Image.fromarray(arr, "RGBA")))


def half(al):
    return np.asarray(Image.fromarray((al * 255).round().astype(np.uint8), "L").reduce(2)).astype(np.float32) / 255


for color, al in (("purple", alpha_p), ("ink", alpha_k)):
    diff = np.abs(np.clip(rebuilt[color], 0, 1) - half(al))
    print(f"reassembly {color}: max diff {diff.max():.2f}; pixels off by >0.25: {(diff > 0.25).sum()}; by >0.1: {(diff > 0.1).sum()}; mean {diff.mean():.5f}")
    np.save(parts_dir.parent / f"_diff_{color}.npy", diff.astype(np.float16))

(parts_dir / "manifest.json").write_text(json.dumps(manifest, indent=1), encoding="utf8")
cell, cols = 150, 8
rows_n = (len(sheet_items) + cols - 1) // cols
sheet = Image.new("RGB", (cols * cell, rows_n * (cell + 18)), (205, 205, 212))
d = ImageDraw.Draw(sheet)
for k, (name, im) in enumerate(sheet_items):
    r, c = divmod(k, cols)
    f = min((cell - 16) / im.width, (cell - 16) / im.height, 1.0)
    th = im.resize((max(1, round(im.width * f)), max(1, round(im.height * f))), Image.LANCZOS)
    sheet.paste(th, (c * cell + (cell - th.width) // 2, r * (cell + 18) + (cell - th.height) // 2), th)
    d.text((c * cell + 4, r * (cell + 18) + cell + 2), name, fill=(20, 20, 30))
overview.parent.mkdir(parents=True, exist_ok=True)
sheet.save(overview)
print("pieces written:", len(manifest["parts"]))
