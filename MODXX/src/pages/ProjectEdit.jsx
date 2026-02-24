import React, { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  ArrowRight, 
  Clock,
  Sparkles,
  FileText,
  Target,
  Code,
  Calendar,
  Users,
  Image,
  AlertCircle,
  Wand2,
  RefreshCw,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

import axiosInstance, { BASE_URL } from "../api/axiosInstance";

// Move InputField outside to prevent re-creation on every render
const InputField = ({ 
  label, 
  name, 
  type = "text", 
  icon: Icon, 
  placeholder, 
  required = false,
  register,
  errors,
  ...props 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-2"
  >
    <label htmlFor={name} className="flex items-center gap-2 text-sm font-medium text-gray-300">
      {Icon && <Icon className="w-4 h-4 text-orange-400" />}
      {label}
      {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        id={name}
        placeholder={placeholder}
        {...register(name, props.validation)}
        className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${
          errors[name] 
            ? 'border-red-500 focus:ring-red-500/50' 
            : 'border-gray-600 focus:ring-orange-500/50'
        }`}
        {...props}
      />
      {errors[name] && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
      )}
    </div>
    {errors[name] && (
      <div className="flex items-center gap-1 text-red-400 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>{errors[name].message}</span>
      </div>
    )}
  </motion.div>
);

// Move TextAreaField outside to prevent re-creation on every render
const TextAreaField = React.memo(({ 
  label, 
  name, 
  icon: Icon, 
  placeholder, 
  required = false, 
  rows = 4,
  showAIRewrite = false,
  register,
  errors,
  watchedDescription,
  watchedGoals,
  watchedMotivation,
  isRewriting,
  aiDisabled,
  rewriteWithAI,
  rewriteGoalsWithAI,
  rewriteMotivationWithAI,
  descriptionRef,
  goalsRef,
  motivationRef,
  lastCursorPosition,
  lastGoalsCursorPosition,
  lastMotivationCursorPosition,
  ...props 
}) => {
  // Use appropriate ref and cursor position based on field name
  const textareaRef = name === 'description' ? descriptionRef : name === 'goals' ? goalsRef : name === 'motivation' ? motivationRef : useRef(null);
  const watchedValue = name === 'description' ? watchedDescription : name === 'goals' ? watchedGoals : name === 'motivation' ? watchedMotivation : '';
  const rewriteFunction = name === 'description' ? rewriteWithAI : name === 'goals' ? rewriteGoalsWithAI : name === 'motivation' ? rewriteMotivationWithAI : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="flex items-center gap-2 text-sm font-medium text-gray-300">
          {Icon && <Icon className="w-4 h-4 text-orange-400" />}
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
        {showAIRewrite && rewriteFunction && (
          <motion.button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!aiDisabled) {
                rewriteFunction();
              }
            }}
            disabled={isRewriting || aiDisabled || !watchedValue || watchedValue.length < 10}
            whileHover={!isRewriting && !aiDisabled ? { scale: 1.05 } : {}}
            whileTap={!isRewriting && !aiDisabled ? { scale: 0.95 } : {}}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              isRewriting || aiDisabled || !watchedValue || watchedValue.length < 10
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-purple-500/25'
            }`}
            title={aiDisabled ? "AI temporarily disabled due to rate limits" : "Rewrite with AI"}
          >
            {isRewriting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-3 h-3" />
                </motion.div>
                Rewriting...
              </>
            ) : aiDisabled ? (
              <>
                <X className="w-3 h-3" />
                AI Disabled
              </>
            ) : (
              <>
                <Wand2 className="w-3 h-3" />
                Rewrite with AI
              </>
            )}
          </motion.button>
        )}
      </div>
      <div className="relative">
        <textarea
          ref={textareaRef}
          id={name}
          rows={rows}
          placeholder={placeholder}
          {...register(name, {
            ...props.validation,
            onChange: (e) => {
              // Store cursor position for specific fields
              if (name === 'description' && textareaRef.current) {
                lastCursorPosition.current = textareaRef.current.selectionStart;
              } else if (name === 'goals' && textareaRef.current) {
                lastGoalsCursorPosition.current = textareaRef.current.selectionStart;
              } else if (name === 'motivation' && textareaRef.current) {
                lastMotivationCursorPosition.current = textareaRef.current.selectionStart;
              }
              // Call the original onChange from react-hook-form
              return props.validation?.onChange?.(e);
            }
          })}
          className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
            errors[name] 
              ? 'border-red-500 focus:ring-red-500/50' 
              : 'border-gray-600 focus:ring-orange-500/50'
          }`}
          // Additional event handlers for better cursor management
          onSelect={(e) => {
            if (name === 'description') {
              lastCursorPosition.current = e.target.selectionStart;
            } else if (name === 'goals') {
              lastGoalsCursorPosition.current = e.target.selectionStart;
            } else if (name === 'motivation') {
              lastMotivationCursorPosition.current = e.target.selectionStart;
            }
          }}
          onKeyUp={(e) => {
            if (name === 'description') {
              lastCursorPosition.current = e.target.selectionStart;
            } else if (name === 'goals') {
              lastGoalsCursorPosition.current = e.target.selectionStart;
            } else if (name === 'motivation') {
              lastMotivationCursorPosition.current = e.target.selectionStart;
            }
          }}
          onMouseUp={(e) => {
            if (name === 'description') {
              lastCursorPosition.current = e.target.selectionStart;
            } else if (name === 'goals') {
              lastGoalsCursorPosition.current = e.target.selectionStart;
            } else if (name === 'motivation') {
              lastMotivationCursorPosition.current = e.target.selectionStart;
            }
          }}
        />
        {errors[name] && (
          <div className="absolute top-3 right-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
        )}
      </div>
      {errors[name] && (
        <div className="flex items-center gap-1 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{errors[name].message}</span>
        </div>
      )}
    </motion.div>
  );
});

const ProjectEdit = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [lastAICall, setLastAICall] = useState(0); 
  const [aiDisabled, setAiDisabled] = useState(false); 

  const descriptionRef = useRef(null);
  const goalsRef = useRef(null);
  const motivationRef = useRef(null);
  const lastCursorPosition = useRef(null);
  const lastGoalsCursorPosition = useRef(null);
  const lastMotivationCursorPosition = useRef(null);

  const watchedDescription = watch("description", "");
  const watchedGoals = watch("goals", "");
  const watchedMotivation = watch("motivation", "");

  useEffect(() => {
    if (descriptionRef.current && lastCursorPosition.current !== null) {
      const position = lastCursorPosition.current;
      const currentValue = descriptionRef.current.value;
      setTimeout(() => {
        if (descriptionRef.current && position <= currentValue.length) {
          descriptionRef.current.setSelectionRange(position, position);
          lastCursorPosition.current = null;
        }
      }, 0);
    }
  });

  useEffect(() => {
    if (goalsRef.current && lastGoalsCursorPosition.current !== null) {
      const position = lastGoalsCursorPosition.current;
      const currentValue = goalsRef.current.value;
      setTimeout(() => {
        if (goalsRef.current && position <= currentValue.length) {
          goalsRef.current.setSelectionRange(position, position);
          lastGoalsCursorPosition.current = null;
        }
      }, 0);
    }
  });

  useEffect(() => {
    if (motivationRef.current && lastMotivationCursorPosition.current !== null) {
      const position = lastMotivationCursorPosition.current;
      const currentValue = motivationRef.current.value;
      setTimeout(() => {
        if (motivationRef.current && position <= currentValue.length) {
          motivationRef.current.setSelectionRange(position, position);
          lastMotivationCursorPosition.current = null;
        }
      }, 0);
    }
  });

  const checkRateLimit = () => {
    const now = Date.now();
    const timeSinceLastCall = now - lastAICall;
    const minInterval = 5000;
    if (timeSinceLastCall < minInterval) {
      const waitTime = Math.ceil((minInterval - timeSinceLastCall) / 1000);
      throw new Error(`⏳ Please wait ${waitTime} more second${waitTime > 1 ? 's' : ''} before trying AI rewrite again.`);
    }
    setLastAICall(now);
  };

  const disableAITemporarily = useCallback(() => {
    setAiDisabled(true);
    setTimeout(() => {
      setAiDisabled(false);
      toast.info("🔄 AI features are back online!");
    }, 10 * 60 * 1000);
  }, []);

  const handleAIError = useCallback((error, type = "description") => {
    console.error(`AI Rewrite ${type} Error:`, error);
    if (error.response?.status === 429) {
      disableAITemporarily();
      toast.error("🚫 AI Temporarily Disabled Due to Rate Limits", { autoClose: 15000 });
    } else {
      toast.error(`AI enhancement failed for ${type}. Please try again later.`);
    }
  }, [disableAITemporarily]);

  const callGeminiAPI = useCallback(async (prompt) => {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error("Gemini API key not found");
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    return await axios.post(apiUrl, {
      contents: [{ parts: [{ text: prompt }] }]
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
  }, []);

  const callAIWithFallback = useCallback(async (prompt) => {
    try {
      const response = await callGeminiAPI(prompt);
      if (response.data.candidates?.[0]?.content) {
        return { text: response.data.candidates[0].content.parts[0].text.trim(), provider: 'Gemini' };
      }
      throw new Error("No response from Gemini");
    } catch (error) {
      throw error;
    }
  }, [callGeminiAPI]);

  const rewriteWithAI = useCallback(async () => {
    const currentValues = getValues();
    const currentDescription = currentValues.description;
    if (!currentDescription || currentDescription.trim().length < 10) {
      toast.error("Please enter at least 10 characters before rewriting.");
      return;
    }
    try { checkRateLimit(); } catch (e) { toast.warning(e.message); return; }
    setIsRewriting(true);
    try {
      const prompt = `Rewrite and enhance the following project description for "${currentValues.title || 'Untitled'}". Return ONLY rewritten text.\nOriginal: "${currentDescription}"`;
      const result = await callAIWithFallback(prompt);
      const cleanedText = result.text.replace(/^(Rewritten description:|Here's the version:)/i, '').replace(/^[:\s]+/, '').trim();
      setValue("description", cleanedText, { shouldValidate: true, shouldDirty: true });
      setTimeout(() => {
        if (descriptionRef.current) {
          descriptionRef.current.focus();
          descriptionRef.current.setSelectionRange(cleanedText.length, cleanedText.length);
        }
      }, 100);
      toast.success(`✨ Description enhanced!`);
    } catch (error) {
      handleAIError(error, "description");
    } finally { setIsRewriting(false); }
  }, [getValues, setValue, callAIWithFallback, checkRateLimit, handleAIError]);

  const rewriteGoalsWithAI = useCallback(async () => {
    const currentValues = getValues();
    const currentGoals = currentValues.goals;
    if (!currentGoals || currentGoals.trim().length < 10) {
      toast.error("Please enter at least 10 characters before rewriting.");
      return;
    }
    try { checkRateLimit(); } catch (e) { toast.warning(e.message); return; }
    setIsRewriting(true);
    try {
      const prompt = `Rewrite and enhance the following project goals for "${currentValues.title || 'Untitled'}". Return ONLY rewritten text.\nOriginal: "${currentGoals}"`;
      const result = await callAIWithFallback(prompt);
      const cleanedText = result.text.replace(/^(Rewritten goals:|Here's the version:)/i, '').replace(/^[:\s]+/, '').trim();
      setValue("goals", cleanedText, { shouldValidate: true, shouldDirty: true });
      setTimeout(() => {
        if (goalsRef.current) {
          goalsRef.current.focus();
          goalsRef.current.setSelectionRange(cleanedText.length, cleanedText.length);
        }
      }, 100);
      toast.success(`🎯 Goals enhanced!`);
    } catch (error) {
      handleAIError(error, "goals");
    } finally { setIsRewriting(false); }
  }, [getValues, setValue, callAIWithFallback, checkRateLimit, handleAIError]);

  const rewriteMotivationWithAI = useCallback(async () => {
    const currentValues = getValues();
    const currentMotivation = currentValues.motivation;
    if (!currentMotivation || currentMotivation.trim().length < 10) {
      toast.error("Please enter at least 10 characters before rewriting.");
      return;
    }
    try { checkRateLimit(); } catch (e) { toast.warning(e.message); return; }
    setIsRewriting(true);
    try {
      const prompt = `Rewrite and enhance the following project motivation for "${currentValues.title || 'Untitled'}". Return ONLY rewritten text.\nOriginal: "${currentMotivation}"`;
      const result = await callAIWithFallback(prompt);
      const cleanedText = result.text.replace(/^(Rewritten motivation:|Here's the version:)/i, '').replace(/^[:\s]+/, '').trim();
      setValue("motivation", cleanedText, { shouldValidate: true, shouldDirty: true });
      setTimeout(() => {
        if (motivationRef.current) {
          motivationRef.current.focus();
          motivationRef.current.setSelectionRange(cleanedText.length, cleanedText.length);
        }
      }, 100);
      toast.success(`🚀 Motivation enhanced!`);
    } catch (error) {
      handleAIError(error, "motivation");
    } finally { setIsRewriting(false); }
  }, [getValues, setValue, callAIWithFallback, checkRateLimit, handleAIError]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axiosInstance.get(`project/${projectId}`);
        const project = res.data.project;
        if (project.leader_id !== user.id) {
          toast.error("Only the project leader can edit this project.");
          navigate(-1);
          return;
        }
        setValue("title", project.title);
        setValue("timeline", project.timeline);
        setValue("description", project.description);
        setValue("goals", project.goals);
        setValue("motivation", project.motivation || "");
        setValue("requiredSkills", project.required_skills?.join(", "));
        setValue("techStack", project.tech_stack?.join(", "));
        setValue("maxMembers", project.max_members);
        setPreview(
          project.project_image ? (project.project_image.startsWith('http') ? project.project_image : `${BASE_URL}${project.project_image.substring(1)}`) : null
        );
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load project.");
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId, user, setValue, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (data.projectImage && data.projectImage[0]) {
        formData.set("projectImage", data.projectImage[0]);
      }
      const response = await axiosInstance.put(
        `project/${projectId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success(response.data.message);
      navigate(`/project/${projectId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Project update failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <svg
          className="animate-spin h-10 w-10 text-orange-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="mt-4 text-lg">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-4xl font-bold text-center text-orange-500 mb-8">
          Edit Project
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-800 p-8 rounded-xl shadow-2xl space-y-6"
          encType="multipart/form-data"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              label="Project Title"
              name="title"
              icon={Sparkles}
              placeholder="Project Title"
              required
              register={register}
              errors={errors}
              validation={{ required: "Title is required" }}
            />
            <InputField
              label="Timeline (Days)"
              name="timeline"
              type="number"
              icon={Calendar}
              placeholder="e.g., 30"
              required
              register={register}
              errors={errors}
              validation={{
                required: "Timeline is required",
                valueAsNumber: true,
                min: { value: 1, message: "Must be at least 1 day" },
              }}
            />
          </div>

          <TextAreaField
            label="Project Description"
            name="description"
            icon={FileText}
            placeholder="Describe your project..."
            required
            rows={4}
            showAIRewrite={true}
            register={register}
            errors={errors}
            watchedDescription={watchedDescription}
            isRewriting={isRewriting}
            aiDisabled={aiDisabled}
            rewriteWithAI={rewriteWithAI}
            descriptionRef={descriptionRef}
            lastCursorPosition={lastCursorPosition}
            validation={{ required: "Description is required" }}
          />

          <TextAreaField
            label="Goals"
            name="goals"
            icon={Target}
            placeholder="Project goals..."
            required
            rows={3}
            showAIRewrite={true}
            register={register}
            errors={errors}
            watchedGoals={watchedGoals}
            isRewriting={isRewriting}
            aiDisabled={aiDisabled}
            rewriteGoalsWithAI={rewriteGoalsWithAI}
            goalsRef={goalsRef}
            lastGoalsCursorPosition={lastGoalsCursorPosition}
            validation={{ required: "Goals are required" }}
          />

          <TextAreaField
            label="Motivation"
            name="motivation"
            icon={Sparkles}
            placeholder="Why should members join?"
            required={false}
            rows={3}
            showAIRewrite={true}
            register={register}
            errors={errors}
            watchedMotivation={watchedMotivation}
            isRewriting={isRewriting}
            aiDisabled={aiDisabled}
            rewriteMotivationWithAI={rewriteMotivationWithAI}
            motivationRef={motivationRef}
            lastMotivationCursorPosition={lastMotivationCursorPosition}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              label="Required Skills"
              name="requiredSkills"
              icon={Code}
              placeholder="React, Node.js..."
              register={register}
              errors={errors}
            />
            <InputField
              label="Tech Stack"
              name="techStack"
              icon={Code}
              placeholder="MERN, Firebase..."
              register={register}
              errors={errors}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              label="Max Members"
              name="maxMembers"
              type="number"
              icon={Users}
              placeholder="Max members"
              register={register}
              errors={errors}
              validation={{
                min: { value: 1, message: "Min 1" },
                max: { value: 8, message: "Max 8" },
              }}
            />
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Image className="w-4 h-4 text-orange-400" />
                Project Image
              </label>
              <input
                type="file"
                id="projectImage"
                accept="image/*"
                {...register("projectImage")}
                onChange={handleImageChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-4 w-full h-48 object-cover rounded-lg border-2 border-orange-500 shadow"
                />
              )}
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-3 ${
              isSubmitting
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-xl"
            }`}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Clock className="w-5 h-5" />
                </motion.div>
                Updating Project...
              </>
            ) : (
              <>
                Update Project
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProjectEdit;
