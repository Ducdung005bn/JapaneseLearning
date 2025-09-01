import React from "react";
import { UserCircleIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";

export default function Header({ sidebarOpen, setSidebarOpen, darkMode, toggleDarkMode }) {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center">
        {!sidebarOpen && (
          <button
            className="p-1 mr-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            onClick={() => setSidebarOpen(true)}
          >
            ▶
          </button>
        )}
        <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-100">
          Nihongo Learning
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleDarkMode}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {darkMode ? (
            <SunIcon className="h-6 w-6 text-yellow-400" />
          ) : (
            <MoonIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
          )}
        </button>
        <UserCircleIcon className="h-8 w-8 text-gray-600 dark:text-gray-200 cursor-pointer" />
      </div>
    </header>
  );
}
