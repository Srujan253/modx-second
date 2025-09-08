import React, { createContext, useState, useEffect, useContext } from "react";
import axiosInstance from "../api/axiosInstance"; // Ensure this path is correct for your project

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create a custom hook for easy access to the context
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Create the Provider component that will wrap your app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To check auth status on initial load

  // Check if a user is already logged in when the app starts
  useEffect(() => {
    const verifyUser = async () => {
      try {
        // This '/me' route verifies the session cookie on the backend
        const response = await axiosInstance.get("/users/me");
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        // If the cookie is invalid or expired, the user is not logged in
        setUser(null);
        console.log("error", error);
      } finally {
        setLoading(false);
      }
    };
    verifyUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/users/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // The value that will be available to all children components
  const value = {
    user,
    isLoggedIn: !!user, // True if user object exists, false otherwise
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
