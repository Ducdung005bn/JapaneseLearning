import { getFontSizeClass } from "../Other/SettingMenu";
import { ChevronRight } from "lucide-react";

export default function Conjugation({
  conjugations,
  setting,
  openConjugation,
  setOpenConjugation,
}) {
  if (!conjugations) return null;

  const entries = Object.entries(conjugations).filter(([_, value]) => value !== null);
  if (entries.length === 0) return null;

  const labels = {
    dictionary: "Dictionary",
    polite: "Polite",
    past: "Past",
    pastPolite: "Past (Polite)",
    teForm: "Te-form",
    potential: "Potential",
    passive: "Passive",
    causative: "Causative",
    causativePassive: "Causative Passive",
    imperative: "Imperative",
  };

  return (
    <section className="mt-4 w-full border rounded-2xl bg-white shadow-md p-4 flex flex-col gap-2">
      {/* Header clickable */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setOpenConjugation((prev) => !prev)}
      >
        <span
          className={`font-bold text-emerald-700 ${getFontSizeClass(
            setting.fontSize,
            "medium"
          )}`}
        >
          CONJUGATIONS
        </span>

        <span
          className={`${getFontSizeClass(setting.fontSize, "medium")} transform transition-transform duration-200`}
          style={{ rotate: openConjugation ? "90deg" : "0deg" }}
        >
          <ChevronRight />
        </span>
      </div>

      {/* Content */}
      {openConjugation && (
        <div className="grid grid-cols-2 gap-2 text-center mt-2">
          {entries.map(([key, value]) => (
            <>
              <span
                key={`${key}-label`}
                className={`font-medium text-gray-700 border-b pb-1 ${getFontSizeClass(
                  setting.fontSize,
                  "medium"
                )}`}
              >
                {labels[key] ?? key}
              </span>
              <span
                key={`${key}-value`}
                className={`text-emerald-600 font-bold border-b pb-1 ${getFontSizeClass(
                  setting.fontSize,
                  "medium"
                )}`}
              >
                {value}
              </span>
            </>
          ))}
        </div>
      )}
    </section>
  );
}
