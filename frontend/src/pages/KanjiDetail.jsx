import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import KanjiSearch from "../components/Kanji/KanjiSearch.jsx";
import KanjiDrawing from "../components/KanjiDetail/KanjiDrawing.jsx";
import ReadingSection from "../components/KanjiDetail/ReadingSection.jsx";
import { getFontSizeClass } from "../components/Other/SettingMenu.jsx";
import HanVietSection from "../components/KanjiDetail/HanVietSection.jsx";
import RadicalSection from "../components/KanjiDetail/RadicalSection.jsx";
import HelpModal from "../components/Other/HelpModal.jsx";
import TreeSection from "../components/KanjiDetail/TreeSection.jsx";
export default function KanjiDetail({ setting }) {
  const [loading, setLoading] = useState(true);
  const [openOn, setOpenOn] = useState(false);
  const [openKun, setOpenKun] = useState(false);
  const [openOtherReading, setOpenOtherReading] = useState(false);
  
  const [kanji, setKanji] = useState({});
  const [vocabularyList, setVocabularyList] = useState({ on_words: [], kun_words: [], the_other_words: [] });
  const [radicalKanji, setRadicalKanji] = useState({});

  const { character } = useParams();

  useEffect(() => {
    const fetchKanji = async () => {
      console.log("Get kanji detail for", character);

      try {
        const res = await axios.get("http://localhost:3000/kanji/" + character);
        setKanji(res.data.kanji);
        setVocabularyList(res.data.kanji_words);
        setRadicalKanji(res.data.radicalKanjis);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchKanji();
  }, [character]);

  if (loading) {
    return;
  }


  return (
<div className="flex flex-col gap-y-3 w-full mx-auto">
  <KanjiSearch setting={setting} />
  <div className="flex gap-3">
    <section className="flex flex-col gap-3 w-2/3 p-4 rounded-2xl bg-white/50 backdrop-blur-md shadow-lg">
      <span className="flex gap-10">
          <button
              // onClick={() => setSelectedKanji(null)}
              className={`${getFontSizeClass(setting.fontSize, "medium")} px-3 py-1 max-w-[70px] rounded-lg bg-red-300 text-white hover:bg-red-600`}
            >
              Back
          </button>
          <p className={`${getFontSizeClass(setting.fontSize, "large")}`}>
            <span className="font-bold">{kanji.kanji}</span>
          </p>
      </span>
        
      <div className={`${getFontSizeClass(setting.fontSize, "medium")} flex flex-wrap gap-x-20 gap-y-1`}>
        {kanji.jlpt && (
          <p className={`${getFontSizeClass(setting.fontSize, "medium")}`}>
            JLPT: <span className="font-bold">N{kanji.jlpt}</span>
          </p>
        )}

        {kanji.grade && (
          <p className={`${getFontSizeClass(setting.fontSize, "medium")}`}>
            Grade: <span className="font-bold">{kanji.grade}</span>
          </p>
        )}

        {kanji.strokes && (
          <p className={`${getFontSizeClass(setting.fontSize, "medium")}`}>
            Strokes: <span className="font-bold">{kanji.strokes}</span>
          </p>
        )}

        {kanji.heisig_en && (
        <p className={`${getFontSizeClass(setting.fontSize, "medium")} flex items-center gap-1`}>
          <HelpModal title="heisig" setting={setting} />
          Heisig: <span className="font-bold">{kanji.heisig_en}</span>
        </p>
        )}


        {kanji.english_meanings && kanji.english_meanings.length > 0 && (
          <p className={`${getFontSizeClass(setting.fontSize, "medium")}`}>
            English meaning: <span className="font-bold">{kanji.english_meanings.join(" ・ ")}</span> 
          </p>
        )}

        {kanji.six_principles && (

          <p className={`${getFontSizeClass(setting.fontSize, "medium")} flex items-center gap-1`}>
            <HelpModal title="principle" setting={setting}/>
            Principle: <span className="font-bold">{kanji.six_principles}</span>
          </p>
        )}
      </div>

      <ReadingSection
        title="ON READING"
        readings={kanji.on_readings}
        words={vocabularyList.on_words}
        open={openOn}
        setOpen={setOpenOn}
        setting={setting}
      />

      <ReadingSection
        title="KUN READING"
        readings={kanji.kun_readings}
        words={vocabularyList.kun_words}
        open={openKun}
        setOpen={setOpenKun}
        setting={setting}
      />

      <ReadingSection
        title="OTHER READING"
        readings={[""]}
        words={vocabularyList.the_other_words}
        open={openOtherReading}
        setOpen={setOpenOtherReading}
        setting={setting}
      />

      {/* Cách đọc tên */}
      {kanji.name_readings && kanji.name_readings.length > 0 && (
        <div className="border p-2 rounded-lg bg-white shadow">
          <div 
            className="flex justify-between items-center"
          >
            <span className={`font-semibold ${getFontSizeClass(setting.fontSize, "medium")}`}>
                <span className="text-red-400">NAME READING</span> {kanji.name_readings.join(" ・ ")}
            </span>
          </div>
          </div>)
      }

      <RadicalSection radicalKanji={radicalKanji} setting={setting}/>

      <HanVietSection hanViet={kanji.han_viet} setting={setting}/>

    </section>

    <div className="w-1/3">
        <KanjiDrawing d={kanji.d} setting={setting} />
        
        <p className={`${getFontSizeClass(setting.fontSize, "medium")} mb-4 mt-8 font-bold text-gray-700 text-center`}>CASCADING KANJI VIEW</p>
        <div className="rounded-2xl bg-white/50 backdrop-blur-md shadow-lg">
          <TreeSection nodes={kanji.children} setting={setting} />  
        </div>
          
    </div>

  </div>
</div>
  );
}
