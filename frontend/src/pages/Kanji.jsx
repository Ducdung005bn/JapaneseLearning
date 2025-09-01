import { useState } from "react";
import axios from "axios";

export default function KanjiSearch() {
  const [kanjiInput, setKanjiInput] = useState("");
  const [hanVietInput, setHanVietInput] = useState("");
  const [radicalInput, setRadicalInput] = useState("");
  const [onYomiInput, setOnYomiInput] = useState("");
  const [kunYomiInput, setKunYomiInput] = useState("");
  const [kanjiList, setKanjiList] = useState([]);
  const [selectedKanji, setSelectedKanji] = useState(null);

  const handleKanjiInputChange = (e) => {
    setKanjiInput(e.target.value);
    if (e.target.value) {
      // Clear filters
      setHanVietInput("");
      setRadicalInput("");
      setOnYomiInput("");
      setKunYomiInput("");
    }
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    if (e.target.value) {
      // Clear Kanji input
      setKanjiInput("");
    }
  };

  const handleSearchKanji = async () => {
    try {
      const res = await axios.get("http://localhost:3000/kanji/" + kanjiInput);
      console.log(res.data);
      setKanjiList([res.data]);
    } catch (err) {
      console.error(err);
      setKanjiList([]);
    } 
  };

  const handleFilterKanji = async () => {
    
    try {
      const params = {
        han_viet: hanVietInput || undefined,
        children: radicalInput || undefined,
        on_readings: onYomiInput || undefined,
        kun_readings: kunYomiInput || undefined,
      };
      const res = await axios.get("http://localhost:3000/kanji/filter", { params });
      console.log(res.data);
      setKanjiList(res.data);
    } catch (err) {
      console.error(err);
      setKanjiList([]);
    } 
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Search section */}
      <section className="w-full max-w-5xl mx-auto p-4 rounded-2xl bg-white/50 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] gap-3">
          {/* Column 1: Kanji input */}
          <input
            type="text"
            placeholder="KANJI"
            value={kanjiInput}
            onChange={(e) => handleKanjiInputChange(e)}
            onKeyDown={(e) => {if (e.key === "Enter") handleSearchKanji();}}

            className="w-full h-full px-4 py-3 rounded-xl border border-emerald-400
                       bg-transparent text-3xl font-bold tracking-wide text-center
                       text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {/* Column 2: Advanced search */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="HAN VIET / HEISIG"
                value={hanVietInput}
                onChange={(e) => handleFilterChange(setHanVietInput)(e)}
                onKeyDown={(e) => {if (e.key === "Enter") handleFilterKanji();}}
                className="px-3 py-2 rounded-lg border border-slate-300
                           bg-transparent text-sm font-semibold tracking-wide
                           text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <input
                type="text"
                placeholder="RADICAL"
                value={radicalInput}
                onChange={(e) => handleFilterChange(setRadicalInput)(e)}
                onKeyDown={(e) => {if (e.key === "Enter") handleFilterKanji();}}
                className="px-3 py-2 rounded-lg border border-slate-300
                           bg-transparent text-sm font-semibold tracking-wide
                           text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <input
                type="text"
                placeholder="ON YOMI"
                value={onYomiInput}
                onChange={(e) => handleFilterChange(setOnYomiInput)(e)}
                onKeyDown={(e) => {if (e.key === "Enter") handleFilterKanji();}}
                className="px-3 py-2 rounded-lg border border-slate-300
                           bg-transparent text-sm font-semibold tracking-wide
                           text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <input
                type="text"
                placeholder="KUN YOMI"
                value={kunYomiInput}
                onChange={(e) => handleFilterChange(setKunYomiInput)(e)}
                onKeyDown={(e) => {if (e.key === "Enter") handleFilterKanji();}}
                className="px-3 py-2 rounded-lg border border-slate-300
                           bg-transparent text-sm font-semibold tracking-wide
                           text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Results section */}
      <section className="w-full max-w-5xl mx-auto mt-2 flex flex-col gap-2">
        {kanjiList.length === 0 ? (
          <p className="text-center text-slate-600 py-6">Không có kết quả</p>
        ) : (
          kanjiList.map((k, idx) => (
            <div
              key={idx}
              className="w-full grid grid-cols-5 gap-2 px-4 py-2 rounded-2xl bg-white/50 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md shadow-md hover:bg-emerald-100 cursor-pointer transition"

              onClick={() => setSelectedKanji(k)}
            >
              <div className="col-span-1 flex items-center justify-center font-bold text-3xl">
                {k.kanji}
              </div>
              <div className="col-span-1 flex items-center justify-center text-sm">
                {k.han_viet.map(h => Array.isArray(h.reading) ? h.reading.join(" ・ ") : h.reading).join(" ・ ").toUpperCase()}
              </div>
              <div className="col-span-1 flex items-center justify-center text-sm">
                {k.heisig_en}
              </div>
              <div className="col-span-1 flex items-center justify-center text-sm">
                {Array.isArray(k.on_readings) ? k.on_readings.join(" ・ ") : k.on_readings}
              </div>
              <div className="col-span-1 flex items-center justify-center text-sm">
                {Array.isArray(k.kun_readings) ? k.kun_readings.join(" ・ ") : k.kun_readings}
              </div>
            </div>
          ))
        )}
      </section>


      {/* Selected Kanji detail */}
      {selectedKanji && (
        <section className="w-full max-w-5xl mx-auto mt-2 rounded-2xl border border-slate-200 p-4">
          <h2 className="text-xl font-bold">{selectedKanji.kanji}</h2>
          <p>Han Viet: {selectedKanji.han_viet}</p>
          <p>Heisig: {selectedKanji.heisig}</p>
          <p>On Yomi: {Array.isArray(selectedKanji.on_readings) ? selectedKanji.on_readings.join(", ") : selectedKanji.on_readings}</p>
          <p>Kun Yomi: {Array.isArray(selectedKanji.kun_readings) ? selectedKanji.kun_readings.join(", ") : selectedKanji.kun_readings}</p>
          <p>(Chi tiết Kanji khác sẽ hiển thị ở đây sau)</p>
        </section>
      )}
    </div>
  );
}
