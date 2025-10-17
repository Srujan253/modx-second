import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Shield,
  Sparkles,
  Code,
  Palette,
  GraduationCap,
  Users,
  MoreHorizontal
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";

// --- Reusable Animated Input Component ---
const FormInput = ({
  label,
  name,
  type,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  delay,
  icon: Icon,
  showPassword,
  togglePassword,
  error,
  touched,
  className = ""
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="mb-6"
  >
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-300 mb-2"
    >
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={`h-5 w-5 transition-colors ${
            value ? 'text-orange-400' : 'text-gray-500'
          }`} />
        </div>
      )}
      <input
        type={type === 'password' && showPassword ? 'text' : type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        required
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${
          type === 'password' && togglePassword ? 'pr-10' : 'pr-4'
        } py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${
          error && touched
            ? 'border-red-500 focus:ring-red-500/50'
            : value
            ? 'border-orange-500 focus:ring-orange-500/50'
            : 'border-gray-600 focus:ring-orange-500/50'
        } ${className}`}
        placeholder={placeholder}
      />
      {type === 'password' && togglePassword && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      )}
      {value && !error && type === 'email' && value.includes('@') && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-400" />
        </div>
      )}
    </div>
    {error && touched && (
      <p className="mt-1 text-sm text-red-400">{error}</p>
    )}
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
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [focusedField, setFocusedField] = useState("");

  const availableInterests = [
    { id: "ai-ml", name: "AI/ML", icon: "🤖" },
    { id: "web-dev", name: "Web Development", icon: "🌐" },
    { id: "ui-ux", name: "UI/UX Design", icon: "🎨" },
    { id: "devops", name: "DevOps", icon: "⚙️" },
    { id: "game-dev", name: "Game Development", icon: "🎮" },
    { id: "mobile", name: "Mobile Apps", icon: "📱" },
    { id: "other", name: "Other", icon: "✨" }
  ];

  const roleIcons = {
    Developer: Code,
    Designer: Palette,
    Student: GraduationCap,
    "Project Manager": Users,
    Other: MoreHorizontal
  };

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    setFocusedField("");
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateStep1 = () => {
    return formData.fullName.trim() && 
           formData.email && 
           validateEmail(formData.email) && 
           formData.password && 
           validatePassword(formData.password);
  };

  const validateStep2 = () => {
    return formData.role && 
           formData.interest && 
           (formData.interest !== "Other" || formData.otherInterest.trim());
  };

  const handleInterestSelect = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interest: interest.name,
      otherInterest: interest.name !== "Other" ? "" : prev.otherInterest,
    }));
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    setError("");

    if (step === 1 && !validateStep1()) {
      setError("Please fill all fields correctly");
      setTouched({ fullName: true, email: true, password: true });
      return;
    }

    if (step === 2 && !validateStep2()) {
      setError("Please complete all fields");
      return;
    }

    if (step === 2) {
      setIsLoading(true);
      try {
        await axiosInstance.post("/users/register", {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          interest: formData.interest === "Other" ? formData.otherInterest : formData.interest,
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
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Create Your Account
              </h2>
              <p className="text-gray-400">Join the community of creators</p>
            </div>
            
            <FormInput
              label="Full Name"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              onFocus={() => handleFocus('fullName')}
              onBlur={() => handleBlur('fullName')}
              placeholder="Enter your full name"
              delay={0.2}
              icon={User}
              error={!formData.fullName.trim() ? "Name is required" : ""}
              touched={touched.fullName}
            />
            
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => handleFocus('email')}
              onBlur={() => handleBlur('email')}
              placeholder="Enter your email"
              delay={0.3}
              icon={Mail}
              error={!formData.email ? "Email is required" : !validateEmail(formData.email) ? "Please enter a valid email" : ""}
              touched={touched.email}
            />
            
            <FormInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleFocus('password')}
              onBlur={() => handleBlur('password')}
              placeholder="Create a strong password"
              delay={0.4}
              icon={Lock}
              showPassword={showPassword}
              togglePassword={() => setShowPassword(!showPassword)}
              error={!formData.password ? "Password is required" : !validatePassword(formData.password) ? "Password must be at least 6 characters" : ""}
              touched={touched.password}
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
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Tell Us About Yourself
              </h2>
              <p className="text-gray-400">Help us personalize your experience</p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6"
            >
              <label className="block text-sm font-medium text-gray-300 mb-3">
                What is your primary role?
              </label>
              <div className="grid grid-cols-1 gap-3">
                {["Developer", "Designer", "Student", "Project Manager", "Other"].map((role) => {
                  const IconComponent = roleIcons[role];
                  return (
                    <motion.button
                      key={role}
                      type="button"
                      onClick={() => setFormData({...formData, role})}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
                        formData.role === role
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                          : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{role}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-3">
                What is your main interest?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableInterests.map((interest) => (
                  <motion.button
                    type="button"
                    key={interest.id}
                    onClick={() => handleInterestSelect(interest)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                      formData.interest === interest.name
                        ? "border-orange-500 bg-orange-500/10 text-orange-400"
                        : "border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    <span>{interest.icon}</span>
                    <span>{interest.name}</span>
                  </motion.button>
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
                      icon={Sparkles}
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
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Email Verification
              </h2>
              <p className="text-gray-400 leading-relaxed">
                We've sent a 6-digit verification code to<br />
                <span className="text-orange-400 font-medium">{formData.email}</span>
              </p>
            </div>
            
            <FormInput
              label="Verification Code"
              name="otp"
              type="text"
              value={formData.otp}
              onChange={handleChange}
              placeholder="Enter 6-digit code"
              delay={0.2}
              icon={Shield}
              className="text-center text-lg tracking-widest"
            />
            
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Didn't receive the code?{" "}
                <button 
                  type="button" 
                  className="text-orange-400 hover:text-orange-300 font-medium"
                >
                  Resend
                </button>
              </p>
            </div>
          </motion.div>
        );
      default:
        return null;
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
            className="text-center mb-6"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
              MODX
            </h1>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Step {step} of 3</span>
              <span className="text-sm text-gray-400">{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm mb-6"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={step === 3 ? handleSubmit : handleNextStep}>
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 gap-4">
              {step > 1 ? (
                <motion.button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </motion.button>
              ) : (
                <div />
              )}
              
              <motion.button
                type="submit"
                disabled={isLoading || (step === 1 && !validateStep1()) || (step === 2 && !validateStep2())}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg ${
                  isLoading || (step === 1 && !validateStep1()) || (step === 2 && !validateStep2())
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {step === 3 ? 'Creating...' : 'Loading...'}
                  </>
                ) : (
                  <>
                    {step === 3 ? 'Create Account' : 'Continue'}
                    {step !== 3 && <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
              >
                Sign in here
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

export default SignupPage;
