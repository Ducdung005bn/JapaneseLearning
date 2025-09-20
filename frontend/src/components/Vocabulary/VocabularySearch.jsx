// src/components/Vocabulary/VocabularySearch.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFontSizeClass } from "../Other/SettingMenu.jsx";

export default function VocabularySearch({ setting }) {
  const [meaningInput, setMeaningInput] = useState("");
  const [writingInput, setWritingInput] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    if (e.key === "Enter") {
      let query = "/vocabulary";
      const params = [];
      if (meaningInput) params.push(`meaning=${encodeURIComponent(meaningInput)}`);
      if (writingInput) params.push(`writing=${encodeURIComponent(writingInput)}`);
      if (params.length) query += "?" + params.join("&");
      navigate(query);
    }
  };

  return (
    <section className="w-full mx-auto p-1 rounded-2xl bg-white/50 backdrop-blur-md shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        <input
          type="text"
          placeholder="Writing"
          value={writingInput}
          onChange={e => setWritingInput(e.target.value)}
          onKeyDown={handleSubmit}
          className={`w-full h-full px-4 py-3 rounded-xl border border-emerald-400
                     bg-transparent ${getFontSizeClass(setting.fontSize, "medium")} text-slate-800 
                     focus:outline-none focus:ring-2 focus:ring-green-400`}
        />
        <input
          type="text"
          placeholder="Meaning"
          value={meaningInput}
          onChange={e => setMeaningInput(e.target.value)}
          onKeyDown={handleSubmit}
          className={`w-full h-full px-4 py-3 rounded-xl border border-emerald-400
                     bg-transparent ${getFontSizeClass(setting.fontSize, "medium")} text-slate-800 
                     focus:outline-none focus:ring-2 focus:ring-green-400`}
        />
      </div>
    </section>
  );
}
