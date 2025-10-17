import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user starts typing
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    setFocusedField("");
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const isFormValid = () => {
    return formData.email && formData.password && validateEmail(formData.email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    // Mark all fields as touched for validation
    setTouched({ email: true, password: true });
    
    if (!isFormValid()) {
      setError("Please check your email format");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/users/login", formData);
      login(response.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed! Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700/50 relative"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/5 to-transparent"></div>
        
        <div className="relative">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">
              MODX
            </h1>
            <p className="text-gray-400 text-sm">Welcome back! Sign in to continue</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 transition-colors ${
                    focusedField === 'email' || formData.email 
                      ? 'text-orange-400' 
                      : 'text-gray-500'
                  }`} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  required
                  className={`w-full pl-10 pr-10 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${
                    touched.email && !validateEmail(formData.email) && formData.email
                      ? 'border-red-500 focus:ring-red-500/50'
                      : focusedField === 'email' || (formData.email && validateEmail(formData.email))
                      ? 'border-orange-500 focus:ring-orange-500/50'
                      : 'border-gray-600 focus:ring-orange-500/50'
                  }`}
                  placeholder="Enter your email"
                />
                {formData.email && validateEmail(formData.email) && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {touched.email && !validateEmail(formData.email) && formData.email && (
                <p className="mt-1 text-sm text-red-400">Please enter a valid email address</p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 transition-colors ${
                    focusedField === 'password' || formData.password 
                      ? 'text-orange-400' 
                      : 'text-gray-500'
                  }`} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                  required
                  className={`w-full pl-10 pr-10 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${
                    focusedField === 'password' || formData.password
                      ? 'border-orange-500 focus:ring-orange-500/50'
                      : 'border-gray-600 focus:ring-orange-500/50'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !isFormValid()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${
                isLoading || !isFormValid()
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
              >
                Create one here
              </Link>
            </p>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <Link 
                to="/" 
                className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
