import axios from "axios";

// Helper to normalize the URL
const getBaseURL = () => {
  let url = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
  
  // Normalize: remove trailing slashes
  url = url.replace(/\/+$/, "");
  
  // Ensure it ends with /api/v1/
  if (!url.endsWith("/api/v1")) {
    url = `${url}/api/v1`;
  }
  
  const finalUrl = `${url}/`;
  console.log("AxiosInstance: Base URL configured as:", finalUrl);
  return finalUrl;
};

export const API_URL = getBaseURL();
export const BASE_URL = API_URL; // Alias for compatibility with my recent edits

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default axiosInstance;
