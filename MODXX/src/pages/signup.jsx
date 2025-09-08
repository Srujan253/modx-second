import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../api/axiosInstance"; // <-- Corrected the import path

// --- Reusable Animated Input Component ---
const FormInput = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  delay,
}) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="mb-6"
  >
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required
      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 dark:bg-gray-700 dark:text-white"
      placeholder={placeholder}
    />
  </motion.div>
);

// --- MAIN SIGNUP COMPONENT ---
const SignupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Developer",
    interest: "",
    otherInterest: "",
    otp: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const availableInterests = [
    "AI/ML",
    "Web Development",
    "UI/UX Design",
    "DevOps",
    "Game Development",
    "Mobile Apps",
    "Other",
  ];

  const handleChange = (e) => {
    setError(""); // Clear error on change
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInterestSelect = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interest: interest,
      otherInterest: interest !== "Other" ? "" : prev.otherInterest,
    }));
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    setError("");

    if (step === 2) {
      setIsLoading(true);
      try {
        await axiosInstance.post("/users/register", {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          interest: formData.interest,
          otherInterest: formData.otherInterest,
        });
        setStep(step + 1);
      } catch (err) {
        setError(
          err.response?.data?.message || "An error occurred. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/users/verify", {
        email: formData.email,
        otp: formData.otp,
      });
      alert(response.data.message);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Verification failed. Please check the code and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
              Create Your Account
            </h2>
            <FormInput
              label="Full Name"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              delay={0.2}
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              delay={0.4}
            />
            <FormInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              delay={0.6}
            />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
              Tell Us About Yourself
            </h2>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6"
            >
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                What is your primary role?
              </label>
              <select
                name="role"
                id="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              >
                <option>Developer</option>
                <option>Designer</option>
                <option>Student</option>
                <option>Project Manager</option>
                <option>Other</option>
              </select>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What is your main interest?
              </label>
              <div className="flex flex-wrap gap-2">
                {availableInterests.map((interest) => (
                  <button
                    type="button"
                    key={interest}
                    onClick={() => handleInterestSelect(interest)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                      formData.interest === interest
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {formData.interest === "Other" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <FormInput
                      label="Please specify your interest"
                      name="otherInterest"
                      type="text"
                      value={formData.otherInterest}
                      onChange={handleChange}
                      placeholder="Your interest"
                      delay={0.1}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4">
              Email Verification
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              We've sent a 6-digit code to <strong>{formData.email}</strong>.
              Please enter it below.
            </p>
            <FormInput
              label="Verification Code"
              name="otp"
              type="text"
              value={formData.otp}
              onChange={handleChange}
              placeholder="Enter your 6-digit OTP"
              delay={0.2}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md"
      >
        <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent mb-6">
          MoDX
        </h1>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8 dark:bg-gray-700">
          <motion.div
            className="bg-orange-500 h-2.5 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm text-center mb-4"
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={step === 3 ? handleSubmit : handleNextStep}>
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          <div className="flex justify-between items-center mt-8">
            {step > 1 ? (
              <motion.button
                type="button"
                onClick={handlePrevStep}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition duration-200 disabled:opacity-50"
              >
                Back
              </motion.button>
            ) : (
              <div />
            )}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition duration-200 shadow-lg disabled:opacity-50"
            >
              {isLoading
                ? "Loading..."
                : step === 3
                ? "Create Account"
                : "Next"}
            </motion.button>
          </div>
        </form>
        <p className="text-center text-gray-600 dark:text-gray-400 mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-500 hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;
