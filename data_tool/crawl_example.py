import json
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

INPUT_FILE = r"C:\Users\Admin\Documents\JapaneseLearning\data\jmdict-eng-common-3.6.1 copy.json"
OUTPUT_FILE = r"C:\Users\Admin\Documents\JapaneseLearning\data\jmdict-with-examples copy.jsonl"

def get_tatoeba_examples(word):
    url = "https://tatoeba.org/eng/api_v0/search"
    params = {
        "query": word,
        "from": "jpn",
        "to": "eng",
        "page": 1,
        "orphans": "no"
    }
    try:
        r = requests.get(url, params=params)  # không timeout
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"⚠️ Không lấy được ví dụ cho '{word}': {e}")
        return []

    examples = []
    for item in data.get("results", []):
        jp = item.get("text")
        furigana = None
        if item.get("transcriptions"):
            furigana = item["transcriptions"][0].get("text")
        en_list = [t["text"] for group in item.get("translations", []) for t in group]
        examples.append({"jp": jp, "furigana": furigana, "en": en_list})
    return examples


def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        jmdict = json.load(f)

    words = jmdict.get("words", [])
    print(f"Tổng số từ trong từ điển: {len(words)}")

    Path(OUTPUT_FILE).parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f_out:
        # ghi metadata ở dòng đầu tiên
        meta = {
            "version": jmdict.get("version"),
            "languages": jmdict.get("languages"),
            "commonOnly": jmdict.get("commonOnly"),
            "dictDate": jmdict.get("dictDate"),
        }
        f_out.write(json.dumps({"meta": meta}, ensure_ascii=False) + "\n")

        # tải và ghi từng từ
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {}
            for word in words:
                query_word = word["kanji"][0]["text"] if word.get("kanji") else word["kana"][0]["text"]
                futures[executor.submit(get_tatoeba_examples, query_word)] = (word, query_word)

            for future in as_completed(futures):
                word, query_word = futures[future]
                try:
                    examples = future.result()
                except Exception as e:
                    print(f"Lỗi với {query_word}: {e}")
                    examples = []

                result_item = {**word, "examples": examples}
                print(f"Đã xử lý xong: {query_word}")  
                f_out.write(json.dumps(result_item, ensure_ascii=False) + "\n")  # ghi mỗi từ 1 dòng

    print(f"\nĐã lưu {len(words)} từ (kèm ví dụ) vào file: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
