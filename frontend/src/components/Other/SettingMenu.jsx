import { useState } from "react";
import { Settings } from "lucide-react";

export default function SettingMenu({ onChange, setting }) {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState("medium");
  const [bgColor, setBgColor] = useState("white");

  const handleFontSizeChange = (e) => {
    setFontSize(e.target.value);
    onChange({ fontSize: e.target.value, bgColor });
  };

  const handleBgColorChange = (e) => {
    setBgColor(e.target.value);
    onChange({ fontSize, bgColor: e.target.value });
  };

  return (
    <div className="relative inline-block text-left">
      {/* Settings button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-2xl bg-blue-500 ${getFontSizeClass(setting.fontSize, "medium")} text-white hover:bg-blue-600 transition`}
      >
        <Settings size={18} /> Settings
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-3 z-50">
          {/* Font size */}
          <div>
            <label className={`block ${getFontSizeClass(setting.fontSize, "medium")} font-medium text-gray-700`}>
              Font size
            </label>
            <select
              value={fontSize}
              onChange={handleFontSizeChange}
              className={`w-full mt-1 ${getFontSizeClass(setting.fontSize, "medium")} rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export function getFontSizeClass(fontSize, variant = "medium") {
  const sizeMap = {
    small: {
      small: "text-xs",
      medium: "text-sm",
      large: "text-xl",
    },
    medium: {
      small: "text-sm",
      medium: "text-base",
      large: "text-2xl",
    },
    large: {
      small: "text-base",
      medium: "text-lg",
      large: "text-3xl",
    },
  };

  return sizeMap[fontSize]?.[variant];
}

