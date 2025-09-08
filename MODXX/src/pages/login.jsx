import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext"; // This will now work
import axiosInstance from "../api/axiosInstance"; // Make sure this path is correct

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // It works because AuthProvider is a parent
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/users/login", formData);
      // Update the global state with the user data from the login response
      login(response.data.user);
      navigate("/"); // Redirect to a protected page
    } catch (err) {
      setError(err.response?.data?.message || "Login failed!");
    } finally {
      setIsLoading(false);
    }
  };

  // The JSX part of your component needs to be present to render the page.
  // Assuming a similar structure to your signup page.
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-5xl font-bold text-center bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent mb-4"
        >
          MoDX
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-center text-orange-600 dark:text-orange-400 mb-6"
        >
          Log In
        </motion.h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="text-red-500 text-sm text-center -mt-2 mb-4">
              {error}
            </p>
          )}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="Enter your email"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="Enter your password"
            />
          </motion.div>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition duration-200 shadow-lg disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Log In"}
          </motion.button>
        </form>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center text-gray-600 dark:text-gray-400 mt-6"
        >
          Don't have an account?{" "}
          <Link to="/signup" className="text-orange-500 hover:underline">
            Sign up
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
