import xml.etree.ElementTree as ET
from svgpathtools import parse_path
import numpy as np
import json
import math

KANJIVG_FILE = r"C:\Users\Admin\Documents\JapaneseLearning\scripts\kanji\kanjivg.xml"
KANJI_LIST_FILE = r"C:\Users\Admin\Documents\JapaneseLearning\scripts\kanji\kanji_list.txt"
OUTPUT_FILE = "kanji_db.json"

EPSILON = 0.02  # cho Douglas–Peucker
SAMPLE_POINTS = 40

# ---------- helpers ----------
def local_name(tag):
    return tag.split('}',1)[-1] if '}' in tag else tag

def get_element_attr(elem):
    for k,v in elem.attrib.items():
        if local_name(k) == "element":
            return v
    return None

def sample_path(d, n=SAMPLE_POINTS):
    path = parse_path(d)
    ts = np.linspace(0,1,n)
    return [(p.real, p.imag) for p in [path.point(t) for t in ts]]

def perp_distance(p, a, b):
    ax,ay = a; bx,by = b; px,py = p
    if ax==bx and ay==by: return math.hypot(px-ax, py-ay)
    return abs((by-ay)*px - (bx-ax)*py + bx*ay - by*ax) / math.hypot(by-ay, bx-ax)

def douglas_peucker(points, eps):
    if len(points)<3: return points[:]
    start, end = points[0], points[-1]
    max_d, idx = 0,0
    for i in range(1,len(points)-1):
        d = perp_distance(points[i], start, end)
        if d>max_d: max_d,max_idx = d,i
    if max_d>eps:
        left = douglas_peucker(points[:max_idx+1], eps)
        right = douglas_peucker(points[max_idx:], eps)
        return left[:-1]+right
    else:
        return [start,end]

def normalize_strokes(raw_strokes):
    all_pts = [p for st in raw_strokes for p in st]
    if not all_pts: return []
    xs = np.array([p[0] for p in all_pts])
    ys = np.array([p[1] for p in all_pts])
    cx, cy = xs.mean(), ys.mean()
    scale = max(xs.max()-xs.min(), ys.max()-ys.min())
    if scale==0: scale=1.0
    norm = []
    for st in raw_strokes:
        norm.append([((x-cx)/scale*0.5, (y-cy)/scale*0.5) for x,y in st])
    return norm

# ---------- load kanji list ----------
with open(KANJI_LIST_FILE, "r", encoding="utf-8") as f:
    kanji_list = [line.strip() for line in f if line.strip()]

# ---------- parse kanjivg ----------
tree = ET.parse(KANJIVG_FILE)
root = tree.getroot()

kanji_db = {}

for kanji_char in kanji_list:
    # tìm <kanji> có bất kỳ <g kvg:element="chữ">
    kanji_elem = None
    for elem in root.iter():
        if local_name(elem.tag)=="g":
            val = get_element_attr(elem)
            if val==kanji_char:
                kanji_elem = elem
                break
    if not kanji_elem:
        print(f"⚠️  Kanji {kanji_char!r} không tìm thấy trong KanjiVG")
        continue

    # lấy tất cả <path> bên dưới
    raw_strokes = []
    for path_elem in kanji_elem.iter():
        if local_name(path_elem.tag)=="path":
            d = path_elem.attrib.get("d")
            if not d: continue
            try:
                pts = sample_path(d)
                raw_strokes.append(pts)
            except Exception as e:
                print(f"❌ Error path {kanji_char}: {e}")

    if not raw_strokes:
        print(f"⚠️  Kanji {kanji_char!r} có g nhưng không có path")
        continue

    # chuẩn hóa và nén
    norm = normalize_strokes(raw_strokes)
    compressed = [ [ {"x":round(x,4), "y":round(y,4)} for x,y in douglas_peucker(st, EPSILON) ] for st in norm ]
    kanji_db[kanji_char] = compressed
    print(f"✅ Parsed {kanji_char}: {len(compressed)} strokes")

# ---------- save ----------
with open(OUTPUT_FILE,"w",encoding="utf-8") as f:
    json.dump(kanji_db,f,ensure_ascii=False,indent=2)

print(f"\nSaved {len(kanji_db)} kanji into {OUTPUT_FILE}")
