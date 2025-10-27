import React from "react";
import ResumeForm from "./components/resumeForm";

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold mb-4">Resume Analyzer — Tailor for a Role</h1>
        <p className="text-sm text-gray-600 mb-6">
          Upload your resume (PDF or DOCX), enter the role & company, and get structured suggestions to tailor your resume.
        </p>
        <ResumeForm />
      </div>
    </div>
  );
}
