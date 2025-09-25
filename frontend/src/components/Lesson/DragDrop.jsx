import React from "react";
import { getFontSizeClass } from "../Other/SettingMenu";

const DragDrop = ({ q, showAnswer, setting }) => {
  const parts = q.content.split("[drag-item]");

  return (
    <div className={`${getFontSizeClass(setting.fontSize, "medium")}`}>
      <div className="mt-2 flex flex-wrap gap-2 font-bold">
        {parts.map((part, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <span>{part}</span>
            {i < q.dragItems.length && (
              <div className="w-24 h-12 rounded-full bg-white border flex items-center justify-center border-dashed border-black">
                {showAnswer ? q.dragItems[i] : ""}
              </div>
            )}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-5 mt-5 justify-center">
        {(q.shuffledDragOptions || [...q.dragItems, ...(q.distractors || [])]).map((item, i) => (
          <div key={i} className="p-2 border rounded-full bg-white flex items-center">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DragDrop;
