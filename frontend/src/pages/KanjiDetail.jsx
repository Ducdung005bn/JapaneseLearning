import { useState } from "react";
import axios from "axios";
import KanjiDrawing from "./KanjiDrawing.jsx";
import ReadingSection from "./ReadingSection.jsx";
import { getFontSizeClass } from "./SettingMenu.jsx";
import HanVietSection from "./HanVietSection.jsx";
import RadicalOf from "./RadicalOf.jsx";

export default function KanjiDetail({ selectedKanji, setSelectedKanji, setting }) {
  const [openOn, setOpenOn] = useState(false);
  const [openKun, setOpenKun] = useState(false);
  const [openOtherReading, setOpenOtherReading] = useState(false);
  const [vocabularyList, setVocabularyList] = useState({ on_words: [], kun_words: [] });

  if (!selectedKanji) return null;

  const handleFindVocabulary = async () => {
    console.log('Finding vocabulary for', selectedKanji.kanji);
    if ((vocabularyList.on_words.length > 0) || (vocabularyList.kun_words.length > 0)) return;

    try {
      const body = {
        kanji: selectedKanji.kanji || undefined,
        on_readings: selectedKanji.on_readings || undefined,
        kun_readings: selectedKanji.kun_readings || undefined,
      };
      const res = await axios.post("http://localhost:3000/vocabulary/findVocabulary", body);
      setVocabularyList(res.data);
    } catch (err) {
      
    } 
  };

  return (
  <div className="flex gap-3">
    <section className="flex flex-col gap-3 w-2/3 mx-auto p-4 rounded-2xl bg-white/50 backdrop-blur-md shadow-lg">
        <button
            onClick={() => setSelectedKanji(null)}
            className={`${getFontSizeClass(setting.fontSize, "medium")} px-3 py-1 max-w-[70px] rounded-lg bg-red-300 text-white hover:bg-red-600`}
          >
            Back
        </button>
        
        <div className={`${getFontSizeClass(setting.fontSize, "medium")} flex flex-wrap gap-x-20 gap-y-1`}>
          {selectedKanji.jlpt && (
            <p className={`${getFontSizeClass(setting.fontSize, "medium")}`}>
              JLPT: <span className="font-bold">N{selectedKanji.jlpt}</span>
            </p>
          )}

          {selectedKanji.grade && (
            <p className={`${getFontSizeClass(setting.fontSize, "medium")}`}>
              Grade: <span className="font-bold">{selectedKanji.grade}</span>
            </p>
          )}

          {selectedKanji.strokes && (
            <p className={`${getFontSizeClass(setting.fontSize, "medium")}`}>
              Strokes: <span className="font-bold">{selectedKanji.strokes}</span>
            </p>
          )}

          {selectedKanji.heisig_en && (
            <p className={`${getFontSizeClass(setting.fontSize, "medium")}`}>
              Heisig: <span className="font-bold">{selectedKanji.heisig_en}</span>
            </p>
          )}

          {selectedKanji.english_meanings && selectedKanji.english_meanings.length > 0 && (
            <p className={`${getFontSizeClass(setting.fontSize, "medium")}`}>
              English meaning: <span className="font-bold">{selectedKanji.english_meanings.join(" ・ ")}</span> 
            </p>
          )}

          {selectedKanji.six_principles && (
            <p className={`${getFontSizeClass(setting.fontSize, "medium")}`}>
              Principle: <span className="font-bold">{selectedKanji.six_principles}</span> 
            </p>
          )}
        </div>

          <ReadingSection
            title="ON YOMI"
            readings={selectedKanji.on_readings}
            words={vocabularyList.on_words}
            open={openOn}
            setOpen={setOpenOn}
            onToggle={handleFindVocabulary}
            setting={setting}
          />

          <ReadingSection
            title="KUN YOMI"
            readings={selectedKanji.kun_readings}
            words={vocabularyList.kun_words}
            open={openKun}
            setOpen={setOpenKun}
            onToggle={handleFindVocabulary}
            setting={setting}
          />

          <ReadingSection
            title="OTHER READING"
            readings={[""]}
            words={vocabularyList.the_other_words}
            open={openOtherReading}
            setOpen={setOpenOtherReading}
            onToggle={handleFindVocabulary}
            setting={setting}
          />

          {/* Cách đọc tên */}
          {selectedKanji.name_readings && selectedKanji.name_readings.length > 0 && (
            <div className="border p-2 rounded-lg bg-white shadow">
              <div 
                className="flex justify-between items-center"
              >
                <span className={`font-semibold ${getFontSizeClass(setting.fontSize, "medium")}`}>
                    <span className="text-red-400">NAME READING</span> {selectedKanji.name_readings.join(" ・ ")}
                </span>
              </div>
              </div>)
          }

          <HanVietSection selectedKanji={selectedKanji} setting={setting}/>

          <RadicalOf selectedKanji={selectedKanji} setting={setting}/>


    </section>
    
    <KanjiDrawing selectedKanji={selectedKanji} setting={setting}/>
  </div>
  );
}
