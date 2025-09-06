"use client";
import React from "react";

const ExplanationToggle = ({ showExplanations, toggleExplanations }) => {
  return (
    <div className="flex items-center gap-4">
      <span className="text-lg font-medium text-gray-700">
        {showExplanations ? "Explicaciones" : "Explicaciones"}
      </span>
      <button
        onClick={toggleExplanations}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
          showExplanations ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            showExplanations ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

export default ExplanationToggle;