import React from "react";

export default function AnalysisResult({ result }) {
  if (!result) return null;

  const {
    matchScore,
    strengths = [],
    weaknesses = [],
    suggestions = [],
    tailoredBullets = [],
    notes = "",
  } = result;

  // Helper to render a card with a scrollable list
  const renderCard = (title, items) => (
    <div className="text-white shadow-md rounded-lg p-4 mb-4 flex flex-col">
      <h4 className="font-semibold mb-2">{title}</h4>
      <div className="overflow-y-auto max-h-40 pr-2">
        <ul className="list-disc pl-5 space-y-1">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="mt-4 space-y-4">
      {/* Match Score */}
      <div className="text-white shadow-md rounded-lg p-4 flex items-center justify-between">
        <span className="font-semibold text-lg">Match Score:</span>
        <span className="text-xl font-bold">{matchScore}/100</span>
      </div>

      {/* Sections */}
      {strengths.length > 0 && renderCard("Strengths", strengths)}
      {weaknesses.length > 0 && renderCard("Weaknesses", weaknesses)}
      {suggestions.length > 0 && renderCard("Suggestions", suggestions)}
      {tailoredBullets.length > 0 && renderCard("Tailored Bullets", tailoredBullets)}

      {/* Notes */}
      {notes && (
        <div className="text-white shadow-md rounded-lg p-4">
          <h4 className="font-semibold mb-2">Notes:</h4>
          <p>{notes}</p>
        </div>
      )}
    </div>
  );
}
