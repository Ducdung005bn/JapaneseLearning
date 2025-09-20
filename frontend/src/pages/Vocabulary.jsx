import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom"; // 👈 THÊM
import VocabularySearch from "../components/Vocabulary/VocabularySearch.jsx";
import { getFontSizeClass } from "../components/Other/SettingMenu.jsx";

export default function Vocabulary({ setting }) {
  const location = useLocation();
  const navigate = useNavigate(); 
  const searchParams = new URLSearchParams(location.search);
  const meaning = searchParams.get("meaning");
  const writing = searchParams.get("writing");

  const [vocabList, setVocabList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (![meaning, writing].some(Boolean)) {
      setVocabList([]);
      return;
    }

    const fetchVocab = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/vocabulary/filter", {
          params: { meaning, writing }
        });
        setVocabList(res.data);
      } catch (err) {
        console.error(err);
        setVocabList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVocab();
  }, [meaning, writing]);

  return (
    <div className="flex flex-col gap-y-3 w-full mx-auto">
      <VocabularySearch setting={setting} />

      <section className="w-full mx-auto flex flex-col gap-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className={`mt-2 text-emerald-600 ${getFontSizeClass(setting.fontSize, "medium")} font-semibold`}>Loading...</p>
          </div>
        ) : vocabList.length === 0 ? (
          <p className={`${getFontSizeClass(setting.fontSize, "medium")} text-center text-slate-600 py-6`}>No results found</p>
        ) : (
          vocabList.map((v, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/vocabulary/${v._id}`)} // 👈 CHUYỂN TRANG
              className="w-full grid grid-cols-5 gap-2 px-4 py-2 rounded-2xl bg-white/50 
                        backdrop-blur-md shadow-md hover:bg-emerald-100 cursor-pointer transition"
            >
              {/* Kanji */}
              <div className={`col-span-1 flex flex-col items-center justify-center font-bold ${getFontSizeClass(setting.fontSize, "large")}`}>
                {v.kanji.map(k => k.text).join(" ・ ")}
              </div>
              
              {/* Kana */}
              <div className={`col-span-1 flex flex-col items-center justify-center ${getFontSizeClass(setting.fontSize, "medium")}`}>
                {v.kana.map(k => k.text).join(" ・ ")}
              </div>

              {/* English Meaning */}
              <div className={`col-span-1 flex flex-col items-start justify-center ${getFontSizeClass(setting.fontSize, "medium")}`}>
                {v.sense.flatMap(s => s.gloss.map(g => g.text)).join(" ・ ")}
              </div>

              {/* Example */}
              <div className="col-span-2 flex flex-col items-start justify-center">
                {v.examples.length > 0 && (
                  <>
                    <p className={`font-bold ${getFontSizeClass(setting.fontSize, "medium")}`}>{v.examples[0].jp}</p>
                    <p className={`text-slate-500 ${getFontSizeClass(setting.fontSize, "small")}`}>{v.examples[0].en[0]}</p>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
