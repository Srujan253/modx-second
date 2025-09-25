// File: controllers/ai.controller.js
const axios = require("axios");
const ErrorHandler = require("../utils/errorHandler");

// The URL where your Python AI service is running
const PYTHON_AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL;

exports.getChatbotResponse = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      return next(
        new ErrorHandler("A query is required to chat with the AI.", 400)
      );
    }

    // --- FORWARD THE REQUEST ---
    // Make a POST request from this Node.js server to your Python AI server's /chat endpoint
    const aiResponse = await axios.post(`${PYTHON_AI_SERVICE_URL}/chat`, {
      query: query,
    });

    // Send the response from the Python service directly back to the user
    res.status(200).json(aiResponse.data);
  } catch (error) {
    // This will catch errors if the Python service is down or returns an error
    console.error("Error communicating with the Python AI service:", error);
    return next(
      new ErrorHandler(
        "The AI Mentor is currently unavailable. Please try again later.",
        503
      )
    );
  }
};
