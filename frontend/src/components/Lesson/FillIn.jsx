import React from "react";
import { getFontSizeClass } from "../Other/SettingMenu";

const FillIn = ({ q, showAnswer, setting }) => (
  <div className="flex mt-2 gap-2">
    <div
      className={`flex-1 h-12 rounded-2xl border flex items-center justify-center bg-white ${getFontSizeClass(
        setting.fontSize,
        "medium"
      )}`}
    >
      {showAnswer ? q.correctAnswers.join("・") : ""}
    </div>
  </div>
);

export default FillIn;
