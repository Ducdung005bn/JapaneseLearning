import requests
import json

kanji_list_file = r"C:\Users\Admin\Documents\JapaneseLearning\scripts\kanji\kanji_list.txt"  # Đường dẫn file chứa danh sách kanji
output_file = r"kanjiapi.json"

# Đọc danh sách kanji
with open(kanji_list_file, "r", encoding="utf-8") as f:
    # Duyệt từng dòng trong f, nếu line.strip() không rỗng thì đưa line.strip() vào kanji_list
    kanji_list = [line.strip() for line in f if line.strip()]

kanji_data = {}

for kanji in kanji_list:
    url = f"https://kanjiapi.dev/v1/kanji/{kanji}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            kanji_data[kanji] = {
                "heisig_en": data.get("heisig_en"),
                "jlpt": data.get("jlpt"),
                "grade": data.get("grade"),
                "kun_readings": data.get("kun_readings"),
                "on_readings": data.get("on_readings"),
                "name_readings": data.get("name_readings"),
                "meanings": data.get("meanings")
            }
            print(f"Lấy thành công: {kanji}")
        else:
            print(f"Lỗi khi lấy dữ liệu: {kanji} ({response.status_code})")
    except Exception as e:
        print(f"Lỗi {kanji}: {e}")

# Lưu ra file JSON
with open(output_file, "w", encoding="utf-8") as f:
    # Đưa kanji_data vào file f, không chuyển kanji thành ascii và thụt đầu dòng
    json.dump(kanji_data, f, ensure_ascii=False, indent=2)

print(f"Đã lưu thông tin vào {output_file}")
