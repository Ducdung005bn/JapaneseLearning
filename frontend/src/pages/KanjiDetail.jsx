import { useState } from "react";
import axios from "axios";
import KanjiDrawing from "./KanjiDrawing.jsx";

export default function KanjiDetail({ selectedKanji, setSelectedKanji }) {
  const [openOn, setOpenOn] = useState(false);
  const [openKun, setOpenKun] = useState(false);
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
  <div className="flex gap-2">
    <section className="flex flex-col gap-2 w-2/3 mx-auto p-4 rounded-2xl bg-white/50 backdrop-blur-md shadow-lg">
        <button
            onClick={() => setSelectedKanji(null)}
            className="text-xl px-3 py-1 max-w-[70px] rounded-lg bg-red-300 text-white hover:bg-red-600"
          >
            Back
        </button>
        
        <div className="text-xl flex flex-wrap gap-x-8 gap-y-2">
          {selectedKanji.jlpt && (
            <p className="text-xl">
              JLPT: <span className="font-bold">N{selectedKanji.jlpt}</span>
            </p>
          )}

          {selectedKanji.grade && (
            <p className="text-xl">
              Grade: <span className="font-bold">{selectedKanji.grade}</span>
            </p>
          )}

          {selectedKanji.strokes && (
            <p className="text-xl">
              Strokes: <span className="font-bold">{selectedKanji.strokes}</span>
            </p>
          )}

          {selectedKanji.heisig_en && (
            <p className="text-xl">
              Heisig: <span className="font-bold">{selectedKanji.heisig_en}</span>
            </p>
          )}

          {selectedKanji.english_meanings && selectedKanji.english_meanings.length > 0 && (
            <p className="text-xl">
              English meaning: <span className="font-bold">{selectedKanji.english_meanings.join(" ・ ")}</span> 
            </p>
          )}

          {selectedKanji.six_principles && (
            <p className="text-xl">
              Principle: <span className="font-bold">{selectedKanji.six_principles}</span> 
            </p>
          )}
        </div>

    <div className="space-y-4">
      {/* Âm On */}
      <div className="border p-3 rounded-lg bg-white shadow">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => {setOpenOn(!openOn); handleFindVocabulary();}}
        >
          <span className="font-semibold text-lg">ON YOMI: {selectedKanji.on_readings.join(", ")}</span>
          <span className="text-xl transform transition-transform duration-200"
                style={{ rotate: openOn ? '90deg' : '0deg' }}>▶</span>
        </div>

        {openOn && vocabularyList.on_words?.length > 0 && (
          <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
            {vocabularyList.on_words.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Âm Kun */}
      <div className="border p-3 rounded-lg bg-white shadow">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => {
            setOpenKun(!openKun); handleFindVocabulary();}}
        >
          <span className="font-semibold text-lg">KUN YOMI: {selectedKanji.kun_readings.join(", ")}</span>
          <span className="text-xl transform transition-transform duration-200"
                style={{ rotate: openKun ? '90deg' : '0deg' }}>▶</span>
        </div>

        {openKun && vocabularyList.kun_words?.length > 0 && (
          <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
            {vocabularyList.kun_words.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        )}
      </div>
    </div>






        
    </section>
    
    <KanjiDrawing selectedKanji={selectedKanji} />
  </div>
  );
}
