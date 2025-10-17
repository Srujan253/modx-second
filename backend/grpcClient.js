const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// The URL of your Python gRPC server, from your .env file
const PYTHON_AI_SERVICE_URL =
  process.env.PYTHON_AI_SERVICE_URL || "localhost:50051";

// Correct path to the .proto file in the project's root
const PROTO_PATH = path.join(__dirname, "", "protos/ai.proto");

// AI Service availability flag
let isAIServiceAvailable = false;
let client = null;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

// Initialize the gRPC client with error handling
const initializeAIClient = () => {
  try {
    // Load the .proto file
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    // Create the gRPC client using the loaded package definition
    const ai_proto = grpc.loadPackageDefinition(packageDefinition).ai;
    client = new ai_proto.AIService(
      PYTHON_AI_SERVICE_URL,
      grpc.credentials.createInsecure()
    );

    return true;
  } catch (error) {
    console.warn("Failed to initialize AI service client:", error.message);
    return false;
  }
};

// Health check function
const checkAIServiceHealth = async () => {
  const now = Date.now();
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return isAIServiceAvailable;
  }

  lastHealthCheck = now;

  if (!client && !initializeAIClient()) {
    isAIServiceAvailable = false;
    return false;
  }

  return new Promise((resolve) => {
    // Use a simple call with timeout to check health
    const deadline = new Date(Date.now() + 5000); // 5 second timeout
    client.waitForReady(deadline, (error) => {
      if (error) {
        isAIServiceAvailable = false;
        if (now - lastHealthCheck > 60000) { // Only log every minute
          console.warn("AI Service is not available - running without AI features");
        }
        resolve(false);
      } else {
        if (!isAIServiceAvailable) {
          console.log("AI Service is now available");
        }
        isAIServiceAvailable = true;
        resolve(true);
      }
    });
  });
};

// Initialize client on startup
initializeAIClient();

// Helper function to handle AI service calls with fallback
const callWithFallback = async (serviceName, callFunction, fallbackData = null) => {
  try {
    const isAvailable = await checkAIServiceHealth();
    if (!isAvailable) {
      return fallbackData;
    }

    return await callFunction();
  } catch (error) {
    console.error(`Error in ${serviceName}:`, error.message);
    isAIServiceAvailable = false;
    return fallbackData;
  }
};

// --- All Client Functions ---

// 1. For the chatbot
const getChatbotResponse = async (query) => {
  return callWithFallback(
    'getChatbotResponse',
    () => new Promise((resolve, reject) => {
      client.GetChatbotResponse({ query }, (error, response) => {
        if (error) {
          return reject(error);
        }
        resolve(response);
      });
    }),
    { response: "I'm sorry, the AI service is currently unavailable. Please try again later." }
  );
};

// 2. For personalized user recommendations
const getUserRecommendations = async (user_profile_text) => {
  return callWithFallback(
    'getUserRecommendations',
    () => new Promise((resolve, reject) => {
      client.GetUserRecommendations(
        { query_text: user_profile_text },
        (error, response) => {
          if (error) {
            return reject(error);
          }
          resolve(response);
        }
      );
    }),
    { recommended_ids: [] }
  );
};

// 3. For finding projects related to another project
const getRelatedProjects = async (query_text) => {
  return callWithFallback(
    'getRelatedProjects',
    () => new Promise((resolve, reject) => {
      client.GetRelatedProjects({ query_text }, (error, response) => {
        if (error) {
          return reject(error);
        }
        resolve(response);
      });
    }),
    { recommended_ids: [] }
  );
};

// 4. For handling search bar queries
const searchProjects = async (search_query) => {
  return callWithFallback(
    'searchProjects',
    () => new Promise((resolve, reject) => {
      client.SearchProjects({ search_query }, (error, response) => {
        if (error) {
          return reject(error);
        }
        resolve(response);
      });
    }),
    { recommended_ids: [] }
  );
};

const triggerIndexing = async () => {
  return callWithFallback(
    'triggerIndexing',
    () => new Promise((resolve, reject) => {
      client.IndexNewData({}, (error, response) => {
        if (error) {
          console.error("Error triggering indexing:", error);
          return reject(error);
        }
        console.log("Indexing triggered:", response.status || "success");
        resolve(response.status || "success");
      });
    }),
    "fallback: indexing skipped - AI service unavailable"
  );
};

const deleteProjectFromIndex = async (projectId) => {
  return callWithFallback(
    'deleteProjectFromIndex',
    () => new Promise((resolve, reject) => {
      client.DeleteProjectFromIndex(
        { project_id: parseInt(projectId) },
        (err, response) => {
          if (err) {
            console.error(`Error deleting project ${projectId} from index:`, err);
            return reject(err);
          }
          console.log(`Deleted project ${projectId} from index`);
          resolve(response);
        }
      );
    }),
    { status: "fallback: deletion skipped - AI service unavailable" }
  );
};

module.exports = {
  getChatbotResponse,
  getUserRecommendations,
  getRelatedProjects,
  searchProjects,
  triggerIndexing,
  deleteProjectFromIndex,
  checkAIServiceHealth,
  isAIServiceAvailable: () => isAIServiceAvailable,
};
