// api/analyze.js
export default async function handler(req, res) {
  // Allow frontend to reach backend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { resumeText, role, company } = req.body; // ✅ Don't parse again

    if (!resumeText || !role) {
      return res.status(400).json({ error: "Missing resume text or role" });
    }

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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // ✅ backend secret
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

    if (!response.ok) {
      const message = await response.text();
      return res.status(500).json({ error: message });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "{}";

    // ✅ Strip any code fences
    content = content.replace(/```json|```/g, "").trim();

    return res.status(200).json(JSON.parse(content));
  } catch (error) {
    console.error("Analyze API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
