import axios from "axios";

// The base URL of your deployed backend server
const API_URL = "http://localhost:5000/api/v1"; // <-- IMPORTANT: Replace with your backend URL

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is the magic line that sends cookies with requests
});

export default axiosInstance;
