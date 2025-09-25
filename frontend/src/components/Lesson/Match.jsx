import React from "react";
import { getFontSizeClass } from "../Other/SettingMenu";

const rowColors = ["bg-orange-200", "bg-blue-200"];

const Match = ({ q, showAnswer, setting }) => {
  return (
    <div className={`${getFontSizeClass(setting.fontSize, "medium")} grid grid-cols-3 gap-4 mt-2`}>
      {/* Left */}
      <div className="flex flex-col gap-1">
        {q.leftItems.map((item, i) => (
          <div key={i} className={`h-12 p-2 border flex items-center justify-center rounded-2xl ${rowColors[i % rowColors.length]}`}>
            {item}
          </div>
        ))}
      </div>

      {/* Middle */}
      <div className="flex flex-col gap-1">
        {q.leftItems.map((_, i) => (
          <div
            key={i}
            className={`h-12 p-2 border flex items-center justify-center rounded-2xl ${
              rowColors[i % rowColors.length]
            } ${showAnswer ? `border-solid` : "border-dashed border-black"}`}
          >
            {showAnswer ? q.rightItems[i] : ""}
          </div>
        ))}
      </div>

      {/* Right */}
      <div className="flex flex-col gap-1">
        {!showAnswer &&
          (q.shuffledRightItems || q.rightItems).map((item, i) => (
            <div key={i} className="h-12 p-2 border flex items-center justify-center bg-white rounded-2xl">
              {item}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Match;
