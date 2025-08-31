import json

# Đường dẫn các file
kanjiapi_file = r"C:\Users\Admin\Documents\JapaneseLearning\data\kanjiapi.json"
kanjivg_file = r"C:\Users\Admin\Documents\JapaneseLearning\data\kanjivg.json"
hanviet_file = r"C:\Users\Admin\Documents\JapaneseLearning\data\han_viet.json"
output_file = r"C:\Users\Admin\Documents\JapaneseLearning\data\combined_data.json"

# Hàm đọc JSON và chuyển list sang dict nếu cần
def load_json_as_dict(file_path, key_field=None):
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, list) and key_field:
        return {item[key_field]: item for item in data}
    return data

# Đọc dữ liệu
kanjiapi_data = load_json_as_dict(kanjiapi_file, key_field="kanji")
kanjivg_data = load_json_as_dict(kanjivg_file, key_field="kanji")
hanviet_data = load_json_as_dict(hanviet_file, key_field="kanji")

merged_list = []

# Gộp dữ liệu
for kanji, api_info in kanjiapi_data.items():
    merged_list.append({
        "kanji": kanji,  # thêm field kanji cùng cấp
        "heisig_en": api_info.get("heisig_en"),
        "jlpt": api_info.get("jlpt"),
        "grade": api_info.get("grade"),
        "kun_readings": api_info.get("kun_readings", []),
        "on_readings": api_info.get("on_readings", []),
        "name_readings": api_info.get("name_readings", []),
        "english_meanings": api_info.get("meanings", []),
        "strokes": kanjivg_data.get(kanji, {}).get("strokes"),
        "d": kanjivg_data.get(kanji, {}).get("d", []),
        "children": kanjivg_data.get(kanji, {}).get("children", []),
        "six_principles": hanviet_data.get(kanji, {}).get("six_principles"),
        "han_viet": hanviet_data.get(kanji, {}).get("han_viet", [])
    })

# Lưu ra file JSON
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(merged_list, f, ensure_ascii=False, indent=2)

print(f"Đã gộp dữ liệu thành công vào {output_file}")
