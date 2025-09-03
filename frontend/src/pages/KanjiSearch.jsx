import { useState } from "react";
import axios from "axios";
import KanjiDetail from "./KanjiDetail.jsx";

export default function KanjiSearch() {
  const [kanjiInput, setKanjiInput] = useState("");
  const [hanVietInput, setHanVietInput] = useState("");
  const [radicalInput, setRadicalInput] = useState("");
  const [onYomiInput, setOnYomiInput] = useState("");
  const [kunYomiInput, setKunYomiInput] = useState("");
  const [kanjiList, setKanjiList] = useState([]);
  const [selectedKanji, setSelectedKanji] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleKanjiInputChange = (e) => {
    setKanjiInput(e.target.value);
    if (e.target.value) {
      setHanVietInput("");
      setRadicalInput("");
      setOnYomiInput("");
      setKunYomiInput("");
    }
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    if (e.target.value) {
      setKanjiInput("");
    }
  };

  // Tìm theo ký tự Kanji
  const handleSearchKanji = async () => {
    if (!kanjiInput?.trim()) {
      return; 
    }

    setHanVietInput(""); setRadicalInput(""); setOnYomiInput(""); setKunYomiInput("");

    setLoading(true);
    setSelectedKanji(null);

    try {
      const res = await axios.get("http://localhost:3000/kanji/" + kanjiInput);
      setKanjiList([res.data]);
    } catch (err) {
      console.error(err);
      setKanjiList([]);
    } finally {
      setLoading(false);
    }

  };

  // Tìm theo bộ lọc
  const handleFilterKanji = async () => {
    if (!hanVietInput?.trim() && !radicalInput?.trim() && !onYomiInput?.trim() && !kunYomiInput?.trim()) {
      return;
    }

    setLoading(true);
    setSelectedKanji(null);

    try {
      const params = {
        han_viet: hanVietInput || undefined,
        children: radicalInput || undefined,
        on_readings: onYomiInput || undefined,
        kun_readings: kunYomiInput || undefined,
      };
      const res = await axios.get("http://localhost:3000/kanji/filter", { params });
      setKanjiList(res.data);
    } catch (err) {
      console.error(err);
      setKanjiList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-4 w-full max-w-6xl mx-auto"> 
      {/* Form tìm kiếm */}
      <section className="w-full mx-auto p-1 rounded-2xl bg-white/50 backdrop-blur-md shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] gap-1">
          <input
            type="text"
            placeholder="KANJI"
            value={kanjiInput}
            onChange={handleKanjiInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchKanji();
              }
            }}
            className="w-full h-full px-4 py-3 rounded-xl border border-emerald-400
                       bg-transparent text-3xl font-bold text-center text-slate-800 
                       focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-2 gap-1">
              <input type="text" placeholder="HAN VIET / HEISIG"
                value={hanVietInput}
                onChange={handleFilterChange(setHanVietInput)}
                onKeyDown={(e) => e.key === "Enter" && handleFilterKanji()}
                className="px-3 py-2 rounded-lg border border-black-500 text-xl text-slate-800"
              />
              <input type="text" placeholder="RADICAL"
                value={radicalInput}
                onChange={handleFilterChange(setRadicalInput)}
                onKeyDown={(e) => e.key === "Enter" && handleFilterKanji()}
                className="px-3 py-2 rounded-lg border border-black-500 text-xl text-slate-800"
              />
              <input type="text" placeholder="ON YOMI"
                value={onYomiInput}
                onChange={handleFilterChange(setOnYomiInput)}
                onKeyDown={(e) => e.key === "Enter" && handleFilterKanji()}
                className="px-3 py-2 rounded-lg border border-black-500 text-xl text-slate-800"
              />
              <input type="text" placeholder="KUN YOMI"
                value={kunYomiInput}
                onChange={handleFilterChange(setKunYomiInput)}
                onKeyDown={(e) => e.key === "Enter" && handleFilterKanji()}
                className="px-3 py-2 rounded-lg border border-black-500 text-xl text-slate-800"
              />
            </div>
          </div>
        </div>
      </section>

      {selectedKanji ? (
        /* Hiển thị chi tiết nếu đã chọn Kanji */
        <KanjiDetail selectedKanji={selectedKanji} setSelectedKanji={setSelectedKanji} />
      ) : (
        /* Hiển thị danh sách khi chưa chọn Kanji */
        <section className="w-full mx-auto flex flex-col gap-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-emerald-600 font-semibold">Loading...</p>
            </div>
          ) : kanjiList.length === 0 ? (
            <p className="text-xl text-center text-slate-600 py-6">No results found</p>
          ) : (
            kanjiList.map((k, idx) => (
              <div
                key={idx}
                className="w-full grid grid-cols-5 gap-2 px-4 py-2 rounded-2xl bg-white/50 
                          backdrop-blur-md shadow-md hover:bg-emerald-100 cursor-pointer transition"
                onClick={() => setSelectedKanji(k)}
              >
                <div className="col-span-1 flex items-center justify-center font-bold text-3xl">
                  {k.kanji}
                </div>
                <div className="col-span-1 flex items-center justify-center text-xl">
                  {k.han_viet.map(h => h.reading).join(" ・ ").toUpperCase()}
                </div>
                <div className="col-span-1 flex items-center justify-center text-xl">
                  {k.heisig_en}
                </div>
                <div className="col-span-1 flex items-center justify-center text-xl">
                  {k.on_readings.join(" ・ ")}
                </div>
                <div className="col-span-1 flex items-center justify-center text-xl">
                  {k.kun_readings.join(" ・ ")}
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}
