import re
import requests
from bs4 import BeautifulSoup, NavigableString
from collections import OrderedDict

def crawl_kanji_details(kanji: str):
    url = f"https://hvdic.thivien.net/whv/{kanji}"
    resp = requests.get(url, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
    resp.encoding = "utf-8"
    soup = BeautifulSoup(resp.text, "html.parser")

    data = OrderedDict()
    data["kanji"] = kanji
    data["six_principles"] = None
    data["han_viet"] = []

    # ---------- LẤY LỤC THƯ ----------
    six_principles_val = None
    label = soup.find(string=re.compile(r"Lục\s*thư\s*:"))
    if label:
        pieces = []
        m = re.search(r"Lục\s*thư\s*:\s*(.+)", str(label))
        if m:
            pieces.append(m.group(1))
        node = label.next_sibling
        while node and not (getattr(node, "name", None) == "br"):
            if isinstance(node, NavigableString):
                pieces.append(str(node))
            node = node.next_sibling
        six_principles_val = "".join(pieces).strip(" :\n\t")
    data["six_principles"] = six_principles_val if six_principles_val else None

    # ---------- LẤY ÂM HÁN VIỆT ----------
    readings = []
    am_label = soup.find(string=re.compile(r"Âm\s*Hán\s*Việt\s*:"))
    if am_label:
        for sp in am_label.parent.select('span.hvres-goto-link[data-goto-idx]'):
            idx = sp.get("data-goto-idx", "").strip()
            reading = sp.get_text(strip=True)
            if idx and reading:
                readings.append((idx, reading))

    # ---------- GHÉP VỚI NGHĨA & TỪ GHÉP ----------
    for idx, reading in readings:
        block = soup.select_one(f'div.hvres[data-hvres-idx="{idx}"]')
        if not block:
            continue

        common_meanings = []
        cited_meanings = []

        # tìm các nguồn nghĩa
        for p in block.select("div.hvres-details > p.hvres-source"):
            source_name = p.get_text(strip=True)

            # --- Từ điển phổ thông ---
            if source_name == "Từ điển phổ thông":
                div_mean = p.find_next_sibling("div", class_="hvres-meaning")
                if div_mean and "small" not in (div_mean.get("class") or []):
                    raw = div_mean.get_text("\n", strip=True)
                    common_meanings = [line.strip() for line in raw.split("\n") if line.strip()]

            # --- Từ điển trích dẫn ---
            elif source_name == "Từ điển trích dẫn":
                div_mean = p.find_next_sibling("div", class_="hvres-meaning")
                if div_mean:
                    raw = div_mean.get_text("\n", strip=True)
                    cited_meanings = [line.strip() for line in raw.split("\n") if line.strip()]

        # ---- TỪ GHÉP ----
        compounds = []
        for p in block.select("div.hvres-details > p.hvres-source"):
            if "Từ ghép" in p.get_text(strip=True):
                div_comp = p.find_next_sibling("div", class_="hvres-meaning")
                if div_comp and "small" in (div_comp.get("class") or []):
                    compounds = [a.get_text(strip=True) for a in div_comp.find_all("a")]
                break

        data["han_viet"].append({
            "reading": reading,
            "common_meanings": common_meanings,
            "cited_meanings": cited_meanings,
            "compounds": compounds
        })

    return data

# --- Chạy thử ---
if __name__ == "__main__":
    from pprint import pprint
    pprint(crawl_kanji_details("日"), width=120)


