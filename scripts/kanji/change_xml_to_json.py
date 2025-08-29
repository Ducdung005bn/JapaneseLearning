import xml.etree.ElementTree as ET
import json

xml_file = r"C:\Users\Admin\Documents\JapaneseLearning\scripts\kanji\kanjivg.xml"
json_file = "kanjivg.json"
kanji_list_file = r"C:\Users\Admin\Documents\JapaneseLearning\scripts\kanji\kanji_list.txt"

# Đọc danh sách kanji cần giữ
with open(kanji_list_file, "r", encoding="utf-8") as f:
    kanji_list = set(line.strip() for line in f if line.strip())

# Đọc file XML
tree = ET.parse(xml_file)
root = tree.getroot()

# Namespace trong XML
ns_uri = 'http://kanjivg.tagaini.net'  # kiểm tra xmlns:kvg trong XML
kanji_dict = {}
count_total = 0
count_added = 0

for kanji in root.findall('kanji'):
    count_total += 1
    kanji_id = kanji.get('id')
    
    g_tag = kanji.find('g')
    if g_tag is None:
        print(f"{kanji_id}: Không có thẻ <g>")
        continue

    # Lấy chữ kanji từ attribute với namespace
    kanji_char = g_tag.get(f'{{{ns_uri}}}element')
    if not kanji_char:
        print(f"{kanji_id}: Không lấy được chữ kanji từ thẻ <g>")
        continue

    if kanji_char not in kanji_list:
        print(f"{kanji_id}: chữ '{kanji_char}' không có trong kanji_list.txt")
        continue

    # Lấy tất cả d và đếm số path (số nét)
    path_elements = g_tag.findall(".//path")
    d_list = [p.get('d') for p in path_elements if p.get('d')]
    kanji_dict[kanji_char] = {
        "strokes": len(path_elements),
        "d": " ".join(d_list)
    }
    count_added += 1
    print(f"{kanji_id}: Thêm chữ '{kanji_char}' với {len(path_elements)} nét")

print(f"Tổng kanji: {count_total}, Đã thêm vào JSON: {count_added}")

# Lưu ra JSON
with open(json_file, "w", encoding="utf-8") as f:
    json.dump(kanji_dict, f, ensure_ascii=False, indent=2)
