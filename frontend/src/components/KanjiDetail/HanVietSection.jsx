import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { getFontSizeClass } from "../Other/SettingMenu.jsx";
import HelpModal from "../Other/HelpModal.jsx";    

export default function HanVietSection({ hanViet, setting }) {
    const [openIndices, setOpenIndices] = useState({});
    const [openFields, setOpenFields] = useState({}); // { idx_fieldName: true/false }

    const toggleOpen = (idx) => {
        setOpenIndices((prev) => ({ ...prev, [idx]: !prev[idx] }));
    };

    const toggleField = (idx, field) => {
        const key = `${idx}_${field}`;
        setOpenFields((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const fieldMap = [
        { key: "common_meanings", label: "Từ điển phổ thông" },
        { key: "cited_meanings", label: "Từ điển trích dẫn" },
        { key: "thieu_chuu_meanings", label: "Từ điển Thiều Chử" },
        { key: "tran_van_chanh_meanings", label: "Từ điển Trần Văn Chánh" },
        { key: "nguyen_quoc_hung_meanings", label: "Từ điển Nguyễn Quốc Hùng" },
        { key: "compounds", label: "Từ ghép" },
    ];

    return (
    <section className="space-y-3">
        {hanViet.map((hv, idx) => {
            const isOpen = !!openIndices[idx];

            return (
            <div key={idx} className="border p-2 rounded-lg bg-yellow-50 shadow">
                {/* Header */}
                <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleOpen(idx)}
                >

                    <p className={`${getFontSizeClass(setting.fontSize, "medium")} font-semibold flex gap-x-1`}>
                        <HelpModal title={"han viet"} setting={setting}/>
                        <span className="text-red-400">HAN VIET</span> {hv.reading.toUpperCase()}
                    </p>

                <span
                    className={`${getFontSizeClass(setting.fontSize, "medium")} transform transition-transform duration-200`}
                    style={{ rotate: isOpen ? "90deg" : "0deg" }}
                >
                    <ChevronRight />
                </span>
                </div>

                {/* Nội dung mở rộng */}
                {isOpen && (
                <div className={`${getFontSizeClass(setting.fontSize, "medium")} mt-2 text-gray-700 space-y-2 divide-y divide-gray-300`}>
                    {fieldMap.map(({ key, label }) => {
                    const fieldData = hv[key];
                    if (!fieldData || fieldData.length === 0) return null;
                    const fieldKey = `${idx}_${key}`;
                    const fieldOpen = !!openFields[fieldKey];

                    return (
                        <div key={key}>
                        {/* Nút mở riêng cho từng field */}
                        <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => toggleField(idx, key)}
                        >
                            <span className="font-semibold">{label}</span>
                            <span
                            className="transform transition-transform duration-200"
                            style={{ rotate: fieldOpen ? "90deg" : "0deg" }}
                            >
                            <ChevronRight size={16} />
                            </span>
                        </div>

                        {fieldOpen && key === "compounds" ? (
                            <div className="mt-1 flex flex-wrap gap-2">
                            {fieldData.map((c, i) => (
                                <div
                                key={i}
                                className={`${getFontSizeClass(setting.fontSize, "medium")} px-2 py-1 rounded-full bg-gray-100 border text-gray-800`}
                                >
                                {c}
                                </div>
                            ))}
                            </div>
                        ) : fieldOpen ? (
                            <div className="mt-1">
                            {fieldData.map((m, i) => (
                                <div key={i}>{m}</div>
                            ))}
                            </div>
                        ) : null}
                        </div>
                    );
                    })}
                </div>
                )}
            </div>
            );
        })}
    </section>
    );
}
