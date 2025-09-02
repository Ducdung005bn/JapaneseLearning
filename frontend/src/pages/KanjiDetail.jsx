import { useEffect, useRef, useState } from "react";
import KanjiDrawing from "./KanjiDrawing.jsx";

export default function KanjiDetail({ selectedKanji, setSelectedKanji }) {
  const [showAllMeanings, setShowAllMeanings] = useState(false);
  const [compounds, setCompounds] = useState([]);
  const [showCompounds, setShowCompounds] = useState(false);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!selectedKanji?.d || !svgRef.current) return;
    const svg = svgRef.current;
    const paths = svg.querySelectorAll("path");

    paths.forEach((path, index) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;

      path.animate(
        [
          { strokeDashoffset: length },
          { strokeDashoffset: 0 }
        ],
        {
          duration: 500,
          fill: "forwards",
          easing: "ease-in-out",
          delay: (index + 1) * 500
        }
      );
    });
  }, [selectedKanji]);

  const handleLoadCompounds = async () => {
    if (compounds.length > 0) {
      setShowCompounds(!showCompounds);
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/kanji/${selectedKanji.kanji}/compounds`);
      const data = await res.json();
      setCompounds(data);
      setShowCompounds(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (!selectedKanji) return null;

  return (
  <div>
    <div className="flex gap-2">
      <section class="w-2/3 mx-auto p-4 rounded-2xl bg-white/50 backdrop-blur-md shadow-lg">
          <button
              onClick={() => setSelectedKanji(null)}
              className="px-3 py-1 rounded-lg bg-red-300 text-white hover:bg-red-600"
            >
              Back
          </button>
      </section>
      
      <KanjiDrawing selectedKanji={selectedKanji} />
    </div>


    <section className="w-full mx-auto p-4 rounded-2xl bg-white/50 backdrop-blur-md shadow-lg">
      {/* --- Top Section: 2 Columns --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left Column: Info */}
        <div className="flex flex-col gap-2 text-slate-800">
          <h2 className="text-5xl font-bold">{selectedKanji.kanji}</h2>
          <p><strong>JLPT:</strong> {selectedKanji.jlpt ?? "N/A"}</p>
          <p><strong>Grade:</strong> {selectedKanji.grade}</p>
          <p><strong>Strokes:</strong> {selectedKanji.strokes}</p>
          <p><strong>Heisig:</strong> {selectedKanji.heisig_en}</p>
          <p>
            <strong>English meanings:</strong>{" "}
            {selectedKanji.english_meanings.join(", ")}
          </p>
        </div>

        {/* Right Column: SVG Animation */}
        <div className="flex justify-center items-center">
          <svg
            ref={svgRef}
            viewBox="0 0 109 109"
            className="w-48 h-48 text-black"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {selectedKanji.d.map((pathData, idx) => (
              <path key={idx} d={pathData} />
            ))}
          </svg>
        </div>
      </div>

      {/* --- Han Viet & Meanings --- */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Hán Việt</h3>
        <ul className="list-disc pl-6">
          {selectedKanji.han_viet.map((h, idx) => (
            <li key={idx}>
              <span className="font-bold">{h.reading}</span>
              {h.common_meanings?.length > 0 && (
                <span> - {h.common_meanings.join(", ")}</span>
              )}
              {showAllMeanings && (
                <div className="pl-4 text-sm text-slate-700">
                  {h.cited_meanings?.length > 0 && (
                    <p><strong>Cited:</strong> {h.cited_meanings.join(", ")}</p>
                  )}
                  {h.thieu_chuu_meanings?.length > 0 && (
                    <p><strong>Thiều Chửu:</strong> {h.thieu_chuu_meanings.join(", ")}</p>
                  )}
                  {h.tran_van_chanh_meanings?.length > 0 && (
                    <p><strong>Trần Văn Chánh:</strong> {h.tran_van_chanh_meanings.join(", ")}</p>
                  )}
                  {h.nguyen_quoc_hung_meanings?.length > 0 && (
                    <p><strong>Nguyễn Quốc Hùng:</strong> {h.nguyen_quoc_hung_meanings.join(", ")}</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
        <button
          className="mt-2 px-3 py-1 text-sm bg-emerald-500 text-white rounded hover:bg-emerald-600"
          onClick={() => setShowAllMeanings(!showAllMeanings)}
        >
          {showAllMeanings ? "Ẩn bớt" : "Xem thêm nghĩa"}
        </button>
      </div>

      {/* --- Readings --- */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Đọc âm</h3>
        <p><strong>On:</strong> {selectedKanji.on_readings.join(", ")}</p>
        <p><strong>Kun:</strong> {selectedKanji.kun_readings.join(", ")}</p>
        <p><strong>Name:</strong> {selectedKanji.name_readings.join(", ")}</p>
      </div>

      {/* --- Compounds --- */}
      <div>
        <button
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleLoadCompounds}
        >
          {showCompounds ? "Ẩn từ ghép" : "Xem từ ghép"}
        </button>
        {showCompounds && (
          <ul className="list-disc pl-6 mt-2">
            {compounds.length === 0 ? (
              <li>Không có dữ liệu</li>
            ) : (
              compounds.map((c, idx) => (
                <li key={idx}>{c}</li>
              ))
            )}
          </ul>
        )}
      </div>
    </section>
  </div>
  );
}
