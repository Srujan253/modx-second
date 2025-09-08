const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

// POST /api/gemini/generate
router.post("/generate", async (req, res) => {
  const { systemPrompt, userPrompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not set" });

  // Use the correct model name as in your working frontend (e.g., gemini-1.5-flash)
  const GEMINI_MODEL = "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  // Combine systemPrompt and userPrompt into a single user message for Gemini API compatibility
  const combinedPrompt = systemPrompt
    ? `${systemPrompt}\n${userPrompt}`
    : userPrompt;

  try {
    const geminiRes = await axios.post(
      url,
      {
        contents: [{ role: "user", parts: [{ text: combinedPrompt }] }],
        generationConfig: { maxOutputTokens: 1000 },
      },
      { headers: { "Content-Type": "application/json" } }
    );
    res.json(geminiRes.data);
  } catch (err) {
    res.status(500).json({ error: "Gemini API error", details: err.message });
    console.log(err);
  }
});

module.exports = router;
