import re
import requests
from bs4 import BeautifulSoup, NavigableString
from collections import OrderedDict

def crawl_han_viet(kanji: str):
    url = f"https://hvdic.thivien.net/whv/{kanji}"
    resp = requests.get(url, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
    resp.encoding = "utf-8"
    soup = BeautifulSoup(resp.text, "html.parser")

    data = OrderedDict()
    data["kanji"] = kanji
    data["six_principles"] = None
    data["han_viet"] = []

    # ---------- SIX PRINCIPLES ----------
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

    # ---------- HAN VIET ----------
    readings = []
    han_viet_label = soup.find(string=re.compile(r"Âm\s*Hán\s*Việt\s*:"))
    if han_viet_label:
        parent = han_viet_label.parent
        content = ""
        for elem in parent.children:
            if elem == han_viet_label:
                continue
            if getattr(elem, 'name', None) == 'br':
                break
            content += str(elem)

        sub_soup = BeautifulSoup(content, "html.parser")
        for tag in sub_soup.find_all(['span', 'a']):
            reading = tag.get_text(strip=True)
            if reading:
                readings.append(reading)

    # ---------- MEANINGS & COMPOUNDS ----------
    for i, reading in enumerate(readings):
        idx = i + 1  # data-hvres-idx bắt đầu từ 1
        block = soup.select_one(f'div.hvres[data-hvres-idx="{idx}"]')

        common_meanings = []
        cited_meanings = []
        thieu_chuu_meanings = []
        tran_van_chanh_meanings = []
        nguyen_quoc_hung_meanings = []
        compounds = []

        if block:
            for p in block.select("div.hvres-details > p.hvres-source"):
                source_name = p.get_text(strip=True)
                div_mean = p.find_next_sibling("div", class_="hvres-meaning")
                if not div_mean:
                    continue

                raw = div_mean.get_text("\n", strip=True)
                meanings = [line.strip() for line in raw.split("\n") if line.strip()]

                if source_name == "Từ điển phổ thông":
                    common_meanings.extend(meanings)
                elif source_name == "Từ điển trích dẫn":
                    cited_meanings.extend(meanings)
                elif source_name == "Từ điển Thiều Chửu":
                    thieu_chuu_meanings.extend(meanings)
                elif source_name == "Từ điển Trần Văn Chánh":
                    tran_van_chanh_meanings.extend(meanings)
                elif source_name == "Từ điển Nguyễn Quốc Hùng":
                    nguyen_quoc_hung_meanings.extend(meanings)

            for p in block.select("div.hvres-details > p.hvres-source"):
                if "Từ ghép" in p.get_text(strip=True):
                    div_comp = p.find_next_sibling("div", class_="hvres-meaning")
                    if div_comp and "small" in (div_comp.get("class") or []):
                        compounds = [a.get_text(strip=True) for a in div_comp.find_all("a")]
                    break

        data["han_viet"].append(OrderedDict([
            ("reading", reading),
            ("common_meanings", common_meanings),
            ("cited_meanings", cited_meanings),
            ("thieu_chuu_meanings", thieu_chuu_meanings),
            ("tran_van_chanh_meanings", tran_van_chanh_meanings),
            ("nguyen_quoc_hung_meanings", nguyen_quoc_hung_meanings),
            ("compounds", compounds)
        ]))


    return data

if __name__ == "__main__":
    import json

    kanji_data = []

    with open(r"C:\Users\Admin\Documents\JapaneseLearning\scripts\kanji\kanji_list.txt", "r", encoding="utf-8") as f:
        kanji_list = [line.strip() for line in f if line.strip()]

    for kanji in kanji_list:
        try:
            data = crawl_han_viet(kanji)
            kanji_data.append(data)
            print(f"Crawled {kanji}")
        except Exception as e:
            print(f"Error crawling {kanji}: {e}")

    with open("han_viet_data.json", "w", encoding="utf-8") as f:
        json.dump(kanji_data, f, ensure_ascii=False, indent=2)

    print(f"Crawled {len(kanji_data)} kanji. Saved to han_viet_data.json")

