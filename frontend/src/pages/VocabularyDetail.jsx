// src/pages/VocabularyDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getFontSizeClass } from "../components/Other/SettingMenu.jsx";
import VocabularySearch from "../components/Vocabulary/VocabularySearch.jsx";
import { Link, Ban } from "lucide-react"; 
import Example from "../components/Vocabulary/Example.jsx";

export default function VocabularyDetail({ setting }) {
  const { id } = useParams();
  const [vocab, setVocab] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/vocabulary/${id}`);
        setVocab(res.data);
      } catch (err) {
        console.error(err);
        setVocab(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (!vocab) {
    return (
      <p className="text-center text-slate-600 py-6 text-lg">
        Vocabulary not found
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-y-3 w-full mx-auto">
        <VocabularySearch setting={setting} />
        <div className="flex gap-3">
            <section className="flex flex-col gap-3 w-full p-4 rounded-2xl bg-white/50 backdrop-blur-md shadow-lg">
                <span className="flex gap-10">
                    <button
                        // onClick={() => setSelectedKanji(null)}
                        className={`${getFontSizeClass(setting.fontSize, "medium")} px-3 py-1 max-w-[70px] rounded-lg bg-red-300 text-white hover:bg-red-600`}
                    >
                        Back
                    </button>
                </span>            
            

<section className="flex flex-wrap gap-x-20 gap-y-4">
  {vocab.kanji.length > 0 ? (
    // Có kanji -> render kanji + kana dưới
    vocab.kanji.map((k, idx) => (
      <div key={idx} className="flex flex-col items-center gap-1">
        {/* Kanji */}
        <span
          className={`${getFontSizeClass(setting.fontSize, "large")} ${
            k.common ? "font-bold text-black" : "text-slate-300"
          }`}
        >
          {k.text}
        </span>

        {/* Kana áp dụng cho kanji này */}
        {vocab.kana
          .filter(
            (kn) =>
              kn.appliesToKanji.includes("*") ||
              kn.appliesToKanji.includes(k.text)
          )
          .map((kn, i) => (
            <span
              key={i}
              className={`${getFontSizeClass(setting.fontSize, "medium")} ${
                k.common
                  ? kn.common
                    ? "text-emerald-600 font-semibold"
                    : "text-slate-300"
                  : "text-slate-300"
              }`}
            >
              {kn.text}
            </span>
          ))}
      </div>
    ))
  ) : (
    // Không có kanji -> render danh sách kana
    <div className="flex flex-wrap gap-x-20">
      {vocab.kana.map((kn, i) => (
        <span
          key={i}
          className={`${getFontSizeClass(setting.fontSize, "large")} ${
            kn.common
              ? "text-emerald-600 font-bold"
              : "text-slate-600"
          }`}
        >
          {kn.text}
        </span>
      ))}
    </div>
  )}
</section>

{/* Section hiển thị nghĩa */}
<section
  className={`mt-2 w-full flex flex-wrap gap-3 ${getFontSizeClass(
    setting.fontSize,
    "medium"
  )}`}
>
  {vocab.sense.map((sense, sIdx) => (
    <div
      key={sIdx}
      className={`flex flex-col border rounded-2xl bg-white shadow-md p-3 ${
        vocab.sense.length === 1
          ? "w-full" // chỉ có 1 sense -> full width
          : "w-[calc(50%-0.75rem)]" // >= 2 sense -> chia đôi
      }`}
    >

      {/* Thông tin nhỏ: Part of Speech, Field, Dialect, Misc, Info */}
      <div className="flex flex-wrap items-center gap-2 text-gray-600">
        {/* Part of Speech */}
        {sense.partOfSpeech?.length > 0 && (
          <div className="flex items-center gap-1">
            <span className={`${getFontSizeClass(setting.fontSize, "medium")} font-medium`}>
              Part of speech:
            </span>
            <span
              className={`px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 ${getFontSizeClass(
                setting.fontSize,
                "small"
              )}`}
            >
              {sense.partOfSpeech.join(", ")}
            </span>
          </div>
        )}

        {/* Field */}
        {sense.field?.length > 0 && (
          <div className="flex items-center gap-1">
            <span className={`${getFontSizeClass(setting.fontSize, "medium")} font-medium`}>
              Field:
            </span>
            <span
              className={`px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 ${getFontSizeClass(
                setting.fontSize,
                "small"
              )}`}
            >
              {sense.field.join(", ")}
            </span>
          </div>
        )}

        {/* Dialect */}
        {sense.dialect?.length > 0 && (
          <div className="flex items-center gap-1">
            <span className={`${getFontSizeClass(setting.fontSize, "medium")} font-medium`}>
              Dialect:
            </span>
            <span
              className={`px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 ${getFontSizeClass(
                setting.fontSize,
                "small"
              )}`}
            >
              {sense.dialect.join(", ")}
            </span>
          </div>
        )}

        {/* Misc */}
        {sense.misc?.length > 0 && (
          <div className="flex items-center gap-1">
            <span className={`${getFontSizeClass(setting.fontSize, "medium")} font-medium`}>
              Additional notes:
            </span>
            <span
              className={`px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 ${getFontSizeClass(
                setting.fontSize,
                "small"
              )}`}
            >
              {sense.misc.join(", ")}
            </span>
          </div>
        )}

        {/* Info */}
        {sense.info?.length > 0 && (
          <div className="flex items-center gap-1">
            <span className={`${getFontSizeClass(setting.fontSize, "medium")} font-medium`}>
              Extra information:
            </span>
            <span
              className={`px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 italic ${getFontSizeClass(
                setting.fontSize,
                "small"
              )}`}
            >
              {sense.info.join(" / ")}
            </span>
          </div>
        )}
      </div>

      {/* Danh sách nghĩa */}
      <p className={`text-emerald-600 font-bold font-semibold leading-snug ${getFontSizeClass(setting.fontSize, "medium")}`}>
        {sense.gloss.map((g) => g.text).join(" ・ ")}
      </p>

      {/* Related & Antonym */}
      <div className="flex flex-wrap items-center gap-2">
        {sense.related?.length > 0 && (
          <div className="flex items-center gap-1">
            <span
              className={`text-gray-600 font-medium flex items-center gap-1 ${getFontSizeClass(
                setting.fontSize,
                "medium"
              )}`}
            >
              <Link size={14} /> Related:
            </span>
            <span
              className={`px-2 py-0.5 rounded-full bg-pink-50 border border-pink-200 text-pink-600 ${getFontSizeClass(
                setting.fontSize,
                "small"
              )}`}
            >
              {sense.related.join(", ")}
            </span>
          </div>
        )}

        {sense.antonym?.length > 0 && (
          <div className="flex items-center gap-1">
            <span
              className={`text-gray-600 font-medium flex items-center gap-1 ${getFontSizeClass(
                setting.fontSize,
                "medium"
              )}`}
            >
              <Ban size={14} /> Antonym:
            </span>
            <span
              className={`px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 ${getFontSizeClass(
                setting.fontSize,
                "small"
              )}`}
            >
              {sense.antonym.join(", ")}
            </span>
          </div>
        )}
      </div>
    </div>
  ))}
</section>

<Example examples={vocab.examples} setting={setting} />






            </section>
        </div>
    </div>
  );
}
