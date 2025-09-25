// File: routes/ai.routes.js
const express = require("express");
const router = express.Router();
const { getChatbotResponse } = require("../controller/ai.controller");
const protect = require("../middleware/authMiddleware");

// This endpoint is protected. A user must be logged in to access the chatbot.
router.post("/chat", protect, getChatbotResponse);

module.exports = router;
