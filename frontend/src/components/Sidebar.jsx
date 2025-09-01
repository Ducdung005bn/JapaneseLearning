import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ tabs, setTabs, activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const pages = [
    { name: "Home", path: "/" },
    { name: "Vocabulary", path: "/vocabulary" },
    { name: "Kanji", path: "/kanji" },
  ];

  const openTab = (page) => {
    if (!tabs.find((t) => t.path === page.path)) {
      setTabs([...tabs, page]);
    }
    setActiveTab(page.path);
    navigate(page.path);
  };

  return (
    <div className="w-40 bg-gray-200 p-2">
      {pages.map((page) => (
        <button
          key={page.path}
          className="block w-full text-left p-2 my-1 bg-white rounded"
          onClick={() => openTab(page)}
        >
          {page.name}
        </button>
      ))}
    </div>
  );
}
