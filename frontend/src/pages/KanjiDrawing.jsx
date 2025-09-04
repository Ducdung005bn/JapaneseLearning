import { getFontSizeClass } from "./SettingMenu.jsx";
import { useRef, useState, useEffect } from "react";
import TreeSection from "./TreeSection";

export default function KanjiDrawing({ selectedKanji, setting }) {
  const [mode, setMode] = useState("animation"); // animation | draw
  const [strokeColor, setStrokeColor] = useState("black");
  const [resetKey, setResetKey] = useState(0);
  const svgRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [pathsDrawn, setPathsDrawn] = useState([]);

  const strokeColors = ["black", "red", "orange", "green", "blue", "violet", "gray"];

  // =================== Animation Mode ===================
  useEffect(() => {
    if (mode !== "animation") return;

    const svg = svgRef.current;
    if (!svg) return;

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
  }, [resetKey, mode]);

  // =================== Draw Mode ===================
  useEffect(() => {
    if (mode !== "draw") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 4;
    ctx.strokeStyle = strokeColor;
    ctxRef.current = ctx;
    setPathsDrawn([]);

    drawKanjiGuide(ctx, []);
  }, [mode, strokeColor, resetKey]);

  // Vẽ nét mờ Kanji + các nét người dùng
  const drawKanjiGuide = (ctx, userPaths) => {
    if (!ctx) ctx = ctxRef.current;
    if (!ctx) return;

    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const viewBoxSize = 109;

    // Vẽ nét mờ
    ctx.save();
    ctx.scale(canvasWidth / viewBoxSize, canvasHeight / viewBoxSize);
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 4 / (canvasWidth / viewBoxSize);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    selectedKanji.d.forEach((pathData) => {
      const path = new Path2D(pathData);
      ctx.stroke(path);
    });
    ctx.restore();

    // Vẽ nét người dùng
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4;
    userPaths.forEach((path) => {
      ctx.beginPath();
      path.forEach((point, idx) => {
        if (idx === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);

    setPathsDrawn((prev) => {
      const newPaths = [...prev, [{ x, y }]];
      drawKanjiGuide(ctxRef.current, newPaths);
      return newPaths;
    });

    canvasRef.current.isDrawing = true;
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current.isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();

    setPathsDrawn((prev) => {
      const copy = [...prev];
      copy[copy.length - 1].push({ x, y });
      drawKanjiGuide(ctxRef.current, copy);
      return copy;
    });
  };

  const handleMouseUp = () => {
    canvasRef.current.isDrawing = false;
  };

  const handleClear = () => {
    setPathsDrawn([]);
    drawKanjiGuide(ctxRef.current, []);
  };

  const handleUndo = () => {
    setPathsDrawn((prev) => {
      const copy = [...prev];
      copy.pop();
      drawKanjiGuide(ctxRef.current, copy);
      return copy;
    });
  };

  return (
    <section className="w-1/3 mx-auto p-4 max-w-[325px] rounded-2xl bg-white/50 backdrop-blur-md shadow-lg flex flex-col gap-4">
      
      {/* =================== Mode Selector =================== */}
      <div className="flex gap-2 justify-center mb-2">
        <button
          className={`${getFontSizeClass(setting.fontSize, "medium")} px-3 py-1 rounded-lg ${mode === "animation" ? "bg-blue-400 text-white" : "bg-gray-200"}`}
          onClick={() => setMode("animation")}
        >
          ANIMATION
        </button>
        <button
          className={`${getFontSizeClass(setting.fontSize, "medium")} px-3 py-1 rounded-lg ${mode === "draw" ? "bg-blue-400 text-white" : "bg-gray-200"}`}
          onClick={() => setMode("draw")}
        >
          DRAW
        </button>
      </div>

      {/* =================== Animation Mode =================== */}
      {mode === "animation" && (
        <>
          <svg
            key={resetKey}
            ref={svgRef}
            viewBox="0 0 109 109"
            fill="none"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {selectedKanji.d.map((pathData, idx) => (
              <path key={idx} d={pathData} />
            ))}
          </svg>

          <div className="flex gap-2">
            <button
              onClick={() => setResetKey((k) => k + 1)}
              className={`${getFontSizeClass(setting.fontSize, "medium")} px-3 py-1 rounded-lg bg-red-400 text-white hover:bg-red-500`}
            >
              RESET
            </button>

            <div>
              <select
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className={`${getFontSizeClass(setting.fontSize, "medium")} px-3 py-1 rounded-lg bg-white-500 text-black`}
              >
                {strokeColors.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      {/* =================== Draw Mode =================== */}
      {mode === "draw" && (
        <>
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded-lg bg-white cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          <div className="flex gap-2 mt-2 items-center">
            <button
              onClick={handleClear}
              className={`${getFontSizeClass(setting.fontSize, "medium")} px-3 py-1 rounded-lg bg-red-400 text-white hover:bg-red-500`}
            >
              CLEAR
            </button>
            <button
              onClick={handleUndo}
              className={`${getFontSizeClass(setting.fontSize, "medium")} px-3 py-1 rounded-lg bg-yellow-400 text-white hover:bg-yellow-500`}
            >
              UNDO
            </button>
            <div>
              <select
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className={`${getFontSizeClass(setting.fontSize, "medium")} px-3 py-1 rounded-lg bg-white-500 text-black`}
              >
                {strokeColors.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
      
      <p className={`mx-auto ${getFontSizeClass(setting.fontSize, "medium")} mt-8 font-bold text-gray-700`}>CASCADING KANJI VIEW</p>
      <TreeSection nodes={selectedKanji.children} setting={setting}/>
    </section>
  );
}
