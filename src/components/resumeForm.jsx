import React, { useState } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist/webpack"; // CRA-friendly PDF.js
import mammoth from "mammoth";

GlobalWorkerOptions.workerSrc = ""; // Worker bundled automatically

export default function ResumeForm() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Extract text from PDF
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

  // Extract text from DOCX
  const extractTextFromDOCX = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value;
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

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

      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      const model = process.env.REACT_APP_OPENAI_MODEL || "gpt-4o";

      const prompt = `
User target role: ${role}
Company: ${company}

Resume text:
"""${resumeText}"""

Please analyze the resume for the target role and company, and return a single JSON object with these keys:
- matchScore: integer 0-100
- strengths: array of short strings
- weaknesses: array of short strings
- suggestions: array of short strings
- tailoredBullets: array of short strings
- notes: optional string
Return ONLY valid JSON.
`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "You are a professional resume reviewer. Return only JSON." },
            { role: "user", content: prompt },
          ],
          temperature: 0.15,
          max_tokens: 1200,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`OpenAI error: ${text}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      // Robustly strip markdown code fences before parsing
      let cleaned = content.trim();
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/^```/, "").replace(/```$/, "").trim();

      const parsed = JSON.parse(cleaned);
      setResult(parsed);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
      <div style={{ marginBottom: "0.5rem" }}>
        <label>Upload Resume (PDF or DOCX):</label><br/>
        <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>Target Role:</label><br/>
        <input value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%" }} />
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>Company (optional):</label><br/>
        <input value={company} onChange={(e) => setCompany(e.target.value)} style={{ width: "100%" }} />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "1rem", whiteSpace: "pre-wrap", background: "#f4f4f4", padding: "1rem" }}>
          <h3>Analysis (JSON):</h3>
          {JSON.stringify(result, null, 2)}
        </div>
      )}
    </form>
  );
}
