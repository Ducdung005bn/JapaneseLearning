import { ChevronRight } from "lucide-react";
import { getFontSizeClass } from "./SettingMenu.jsx";

export default function ReadingSection({
  title,
  readings = [],
  words = [],
  open,
  setOpen,
  onToggle,
  setting
}) {

  return (
    <div className="border p-2 rounded-lg bg-white shadow">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => {
          setOpen(!open);
          if (onToggle) onToggle();
        }}
      >
        <span className={`font-semibold ${getFontSizeClass(setting.fontSize, "medium")}`}>
            <span className="text-red-400">{title}</span> {readings.join(" ・ ")}
        </span>

        <span
          className={`${getFontSizeClass(setting.fontSize, "medium")} transform transition-transform duration-200`}
          style={{ rotate: open ? "90deg" : "0deg" }}
        >
          <ChevronRight />
        </span>
      </div>

      {open && words?.length > 0 && (
        <ul className={`${getFontSizeClass(setting.fontSize, "medium")} mt-2 flex flex-wrap gap-2 text-gray-700`}>
          {words.map((w, idx) => (
            <li
              key={idx}
              className="px-2 py-1 rounded-full bg-gray-100 border text-gray-800"
            >
              {w.kanji} ・ <span className="text-gray-500">{w.reading}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
