import { getFontSizeClass } from "../Other/SettingMenu";
import { useNavigate } from "react-router-dom";

export default function Example({ examples, setting }) {
  const navigate = useNavigate();

  const isKanji = (ch) => /[\u3400-\u4DBF\u4E00-\u9FFF]/.test(ch);

  // Hàm parse furigana: chuyển "[漢|かん]字" -> clickable kanji + ruby
  const renderFurigana = (furigana) => {
    const parts = [];
    const regex = /\[(.*?)\|(.*?)\]/g;
    let lastIndex = 0;
    let match;

    const renderClickableText = (text) =>
      text.split("").map((ch, idx) =>
        isKanji(ch) ? (
          <span
            key={`${text}-${idx}`}
            className="cursor-pointer hover:text-blue-500"
            onClick={() => navigate(`/kanji/${ch}`)}
          >
            {ch}
          </span>
        ) : (
          <span key={`${text}-${idx}`}>{ch}</span>
        )
      );

    while ((match = regex.exec(furigana)) !== null) {
      if (match.index > lastIndex) {
        const plainText = furigana.slice(lastIndex, match.index);
        plainText.split("|").forEach((chunk, idx) => {
          if (chunk)
            parts.push(
              <span key={`${match.index}-plain-${idx}`} className="mx-[1px]">
                {renderClickableText(chunk)}
              </span>
            );
        });
      }

      if (match[1] && match[2]) {
        const readings = match[2].split("|");

        parts.push(
          <ruby key={match.index}>
            <span className="mx-[1px]">{renderClickableText(match[1])}</span>
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
              {renderClickableText(chunk)}
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

          {/* Câu dịch tiếng Anh */}
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
