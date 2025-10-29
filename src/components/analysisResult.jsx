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

  return (
    <div
      style={{
        marginTop: "1rem",
        background: "#f4f4f4",
        padding: "1rem",
        borderRadius: "6px",
      }}
    >
      <h3>Resume Analysis</h3>
      <p><strong>Match Score:</strong> {matchScore}/100</p>

      {strengths.length > 0 && (
        <>
          <h4>Strengths:</h4>
          <ul>{strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </>
      )}

      {weaknesses.length > 0 && (
        <>
          <h4>Weaknesses:</h4>
          <ul>{weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
        </>
      )}

      {suggestions.length > 0 && (
        <>
          <h4>Suggestions:</h4>
          <ul>{suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </>
      )}

      {tailoredBullets.length > 0 && (
        <>
          <h4>Tailored Bullets:</h4>
          <ul>{tailoredBullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
        </>
      )}

      {notes && (
        <>
          <h4>Notes:</h4>
          <p>{notes}</p>
        </>
      )}
    </div>
  );
}
