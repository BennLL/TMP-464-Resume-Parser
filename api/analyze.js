// api/analyze.js

/**
 * API Route: /api/analyze
 * 
 * Handles resume analysis requests from the frontend.
 * Accepts POST requests with resume text, target role, and company name,
 * and returns a structured JSON analysis generated via OpenAI GPT API.
 * 
 * The JSON response includes:
 * - matchScore: integer 0-100
 * - strengths: array of strings
 * - weaknesses: array of strings
 * - suggestions: array of strings
 * - tailoredBullets: array of strings
 * - notes: optional string
 * 
 * CORS headers are set to allow local development and deployment.
 */

export default async function handler(req, res) {
  // Set CORS headers to allow requests from frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Respond to preflight requests
  if (req.method === "OPTIONS") return res.status(200).end();

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Extract request body parameters
    const { resumeText, role, company } = req.body;

    // Validate required fields
    if (!resumeText || !role) {
      return res.status(400).json({ error: "Missing resume text or role" });
    }

    // Construct prompt for OpenAI GPT
    const prompt = `
User target role: ${role}
Company: ${company}

Resume text:
"""${resumeText}"""

Return a single JSON object with keys:
- matchScore: integer 0-100
- strengths: array of strings
- weaknesses: array of strings
- suggestions: array of strings
- tailoredBullets: array of strings
- notes: optional string
Return ONLY valid JSON.
`;

    // Call OpenAI GPT API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Secure backend key
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a professional resume reviewer. Return only JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    // Handle API errors
    if (!response.ok) {
      const message = await response.text();
      return res.status(500).json({ error: message });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "{}";

    // Remove code fences if present
    content = content.replace(/```json|```/g, "").trim();

    // Return structured JSON to frontend
    return res.status(200).json(JSON.parse(content));
  } catch (error) {
    // Log error for debugging
    console.error("Analyze API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
