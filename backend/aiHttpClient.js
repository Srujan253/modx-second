const axios = require("axios");

const AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || "http://localhost:50051";

const aiHttpClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 60000, // 60 seconds
});

const getChatResponse = async (query) => {
  try {
    const response = await aiHttpClient.post("/chat", { query });
    return response.data.answer;
  } catch (error) {
    console.error("AI HTTP Client Error (chat):", error.message);
    throw error;
  }
};

const getUserRecommendations = async (queryText) => {
  try {
    const response = await aiHttpClient.post("/recommendations", { query_text: queryText });
    return response.data.recommended_ids;
  } catch (error) {
    console.error("AI HTTP Client Error (recommendations):", error.message);
    return [];
  }
};

const getRelatedProjects = async (queryText) => {
  try {
    const response = await aiHttpClient.post("/related-projects", { query_text: queryText });
    return response.data.recommended_ids;
  } catch (error) {
    console.error("AI HTTP Client Error (related-projects):", error.message);
    return [];
  }
};

const searchProjects = async (searchQuery) => {
  try {
    const response = await aiHttpClient.post("/search-projects", { search_query: searchQuery });
    return response.data.recommended_ids;
  } catch (error) {
    console.error("AI HTTP Client Error (search-projects):", error.message);
    return [];
  }
};

const indexNewData = async () => {
  try {
    const response = await aiHttpClient.post("/index-new-data");
    return response.data.status;
  } catch (error) {
    console.error("AI HTTP Client Error (index):", error.message);
    return "Error: " + error.message;
  }
};

const deleteProjectFromIndex = async (projectId) => {
  try {
    const response = await aiHttpClient.delete(`/project/${projectId}`);
    return response.data.message;
  } catch (error) {
    console.error("AI HTTP Client Error (delete):", error.message);
    return "Error: " + error.message;
  }
};

module.exports = {
  getChatResponse,
  getUserRecommendations,
  getRelatedProjects,
  searchProjects,
  indexNewData,
  deleteProjectFromIndex,
};
