import axios from "axios";

// The base URL of your deployed backend server
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is the magic line that sends cookies with requests
});

export default axiosInstance;
