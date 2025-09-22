import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import KanjiSearch from "../components/Kanji/KanjiSearch.jsx";
import LoadingIcon from "../components/Other/LoadingIcon.jsx";
import { getFontSizeClass } from "../components/Other/SettingMenu.jsx";

export default function Kanji({ setting }) {
  const location = useLocation(); // query params
  const searchParams = new URLSearchParams(location.search);
  const kanji = searchParams.get("kanji");
  const han_viet = searchParams.get("han_viet");
  const children = searchParams.get("children");
  const on_readings = searchParams.get("on_readings");
  const kun_readings = searchParams.get("kun_readings");

  const [kanjiList, setKanjiList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (![kanji, han_viet, children, on_readings, kun_readings].some(Boolean)) {
    setKanjiList([]); // hoặc giữ nguyên danh sách cũ
    return;
  }

  const fetchKanji = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/kanji/filter", {
        params: { kanji, han_viet, children, on_readings, kun_readings }
      });
      setKanjiList(res.data);
    } catch (err) {
      console.error(err);
      setKanjiList([]);
    } finally {
      setLoading(false);
    }
  };

  fetchKanji();
}, [kanji, han_viet, children, on_readings, kun_readings]);

  return (
    <div className="flex flex-col gap-y-3 w-full mx-auto">
      <KanjiSearch setting={setting} />

      <section className="w-full mx-auto flex flex-col gap-2">
        {loading ? (
          <LoadingIcon setting={setting} />
        ) : kanjiList.length === 0 ? (
          <p className={`${getFontSizeClass(setting.fontSize, "medium")} text-center text-slate-600 py-6`}>No results found</p>
        ) : (
          kanjiList.map((k, idx) => (
            <div
              key={idx}
              className="w-full grid grid-cols-5 gap-2 px-4 py-2 rounded-2xl bg-white/50 
                        backdrop-blur-md shadow-md hover:bg-emerald-100 cursor-pointer transition"
              onClick={() => window.location.href = `/kanji/${k.kanji}`}
            >
              <div className={`col-span-1 flex items-center justify-center font-bold ${getFontSizeClass(setting.fontSize, "large")}`}>
                {k.kanji}
              </div>
              <div className={`col-span-1 flex items-center justify-center ${getFontSizeClass(setting.fontSize, "medium")}`}>
                {k.han_viet.map(h => h.reading).join(" ・ ").toUpperCase()}
              </div>
              <div className={`col-span-1 flex items-center justify-center ${getFontSizeClass(setting.fontSize, "medium")}`}>
                {k.heisig_en}
              </div>
              <div className={`col-span-1 flex items-center justify-center ${getFontSizeClass(setting.fontSize, "medium")}`}>
                {k.on_readings.join(" ・ ")}
              </div>
              <div className={`col-span-1 flex items-center justify-center ${getFontSizeClass(setting.fontSize, "medium")}`}>
                {k.kun_readings.join(" ・ ")}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
