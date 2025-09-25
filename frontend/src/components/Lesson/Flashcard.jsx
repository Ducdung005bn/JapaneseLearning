import React, { useState } from "react";
import { getFontSizeClass } from "../Other/SettingMenu";

const Flashcard = ({ q, showAnswer, setting }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative mt-4 w-full h-28 [perspective:1000px]"
      onClick={() => showAnswer && setFlipped((prev) => !prev)}
    >
      <div
        className={`${showAnswer ? "cursor-pointer" : ""} relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute w-full h-full rounded-2xl border border-black shadow-md bg-white flex items-center justify-center [backface-visibility:hidden]">
          <div className={`${getFontSizeClass(setting.fontSize, "medium")} font-bold`}>
            {q.content}
          </div>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full rounded-2xl border border-black shadow-md bg-green-100 flex items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className={`${getFontSizeClass(setting.fontSize, "medium")} text-blue-900 font-semibold`}>
            {q.correctAnswers.join("・")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
