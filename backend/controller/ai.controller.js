const { getChatResponse: getAIResponse } = require("../aiHttpClient");
const ErrorHandler = require("../utils/errorHandler");

exports.getChatbotResponse = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      return next(
        new ErrorHandler("A query is required to chat with the AI.", 400)
      );
    }

    // --- FORWARD THE REQUEST using HTTP ---
    const answer = await getAIResponse(query);

    // Send the response from the Python service back to the user
    res.status(200).json({ answer });
  } catch (error) {
    console.error("Error communicating with the Python AI service:", error);
    return next(
      new ErrorHandler(
        "The AI Mentor is currently unavailable. Please try again later.",
        503
      )
    );
  }
};
