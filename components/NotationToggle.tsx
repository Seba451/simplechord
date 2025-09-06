"use client";

import React from "react";
import { useNotation } from "../app/context/notation"; // Ajustá el path según tu estructura

const NotationToggle = () => {
  const { notation, toggleNotation } = useNotation();

  return (
    <div className="flex items-center gap-4">
      <span className="text-lg font-medium text-gray-700">
        {notation === "latino" ? "Latino" : "Americano"}
      </span>
      <button
        onClick={toggleNotation}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
          notation === "latino" ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            notation === "latino" ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

export default NotationToggle;