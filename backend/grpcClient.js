const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// The URL of your Python gRPC server, from your .env file
const PYTHON_AI_SERVICE_URL =
  process.env.PYTHON_AI_SERVICE_URL || "localhost:50051";

// Correct path to the .proto file in the project's root
const PROTO_PATH = path.join(__dirname, "", "protos/ai.proto");

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
const client = new ai_proto.AIService(
  PYTHON_AI_SERVICE_URL,
  grpc.credentials.createInsecure()
);

// --- All Client Functions ---

// 1. For the chatbot
const getChatbotResponse = (query) => {
  return new Promise((resolve, reject) => {
    client.GetChatbotResponse({ query }, (error, response) => {
      if (error) {
        return reject(error);
      }
      resolve(response);
    });
  });
};

// 2. For personalized user recommendations
const getUserRecommendations = (user_profile_text) => {
  return new Promise((resolve, reject) => {
    client.GetUserRecommendations(
      { query_text: user_profile_text },
      (error, response) => {
        if (error) {
          return reject(error);
        }
        resolve(response);
      }
    );
  });
};

// 3. For finding projects related to another project
const getRelatedProjects = (query_text) => {
  return new Promise((resolve, reject) => {
    client.GetRelatedProjects({ query_text }, (error, response) => {
      if (error) {
        return reject(error);
      }
      resolve(response);
    });
  });
};

// 4. For handling search bar queries
const searchProjects = (search_query) => {
  return new Promise((resolve, reject) => {
    client.SearchProjects({ search_query }, (error, response) => {
      if (error) {
        return reject(error);
      }
      resolve(response);
    });
  });
};

const triggerIndexing = () => {
  return new Promise((resolve, reject) => {
    client.IndexNewData({}, (error, response) => {
      if (error) {
        console.error("Error triggering indexing:", error);
        return reject(error);
      }
      console.log("Indexing triggered:", response.status || "success");
      resolve(response.status || "success");
    });
  });
};

const deleteProjectFromIndex = (projectId) => {
  return new Promise((resolve, reject) => {
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
  });
};

module.exports = {
  getChatbotResponse,
  getUserRecommendations,
  getRelatedProjects,
  searchProjects,
  triggerIndexing,
  deleteProjectFromIndex,
};
