// components/resumeForm.jsx

import React, { useState } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist/webpack";
import mammoth from "mammoth";
import AnalysisResult from "./analysisResult";

// Configure PDF.js worker (handled automatically by CRA)
GlobalWorkerOptions.workerSrc = "";

/**
 * ResumeForm Component
 * 
 * Provides a form interface for users to upload a resume (PDF or DOCX),
 * input a target role and company, and submit for analysis.
 * 
 * Extracted text from the resume is sent to the backend API (/api/analyze),
 * which communicates with OpenAI GPT to produce structured feedback.
 */
export default function ResumeForm() {
  const [file, setFile] = useState(null);         // Selected resume file
  const [role, setRole] = useState("");           // Target job role
  const [company, setCompany] = useState("");     // Optional company name
  const [loading, setLoading] = useState(false);  // Submission state
  const [result, setResult] = useState(null);     // Analysis result from API
  const [error, setError] = useState(null);       // Error message

  /**
   * Extracts text content from a PDF file using pdfjs.
   * @param {File} file - PDF file to process
   * @returns {Promise<string>} Extracted text
   */
  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }
    return text;
  };

  /**
   * Extracts raw text from a DOCX file using Mammoth.
   * @param {File} file - DOCX file to process
   * @returns {Promise<string>} Extracted text
   */
  const extractTextFromDOCX = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value;
  };

  /**
   * Handles file selection from the file input
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  /**
   * Handles form submission
   * - Validates inputs
   * - Extracts text from resume
   * - Sends resume text and metadata to backend API
   * - Updates state with analysis result or error
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!file || !role) {
      setError("Please upload a resume and enter a role.");
      return;
    }

    setLoading(true);

    try {
      let resumeText = "";
      const ext = file.name.split(".").pop().toLowerCase();

      if (ext === "pdf") {
        resumeText = await extractTextFromPDF(file);
      } else if (ext === "docx") {
        resumeText = await extractTextFromDOCX(file);
      } else {
        throw new Error("Unsupported file type. Only PDF and DOCX are allowed.");
      }

      // Call backend API to analyze resume
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          role,
          company,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error: ${text}`);
      }

      const data = await response.json();
      setResult(data);

    } catch (err) {
      console.error("ResumeForm Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
      {/* Resume File Input */}
      <div style={{ marginBottom: "0.5rem" }}>
        <label>Upload Resume (PDF or DOCX):</label><br />
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="rounded-xl file:rounded-xl file:cursor-pointer"
        />
      </div>

      {/* Target Role Input */}
      <div style={{ marginBottom: "0.5rem" }}>
        <label>Target Role:</label><br />
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="pl-2 w-1/2 text-black rounded-lg"
        />
      </div>

      {/* Company Input */}
      <div style={{ marginBottom: "0.5rem" }}>
        <label>Company (optional):</label><br />
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="pl-2 w-1/2 text-black rounded-lg"
        />
      </div>

      {/* Submit Button */}
      <button
        className="mt-1 px-6 py-2 rounded-lg border border-gray-300 hover:text-black hover:bg-white"
        type="submit"
        disabled={loading}
      >
        {loading ? <span className="flex space-x-1">
          <span>Analyzing</span>
          <span className="animate-bounce">.</span>
          <span className="animate-bounce200">.</span>
          <span className="animate-bounce400">.</span>
        </span> : "Analyze Resume"}
      </button>

      {/* Error Message */}
      {error && <p className="text-red-600">{error}</p>}

      {/* Analysis Result */}
      {result && (
        <div className="mt-[15px]">
          <h1>Analysis Result:</h1>
          <AnalysisResult result={result} />
        </div>
      )}
    </form>
  );
}
