import { useEffect, useState } from "react";
import axios from "axios";
import { getFontSizeClass } from "./SettingMenu.jsx";

export default function RadicalOf({ selectedKanji, setting }) {
  const [radicalKanji, setRadicalKanji] = useState([]);

  useEffect(() => {
    if (!selectedKanji?.kanji) return;

    const fetchRadicalKanji = async () => {
      try {
        const params = { children: selectedKanji.kanji };
        const res = await axios.get("http://localhost:3000/kanji/filter", { params });
        setRadicalKanji(res.data || []);
      } catch (err) {
        console.error(err);
        setRadicalKanji([]);
      }
    };

    fetchRadicalKanji();
  }, [selectedKanji]);

  const kanjiCount = radicalKanji.length;
  const kanjiText = kanjiCount === 1 ? "KANJI" : "KANJIS";

  return (
    <div className="border p-2 rounded-lg bg-white shadow">
      <div className="flex justify-between items-center">
        <span className={`font-semibold ${getFontSizeClass(setting.fontSize, "medium")}`}>
          <span className="text-red-400">RADICAL OF</span> {kanjiCount} {kanjiText}
        </span>
      </div>
      {kanjiCount > 0 && (
        <div className={`mt-2 ${getFontSizeClass(setting.fontSize, "medium")} flex flex-wrap gap-4`}>
          {radicalKanji.map((k) => (
            <span key={k.kanji} className={`px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold ${getFontSizeClass(setting.fontSize, "large")}`}>
              {k.kanji}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
