import json

INPUT_FILE = r"C:\Users\Admin\Documents\JapaneseLearning\data\jmdict-with-examples.jsonl"
OUTPUT_FILE = r"C:\Users\Admin\Documents\JapaneseLearning\data\jmdict-with-examples.json"

data = []
meta = None

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        obj = json.loads(line)
        if i == 0 and "meta" in obj:  # dòng đầu tiên là metadata
            meta = obj["meta"]
            continue
        data.append(obj)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f_out:
    f_out.write('{"meta":')
    f_out.write(json.dumps(meta, ensure_ascii=False))
    f_out.write(',"words":[\n')

    for i, word in enumerate(data):
        f_out.write(json.dumps(word, ensure_ascii=False))
        if i < len(data) - 1:
            f_out.write(",\n")  # xuống dòng giữa các từ
        else:
            f_out.write("\n")  # cuối cùng không có dấu ,

    f_out.write("]}")
    
print(f"Đã chuyển {len(data)} dòng thành JSON: {OUTPUT_FILE}")
