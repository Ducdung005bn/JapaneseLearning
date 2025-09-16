import { useState } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";
import { getFontSizeClass } from "./SettingMenu.jsx";

export default function HelpModal({ title, setting }) {
  const [isOpen, setIsOpen] = useState(false);

  // Cấu trúc nội dung: text chính + optional list
  const helpContents = {
    "heisig": {
      text: "Heisig assigns English names to kanji parts and links complex characters through stories. It was created by James Heisig in the book Remembering the Kanji – a three-volume series designed to teach the 3,000 most frequent kanji to Japanese learners."
    },
    "principle": {
      text: "The six principles categorize Chinese characters based on their formation methods. Six Principles of Kanji (六書):",
      list: [
        "Pictographs (象形) – Kanji that visually represent objects, e.g., 山 (mountain).",
        "Simple Ideographs (指事) – Kanji that symbolize abstract ideas, e.g., 一 (one).",
        "Compound Ideographs (会意) – Kanji formed by combining components to convey a meaning, e.g., 信 (trust = person + speech).",
        "Phono-semantic Compounds (形声) – Kanji with a meaning part and a sound part, e.g., 江 (river = water + phonetic).",
        "Derivative Cognates (転注) – Characters sharing pronunciation but slightly different meanings.",
        "Loan Characters (仮借) – Characters borrowed for words with similar sounds."
      ]
    },
    "han viet": {
      text: "Sino-Vietnamese words are words and morphemes in Vietnamese that originate from Chinese, as well as Vietnamese words created by combining Chinese-derived words and/or morphemes. Sino-Vietnamese vocabulary constitutes a significant part of the Vietnamese language and plays an important role; it cannot be separated from or removed from Vietnamese."
    }
  };

  const content = helpContents[title] || { text: "No help content available for this section." };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"
        title="Help"
      >
        <HelpCircle size={24} />
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 z-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl h-full overflow-auto p-6 relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-1 right-3 text-gray-500 hover:text-gray-700 font-bold text-5xl"
              >
                ×
              </button>

              <div
                className={`text-gray-800 ${getFontSizeClass(
                  setting.fontSize,
                  "medium"
                )} mt-10 space-y-4`}
              >
                <p>{content.text}</p>
                {content.list && (
                  <ul className="list-disc list-inside space-y-2">
                    {content.list.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
