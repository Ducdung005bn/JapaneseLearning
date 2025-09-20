import { getFontSizeClass } from "../Other/SettingMenu";

export default function Example({ examples, setting }) {
  // Hàm parse furigana: chuyển "[漢|かん]字" -> " <ruby>漢<rt>かん</rt></ruby>字"
  const renderFurigana = (furigana) => {
    const parts = [];
    const regex = /\[(.*?)\|(.*?)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(furigana)) !== null) {
        if (match.index > lastIndex) {
        const plainText = furigana.slice(lastIndex, match.index);
        plainText.split("|").forEach((chunk, idx) => {
            if (chunk)
            parts.push(
                <span key={`${match.index}-plain-${idx}`} className="mx-[1px]">
                {chunk}
                </span>
            );
        });
        }

        if (match[1] && match[2]) {
        const readings = match[2].split("|"); // tách reading

        parts.push(
            <ruby key={match.index}>
            {match[1]}
            <rt className="text-xs text-rose-500 tracking-wide">
                {readings.map((r, i) => (
                <span key={i} className="mx-[1px]">
                    {r}
                </span>
                ))}
            </rt>
            </ruby>
        );
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < furigana.length) {
        const remaining = furigana.slice(lastIndex);
        remaining.split("|").forEach((chunk, idx) => {
        if (chunk)
            parts.push(
            <span key={`remain-${idx}`} className="mx-[1px]">
                {chunk}
            </span>
            );
        });
    }

    return parts;
  };


  return (
    <section className="mt-4 flex flex-col gap-3">
      {examples.map((ex, i) => (
        <div
          key={ex._id || i}
          className="flex flex-col gap-2 p-3 border rounded-xl bg-slate-50 shadow-sm"
        >
          {/* Câu tiếng Nhật + furigana */}
          <p
            className={`leading-snug ${getFontSizeClass(
              setting.fontSize,
              "medium"
            )}`}
          >
            {renderFurigana(ex.furigana)}
          </p>

          {/* Câu dịch tiếng Anh (chỉ lấy cái đầu tiên) */}
          {ex.en?.length > 0 && (
            <p
              className={`text-gray-700 italic ${getFontSizeClass(
                setting.fontSize,
                "medium"
              )}`}
            >
              {ex.en[0]}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
