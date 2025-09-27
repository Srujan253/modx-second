const ErrorHandler = require("../utils/errorHandler");
const { getChatbotResponse: getGrpcResponse } = require("../grpcClient"); // Import the gRPC client function

exports.getChatbotResponse = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      return next(
        new ErrorHandler("A query is required to chat with the AI.", 400)
      );
    }

    // --- FORWARD THE REQUEST using gRPC ---
    // Call the clean gRPC client function
    const aiResponse = await getGrpcResponse(query);

    // Send the response from the Python service back to the user
    // The response will be an object like { answer: '...' }
    res.status(200).json(aiResponse);
  } catch (error) {
    console.error("Error communicating with the Python gRPC service:", error);
    return next(
      new ErrorHandler(
        "The AI Mentor is currently unavailable. Please try again later.",
        503
      )
    );
  }
};
