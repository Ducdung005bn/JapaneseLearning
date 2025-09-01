import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TabBar from "./Tabbar";
import Home from "../pages/Home";
import Vocabulary from "../pages/Vocabulary";
import Kanji from "../pages/Kanji";

export default function Layout() {
  const [tabs, setTabs] = useState([{ name: "Home", path: "/" }]);
  const [activeTab, setActiveTab] = useState("/");

  return (
    <div className="flex h-screen">
      <Sidebar
        tabs={tabs}
        setTabs={setTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="flex-1 flex flex-col">
        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setTabs={setTabs}
        />
        <div className="flex-1 p-4 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
            <Route path="/kanji" element={<Kanji />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
