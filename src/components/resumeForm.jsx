import React, { useState } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist/webpack";
import mammoth from "mammoth";
import AnalysisResult from "./analysisResult";

GlobalWorkerOptions.workerSrc = ""; // Worker handled by CRA

export default function ResumeForm() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Extract text from PDF file
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

  // Extract text from DOCX file
  const extractTextFromDOCX = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value;
  };

  // Handle resume file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle form submit
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

      // ✅ Call backend API (not OpenAI directly anymore)
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeText: resumeText.trim(), role, company }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error: ${text}`);
      }

      const data = await response.json();
      setResult(data);

    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
      <div style={{ marginBottom: "0.5rem" }}>
        <label>Upload Resume (PDF or DOCX):</label><br />
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="rounded-xl file:rounded-xl file:cursor-pointer"
        />

      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>Target Role:</label><br />
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-1/2 text-black rounded-lg"
        />
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>Company (optional):</label><br />
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-1/2 text-black rounded-lg"
        />
      </div>

      <button className="mt-1 px-6 py-2 rounded-lg border border-gray-300 rounded-lg hover:text-black hover:bg-white" type="submit" disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {error && <p className="text-red-600">{error}</p>}

      {result && (
        <div>
          <h3>Analysis Result:</h3>
          {result && <AnalysisResult result={result} />}
        </div>
      )}
    </form>
  );
}
