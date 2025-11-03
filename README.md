# CV Bro — Resume Analyzer

CV Bro is a web application that analyzes your resume and provides structured feedback tailored to a specific job role and company. The app leverages OpenAI’s GPT API to evaluate strengths, weaknesses, and suggestions, helping users tailor their resumes for better job fit.

---

## Features

- Upload **PDF** or **DOCX** resumes.
- Specify **target role** and **company**.
- Get a structured JSON analysis:
  - `matchScore` (0–100)
  - `strengths` (array)
  - `weaknesses` (array)
  - `suggestions` (array)
  - `tailoredBullets` (array)
  - `notes` (optional)
- Clean UI built with **React** and **Tailwind CSS**.
- Backend proxy to OpenAI API for secure key handling.


---

## Dependencies

- **React** (frontend)
- **Tailwind CSS** (UI styling)
- **pdfjs-dist** (PDF text extraction)
- **mammoth** (DOCX text extraction)
- **OpenAI API** (resume analysis)

---


