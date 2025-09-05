import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFontSizeClass } from "../Other/SettingMenu";

export default function KanjiSearch({ setting }) {
  const [kanjiInput, setKanjiInput] = useState("");
  const [hanVietInput, setHanVietInput] = useState("");
  const [radicalInput, setRadicalInput] = useState("");
  const [onYomiInput, setOnYomiInput] = useState("");
  const [kunYomiInput, setKunYomiInput] = useState("");

  const navigate = useNavigate();

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
    if (e.target.value) setKanjiInput("");
  };

  const handleSubmit = (e) => {
    if (e.key === "Enter") {
        // ưu tiên kanjiInput
        let query = "/kanji";
        const params = [];
        if (kanjiInput) params.push(`kanji=${encodeURIComponent(kanjiInput)}`);
        if (hanVietInput) params.push(`han_viet=${encodeURIComponent(hanVietInput)}`);
        if (radicalInput) params.push(`children=${encodeURIComponent(radicalInput)}`);
        if (onYomiInput) params.push(`on_readings=${encodeURIComponent(onYomiInput)}`);
        if (kunYomiInput) params.push(`kun_readings=${encodeURIComponent(kunYomiInput)}`);
        if (params.length) query += "?" + params.join("&");
        navigate(query);

    }
  };

  return (
    <section className="w-full mx-auto p-1 rounded-2xl bg-white/50 backdrop-blur-md shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] gap-1">
        <input
          type="text"
          placeholder="KANJI"
          value={kanjiInput}
          onChange={handleKanjiInputChange}
          onKeyDown={handleSubmit}
          className={`w-full h-full px-4 py-3 rounded-xl border border-emerald-400
                     bg-transparent ${getFontSizeClass(setting.fontSize, "large")} font-bold text-center text-slate-800 
                     focus:outline-none focus:ring-2 focus:ring-green-400`}
        />
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-2 gap-1">
            <input
              type="text"
              placeholder="HAN VIET / HEISIG"
              value={hanVietInput}
              onChange={handleFilterChange(setHanVietInput)}
              onKeyDown={handleSubmit}
              className={`px-3 py-2 rounded-lg border border-black-500 ${getFontSizeClass(setting.fontSize, "medium")} text-slate-800`}
            />
            <input
              type="text"
              placeholder="RADICAL"
              value={radicalInput}
              onChange={handleFilterChange(setRadicalInput)}
              onKeyDown={handleSubmit}
              className={`px-3 py-2 rounded-lg border border-black-500 ${getFontSizeClass(setting.fontSize, "medium")} text-slate-800`}
            />
            <input
              type="text"
              placeholder="ON YOMI"
              value={onYomiInput}
              onChange={handleFilterChange(setOnYomiInput)}
              onKeyDown={handleSubmit}
              className={`px-3 py-2 rounded-lg border border-black-500 ${getFontSizeClass(setting.fontSize, "medium")} text-slate-800`}
            />
            <input
              type="text"
              placeholder="KUN YOMI"
              value={kunYomiInput}
              onChange={handleFilterChange(setKunYomiInput)}
              onKeyDown={handleSubmit}
              className={`px-3 py-2 rounded-lg border border-black-500 ${getFontSizeClass(setting.fontSize, "medium")} text-slate-800`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
