import React from "react";
import { getFontSizeClass } from "../Other/SettingMenu";

const MultipleChoice = ({ q, showAnswer, setting }) => (
  <div className="mt-2 space-y-2">
    {q.answers.map((a, i) => (
      <div
        key={i}
        className={`flex items-center gap-2 p-2 rounded-2xl border ${
          showAnswer && a.isCorrect ? "bg-green-100 border-green-500" : "bg-white"
        }`}
      >
        <div
          className={`w-5 h-5 border rounded-full flex-shrink-0 flex items-center justify-center ${
            showAnswer && a.isCorrect ? "bg-green-500" : ""
          }`}
        >
          {showAnswer && a.isCorrect && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
        <span className={`${getFontSizeClass(setting.fontSize, "medium")}`}>{a.answer}</span>
      </div>
    ))}
  </div>
);

export default MultipleChoice;
