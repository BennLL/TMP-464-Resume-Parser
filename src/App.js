import React from "react";
import ResumeForm from "./components/resumeForm";
import Logo from "./img/logo512.png";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-gray-100 font-mono overflow-hidden p-6 flex flex-col items-center">
      <div className="flex items-center mb-8 space-x-4">
        <img src={Logo} alt="Logo" className="w-16 h-16 object-contain" />
        <h1 className="text-4xl font-bold">CV Bro</h1>
      </div>
      <div className="p-6 w-full max-w-[1000px] border border-gray-300 rounded-lg shadow-[2px_2px_4px_rgba(229,221,221,0.8)]">
        <h2 className="text-2xl font-semibold mb-2">Resume Analyzer — Tailor for a Role</h2>
        <p className="mb-4 text-gray-300">
          Upload your resume (PDF or DOCX), enter the role & company, and get structured suggestions to tailor your resume.
        </p>
        <ResumeForm />
      </div>
    </div>
  );
}
