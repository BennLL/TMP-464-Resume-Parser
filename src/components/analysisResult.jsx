// components/analysisResult.jsx

import React from "react";

/**
 * AnalysisResult Component
 * 
 * Displays the results of the resume analysis in a structured, card-based format.
 * Each list (strengths, weaknesses, suggestions, tailored bullets) is shown
 * in a scrollable card. The match score and optional notes are highlighted separately.
 * 
 * @param {Object} props
 * @param {Object} props.result - The analysis result object returned from the backend API
 * @param {number} props.result.matchScore - Resume match score (0-100)
 * @param {string[]} props.result.strengths - List of strengths identified in the resume
 * @param {string[]} props.result.weaknesses - List of weaknesses identified in the resume
 * @param {string[]} props.result.suggestions - Actionable suggestions for improving the resume
 * @param {string[]} props.result.tailoredBullets - Suggested bullet points tailored to the target role
 * @param {string} props.result.notes - Optional notes or summary
 */
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

  /**
   * Renders a card with a scrollable list of items.
   * @param {string} title - Card title
   * @param {string[]} items - List items to display
   */
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
      {/* Match Score Card */}
      <div className="text-white shadow-md rounded-lg p-4 flex items-center justify-between">
        <span className="font-semibold text-lg">Match Score:</span>
        <span className="text-xl font-bold">{matchScore}/100</span>
      </div>

      {/* Scrollable cards for each section */}
      {strengths.length > 0 && renderCard("Strengths", strengths)}
      {weaknesses.length > 0 && renderCard("Weaknesses", weaknesses)}
      {suggestions.length > 0 && renderCard("Suggestions", suggestions)}
      {tailoredBullets.length > 0 && renderCard("Tailored Bullets", tailoredBullets)}

      {/* Notes section */}
      {notes && (
        <div className="text-white shadow-md rounded-lg p-4">
          <h4 className="font-semibold mb-2">Notes:</h4>
          <p>{notes}</p>
        </div>
      )}
    </div>
  );
}
