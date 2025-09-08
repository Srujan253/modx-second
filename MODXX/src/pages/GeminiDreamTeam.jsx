// File: src/components/GeminiDreamTeam.jsx
import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const EXAMPLES = [
  {
    label: "Web App for Student Collaboration",
    prompt:
      "I want to build a web app for students to collaborate on projects. The app should allow chat, file sharing, and project management. I need roles like frontend, backend, and UI/UX designer.",
  },
  {
    label: "AI-powered Resume Builder",
    prompt:
      "I'm planning an AI-powered resume builder. The team should have AI/ML engineers, a product manager, and a React developer. Suggest ideal roles and skills.",
  },
  {
    label: "Healthcare Appointment System",
    prompt:
      "A healthcare appointment system for clinics. I need a backend developer, a frontend developer, and someone with healthcare domain knowledge.",
  },
];

const SYSTEM_PROMPT = `You are "Dream Team AI", an expert project team builder. 
Given a project idea, analyze the requirements and suggest the ideal roles, skills, 
and 3-5 best-matched team members or mentors. Respond in a clear, structured format.`;

const GeminiDreamTeam = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleExample = (prompt) => {
    setUserPrompt(prompt);
    setResponse("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");
    setError("");
    try {
      const { data } = await axiosInstance.post("/gemini/generate", {
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
      });
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        setResponse(data.candidates[0].content.parts[0].text);
      } else {
        setError("No response from AI. Try again.");
      }
    } catch (err) {
      setError("Error contacting Gemini API.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-4 text-orange-400">
          AI-Powered 'Dream Team' Builder
        </h1>
        <p className="mb-6 text-gray-300">
          Describe your project idea. The AI will suggest ideal roles, skills,
          and a dream team for you!
        </p>
        <div className="mb-4">
          <span className="font-semibold text-gray-200">Examples:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                className="bg-gray-700 hover:bg-orange-500 text-sm px-3 py-1 rounded transition"
                onClick={() => handleExample(ex.prompt)}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-orange-400 mb-2"
            rows={4}
            placeholder="Describe your project idea..."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded font-semibold text-white disabled:opacity-60"
            disabled={loading || !userPrompt.trim()}
          >
            {loading ? "Generating..." : "Generate Dream Team"}
          </button>
        </form>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        {response && (
          <div className="bg-gray-900 p-4 rounded mt-4 whitespace-pre-wrap text-green-300 border border-gray-700">
            {response}
          </div>
        )}
      </div>
      <button
        className="mt-8 text-orange-400 hover:underline"
        onClick={() => navigate(-1)}
      >
        ← Back to Features
      </button>
    </div>
  );
};

export default GeminiDreamTeam;
