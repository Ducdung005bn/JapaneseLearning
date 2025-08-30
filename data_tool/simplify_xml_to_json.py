import xml.etree.ElementTree as ET
import json

xml_file = r"C:\Users\Admin\Documents\JapaneseLearning\data\kanjivg.xml"
json_file = "kanjivg.json"
kanji_list_file = r"C:\Users\Admin\Documents\JapaneseLearning\data\kanji_list.txt"

# Đọc danh sách kanji cần giữ
with open(kanji_list_file, "r", encoding="utf-8") as f:
    kanji_list = set(line.strip() for line in f if line.strip())

# Đọc file XML
tree = ET.parse(xml_file)
root = tree.getroot()

ns_uri = 'http://kanjivg.tagaini.net'
kanji_list_output = []
count_total = 0
count_added = 0

for kanji in root.findall('kanji'):
    count_total += 1
    kanji_id = kanji.get('id')
    
    g_tag = kanji.find('g')
    if g_tag is None:
        print(f"{kanji_id}: Không có thẻ <g>")
        continue

    kanji_char = g_tag.get(f'{{{ns_uri}}}element')
    if not kanji_char:
        print(f"{kanji_id}: Không lấy được chữ kanji từ thẻ <g>")
        continue

    if kanji_char not in kanji_list:
        print(f"{kanji_id}: chữ '{kanji_char}' không có trong kanji_list.txt")
        continue

    path_elements = g_tag.findall(".//path")
    d_list = [p.get('d') for p in path_elements if p.get('d')]

    # Thêm object phẳng vào danh sách
    kanji_list_output.append({
        "kanji": kanji_char,
        "strokes": len(path_elements),
        "d": d_list
    })
    count_added += 1
    print(f"{kanji_id}: Thêm chữ '{kanji_char}' với {len(path_elements)} nét")

print(f"Tổng kanji: {count_total}, Đã thêm vào JSON: {count_added}")

# Lưu ra JSON
with open(json_file, "w", encoding="utf-8") as f:
    json.dump(kanji_list_output, f, ensure_ascii=False, indent=2)
