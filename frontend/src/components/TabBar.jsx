import React from "react";
import { useNavigate } from "react-router-dom";

export default function TabBar({ tabs, activeTab, setActiveTab, setTabs }) {
  const navigate = useNavigate();

  const selectTab = (tab) => {
    setActiveTab(tab.path);
    navigate(tab.path);
  };

  const closeTab = (tab) => {
    const filtered = tabs.filter((t) => t.path !== tab.path);
    setTabs(filtered);
    if (activeTab === tab.path) {
      const newActive = filtered[filtered.length - 1]?.path || "/";
      setActiveTab(newActive);
      navigate(newActive);
    }
  };

  return (
    <div className="flex bg-gray-300 p-2">
      {tabs.map((tab) => (
        <div
          key={tab.path}
          className={`px-4 py-2 mr-2 rounded cursor-pointer ${
            activeTab === tab.path ? "bg-white" : "bg-gray-400"
          }`}
        >
          <span onClick={() => selectTab(tab)}>{tab.name}</span>
          <button
            onClick={() => closeTab(tab)}
            className="ml-2 text-red-500"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
