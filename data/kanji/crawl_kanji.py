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
    data["luc_thu"] = None
    data["am_han_viet"] = []

    # ---------- LẤY LỤC THƯ ----------
    luc_thu_val = None
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
        luc_thu_val = "".join(pieces).strip(" :\n\t")
    data["luc_thu"] = luc_thu_val if luc_thu_val else None

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

        nghia_pho_thong = []
        nghia_trich_dan = []

        # tìm các nguồn nghĩa
        for p in block.select("div.hvres-details > p.hvres-source"):
            source_name = p.get_text(strip=True)

            # --- Từ điển phổ thông ---
            if source_name == "Từ điển phổ thông":
                div_mean = p.find_next_sibling("div", class_="hvres-meaning")
                if div_mean and "small" not in (div_mean.get("class") or []):
                    raw = div_mean.get_text("\n", strip=True)
                    nghia_pho_thong = [line.strip() for line in raw.split("\n") if line.strip()]

            # --- Từ điển trích dẫn ---
            elif source_name == "Từ điển trích dẫn":
                div_mean = p.find_next_sibling("div", class_="hvres-meaning")
                if div_mean:
                    raw = div_mean.get_text("\n", strip=True)
                    nghia_trich_dan = [line.strip() for line in raw.split("\n") if line.strip()]

        # ---- TỪ GHÉP ----
        compounds = []
        for p in block.select("div.hvres-details > p.hvres-source"):
            if "Từ ghép" in p.get_text(strip=True):
                div_comp = p.find_next_sibling("div", class_="hvres-meaning")
                if div_comp and "small" in (div_comp.get("class") or []):
                    compounds = [a.get_text(strip=True) for a in div_comp.find_all("a")]
                break

        data["am_han_viet"].append({
            "cach_doc": reading,
            "nghia_pho_thong": nghia_pho_thong,
            "nghia_trich_dan": nghia_trich_dan,
            "tu_ghep": compounds
        })

    return data


# --- Chạy thử ---
if __name__ == "__main__":
    from pprint import pprint
    pprint(crawl_kanji_details("日"), width=120)
