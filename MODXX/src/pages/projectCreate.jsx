import React, { useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Upload, 
  X, 
  Calendar, 
  Users, 
  Target, 
  Code,
  Sparkles,
  Clock,
  FileText,
  Image,
  CheckCircle,
  AlertCircle,
  Wand2,
  RefreshCw
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

import axiosInstance, { API_URL } from "../api/axiosInstance";

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
            }
          }}
          onKeyUp={(e) => {
            if (name === 'description') {
              lastCursorPosition.current = e.target.selectionStart;
            } else if (name === 'goals') {
              lastGoalsCursorPosition.current = e.target.selectionStart;
            }
          }}
          onMouseUp={(e) => {
            if (name === 'description') {
              lastCursorPosition.current = e.target.selectionStart;
            } else if (name === 'goals') {
              lastGoalsCursorPosition.current = e.target.selectionStart;
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

const ProjectCreation = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm();
  const navigate = useNavigate();
  const [preview, setPreview] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [isRewriting, setIsRewriting] = React.useState(false);
  const [lastAICall, setLastAICall] = React.useState(0); // Track last API call time
  const [aiDisabled, setAiDisabled] = React.useState(false); // Track if AI is temporarily disabled
  
  // Refs to preserve cursor position during re-renders
  const descriptionRef = useRef(null);
  const goalsRef = useRef(null);
  const motivationRef = useRef(null);
  const lastCursorPosition = useRef(null);
  const lastGoalsCursorPosition = useRef(null);
  const lastMotivationCursorPosition = useRef(null);

  // Watch only specific fields that we actually need for UI logic
  // Use selective watching to prevent excessive re-renders
  const watchedDescription = watch("description", "");
  const watchedGoals = watch("goals", "");
  const watchedMotivation = watch("motivation", "");

  // Effect to restore cursor position after re-renders (with dependency check)
  React.useEffect(() => {
    if (descriptionRef.current && lastCursorPosition.current !== null) {
      const position = lastCursorPosition.current;
      const currentValue = descriptionRef.current.value;
      
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        if (descriptionRef.current && position <= currentValue.length) {
          descriptionRef.current.setSelectionRange(position, position);
          lastCursorPosition.current = null;
        }
      }, 0);
    }
  });

  // Effect to restore cursor position for goals field
  React.useEffect(() => {
    if (goalsRef.current && lastGoalsCursorPosition.current !== null) {
      const position = lastGoalsCursorPosition.current;
      const currentValue = goalsRef.current.value;
      
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        if (goalsRef.current && position <= currentValue.length) {
          goalsRef.current.setSelectionRange(position, position);
          lastGoalsCursorPosition.current = null;
        }
      }, 0);
    }
  });

  // Effect to restore cursor position for motivation field
  React.useEffect(() => {
    if (motivationRef.current && lastMotivationCursorPosition.current !== null) {
      const position = lastMotivationCursorPosition.current;
      const currentValue = motivationRef.current.value;
      
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        if (motivationRef.current && position <= currentValue.length) {
          motivationRef.current.setSelectionRange(position, position);
          lastMotivationCursorPosition.current = null;
        }
      }, 0);
    }
  });

  // Rate limiting function with enhanced feedback and cooldown tracking
  const checkRateLimit = () => {
    const now = Date.now();
    const timeSinceLastCall = now - lastAICall;
    const minInterval = 5000; // Increased to 5 seconds between calls
    
    if (timeSinceLastCall < minInterval) {
      const waitTime = Math.ceil((minInterval - timeSinceLastCall) / 1000);
      throw new Error(`⏳ Please wait ${waitTime} more second${waitTime > 1 ? 's' : ''} before trying AI rewrite again. This helps avoid rate limits.`);
    }
    
    setLastAICall(now);
  };

  // Temporarily disable AI after rate limits
  const disableAITemporarily = useCallback(() => {
    setAiDisabled(true);
    // Re-enable after 10 minutes
    setTimeout(() => {
      setAiDisabled(false);
      console.log("🔄 AI features re-enabled. You can try again now.");
      toast.info("🔄 AI features are back online! You can try rewriting again.", {
        position: "top-center",
        autoClose: 5000
      });
    }, 10 * 60 * 1000); // 10 minutes
  }, []);

  // Shared error handler for AI functions
  const handleAIError = useCallback((error, type = "description") => {
    console.error(`AI Rewrite ${type} Error:`, error);
    
    if (error.response?.status === 429) {
      console.error("Gemini API Rate Limited:", error.response.data);
      disableAITemporarily();
      toast.error(
        "🚫 AI Temporarily Disabled Due to Rate Limits\n\n📊 Google API limits exceeded (15 requests/minute)\n⏰ AI features disabled for 10 minutes to prevent further issues",
        { autoClose: 15000, position: "top-center" }
      );
    } else if (error.response?.status === 404) {
      toast.error("🔑 API Configuration Error! Gemini API endpoint not found (404).", { autoClose: 10000 });
    } else if (error.response) {
      const errorMsg = error.response.data.error?.message || 'Unknown API error';
      toast.error(`🤖 AI Enhancement Failed: ${errorMsg}`);
    } else {
      toast.error("🤖 AI enhancement temporarily unavailable. Please try again in a few minutes.");
    }
  }, [disableAITemporarily, toast]);

  // DeepSeek API call function (COMMENTED OUT)
  // const callDeepSeekAPI = useCallback(async (prompt) => {
  //   const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
  //   
  //   if (!DEEPSEEK_API_KEY) {
  //     throw new Error("DeepSeek API key not found");
  //   }

  //   return await axios.post(
  //     'https://api.deepseek.com/v1/chat/completions',
  //     {
  //       model: "deepseek-chat",
  //       messages: [
  //         {
  //           role: "user",
  //           content: prompt
  //         }
  //       ],
  //       max_tokens: 500,
  //       temperature: 0.7
  //     },
  //     {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
  //       },
  //       timeout: 30000
  //     }
  //   );
  // }, []);

  // Gemini API call function with enhanced debugging and latest endpoint
  const callGeminiAPI = useCallback(async (prompt) => {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key not found");
    }


    console.log("🔑 Using Gemini API Key:", GEMINI_API_KEY.substring(0, 20) + "...");

    // Use gemini-2.5-flash (same as AI service primary model)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    console.log("🌐 API Endpoint:", apiUrl.replace(GEMINI_API_KEY, "***"));

    return await axios.post(
      apiUrl,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000
      }
    );
  }, []);

  // Gemini-only AI call (DeepSeek fallback commented out)
  const callAIWithFallback = useCallback(async (prompt) => {
    try {
      console.log("🤖 Trying Gemini API...");
      const response = await callGeminiAPI(prompt);
      
      if (response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content) {
        const text = response.data.candidates[0].content.parts[0].text.trim();
        return { text, provider: 'Gemini' };
      } else {
        throw new Error("No valid response from Gemini API");
      }
    } catch (error) {
      console.log("❌ Gemini failed:", error.message);
      // DeepSeek fallback commented out
      // try {
      //   toast.info("🔄 Gemini unavailable, switching to DeepSeek...");
      //   const response = await callDeepSeekAPI(prompt);
      //   
      //   if (response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      //     const text = response.data.choices[0].message.content.trim();
      //     return { text, provider: 'DeepSeek' };
      //   } else {
      //     throw new Error("No valid response from DeepSeek API");
      //   }
      // } catch (deepseekError) {
      //   console.log("❌ DeepSeek also failed:", deepseekError.message);
      // }
      
      // Throw the Gemini error since no fallback
      throw error;
    }
  }, [callGeminiAPI, toast]);

  // Writing tips function as fallback when AI is unavailable
  const showWritingTips = useCallback(() => {
    const tips = [
      "Start with what problem your project solves",
      "Mention the technologies you'll use (React, Node.js, etc.)",
      "Describe the target audience or users",
      "Highlight what makes your project unique",
      "Include any learning goals or challenges",
      "Mention if you're looking for specific skills (design, backend, etc.)"
    ];
    
    const randomTips = tips.sort(() => 0.5 - Math.random()).slice(0, 3);
    const tipText = `💡 Writing Tips:\n\n• ${randomTips.join('\n• ')}\n\nExample: "A modern task management app built with React and Node.js, designed to help remote teams stay organized. Looking for developers with UI/UX design skills to create an intuitive user experience."`;
    
    toast.info(tipText, {
      autoClose: 8000,
      position: "top-center"
    });
  }, [toast]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      console.log("📝 Form data received:", data);
      console.log("🖼️ Project image field:", data.projectImage);
      
      // Convert image to base64 if present
      let projectImageBase64 = null;
      
      // Handle File object (not FileList anymore)
      if (data.projectImage instanceof File) {
        const file = data.projectImage;
        console.log("✅ Image file found:", file);
        
        projectImageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            console.log("📤 Base64 conversion complete, size:", reader.result.length);
            resolve(reader.result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        console.log("❌ No image file found in form data");
      }

      // Prepare data for submission
      const submitData = {
        title: data.title,
        description: data.description,
        goals: data.goals,
        timeline: data.timeline,
        requiredSkills: data.requiredSkills,
        techStack: data.techStack,
        maxMembers: data.maxMembers,
        motivation: data.motivation,
        projectImage: projectImageBase64, // Send base64 string
      };

      console.log("📦 Sending data to backend:", {
        ...submitData,
        projectImage: projectImageBase64 ? `base64 string (${projectImageBase64.length} chars)` : null
      });

      const response = await axios.post(`${API_URL}/project`, submitData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      toast.success("🎉 " + response.data.message);
      navigate(`/dashboard`);
    } catch (error) {
      console.error("❌ Project creation error:", error);
      toast.error(error.response?.data?.message || "Project creation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      // IMPORTANT: Store the actual File object, not the FileList reference
      // FileList is a live reference and can become empty
      setValue("projectImage", file);
    } else {
      setPreview(null);
      setValue("projectImage", null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setValue("projectImage", file); // Store File object, not FileList
        setPreview(URL.createObjectURL(file));
      }
    }
  };

  const removeImage = () => {
    setPreview(null);
    setValue("projectImage", null);
  };

  // Optimized AI rewrite function with Gemini only
  const rewriteWithAI = useCallback(async () => {
    console.log("🤖 AI Rewrite button clicked!"); // Debug log
    const currentValues = getValues();
    const currentDescription = currentValues.description;
    
    if (!currentDescription || currentDescription.trim().length < 10) {
      toast.error("Please enter at least 10 characters in the description before rewriting.");
      return;
    }

    try {
      // Check rate limiting before making API call
      checkRateLimit();
    } catch (rateLimitError) {
      toast.warning(rateLimitError.message);
      return;
    }

    setIsRewriting(true);
    
    try {
      const prompt = `Rewrite and enhance the following project description to make it more professional, engaging, and clear while maintaining the core idea and purpose. The project title is "${currentValues.title || 'Untitled Project'}".

Original description:
"${currentDescription}"

IMPORTANT: Return ONLY the rewritten description text. Do NOT include any introductory phrases like "Here is", "Here's", "Rewritten description:", or any explanations. Just return the improved description directly.

Requirements:
- More professional and well-structured
- Highlights key benefits and value propositions
- Uses engaging language that attracts collaborators
- Maintains the original intent and scope
- Concise but comprehensive (2-4 sentences)`;

      // Call Gemini AI only
      const result = await callAIWithFallback(prompt);
      
      // Clean up the response - remove any common prefixes or explanatory text
      const cleanedText = result.text
        .replace(/^(Rewritten description:|Here's the improved version:|Here's an enhanced version:|Here is the|Here's the|Here is your|Here's your|Sure,|Certainly,)/i, '')
        .replace(/^[:\s]+/, '') // Remove leading colons and whitespace
        .trim();
      
      // Set value and focus to end of text after AI update
      setValue("description", cleanedText, { 
        shouldValidate: true,
        shouldDirty: true 
      });
      
      // Focus and position cursor at end after AI rewrite
      setTimeout(() => {
        if (descriptionRef.current) {
          descriptionRef.current.focus();
          descriptionRef.current.setSelectionRange(cleanedText.length, cleanedText.length);
        }
      }, 100);
      
      toast.success(`✨ Description enhanced with Gemini AI!`);

    } catch (error) {
      handleAIError(error, "description");
    } finally {
      setIsRewriting(false);
    }
  }, [getValues, setValue, toast, checkRateLimit, callAIWithFallback, handleAIError]);

  // AI rewrite function for goals
  const rewriteGoalsWithAI = useCallback(async () => {
    console.log("🎯 AI Rewrite Goals button clicked!");
    const currentValues = getValues();
    const currentGoals = currentValues.goals;
    if (!currentGoals || currentGoals.trim().length < 10) {
      toast.error("Please enter at least 10 characters in the goals before rewriting.");
      return;
    }
    try { checkRateLimit(); } catch (e) { toast.warning(e.message); return; }
    setIsRewriting(true);
    try {
      const prompt = `Rewrite and enhance the following project goals for "${currentValues.title || 'Untitled Project'}". Return ONLY rewritten text. No intros.\n\nOriginal goals:\n"${currentGoals}"`;
      const result = await callAIWithFallback(prompt);
      const cleanedText = result.text.replace(/^(Rewritten goals:|Here's the version:)/i, '').replace(/^[:\s]+/, '').trim();
      setValue("goals", cleanedText, { shouldValidate: true, shouldDirty: true });
      setTimeout(() => {
        if (goalsRef.current) {
          goalsRef.current.focus();
          goalsRef.current.setSelectionRange(cleanedText.length, cleanedText.length);
        }
      }, 100);
      toast.success(`🎯 Goals enhanced with Gemini AI!`);
    } catch (error) {
      handleAIError(error, "goals");
    } finally {
      setIsRewriting(false);
    }
  }, [getValues, setValue, toast, checkRateLimit, callAIWithFallback, handleAIError]);

  // AI rewrite function for motivation
  const rewriteMotivationWithAI = useCallback(async () => {
    console.log("🚀 AI Rewrite Motivation button clicked!");
    const currentValues = getValues();
    const currentMotivation = currentValues.motivation;
    if (!currentMotivation || currentMotivation.trim().length < 10) {
      toast.error("Please enter at least 10 characters in the motivation before rewriting.");
      return;
    }
    try { checkRateLimit(); } catch (e) { toast.warning(e.message); return; }
    setIsRewriting(true);
    try {
      const prompt = `Rewrite and enhance the following project motivation for "${currentValues.title || 'Untitled Project'}". Return ONLY rewritten text. No intros.\n\nOriginal motivation:\n"${currentMotivation}"`;
      const result = await callAIWithFallback(prompt);
      const cleanedText = result.text.replace(/^(Rewritten motivation:|Here's the version:)/i, '').replace(/^[:\s]+/, '').trim();
      setValue("motivation", cleanedText, { shouldValidate: true, shouldDirty: true });
      setTimeout(() => {
        if (motivationRef.current) {
          motivationRef.current.focus();
          motivationRef.current.setSelectionRange(cleanedText.length, cleanedText.length);
        }
      }, 100);
      toast.success(`🚀 Motivation enhanced with Gemini AI!`);
    } catch (error) {
      handleAIError(error, "motivation");
    } finally {
      setIsRewriting(false);
    }
  }, [getValues, setValue, toast, checkRateLimit, callAIWithFallback, handleAIError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 text-orange-400" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2"
            >
              Create a New Project
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-lg"
            >
              Bring your ideas to life and collaborate with amazing people
            </motion.p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden"
          >
            <div className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-400" />
                    Basic Information
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField
                      label="Project Title"
                      name="title"
                      icon={Sparkles}
                      placeholder="Enter your project title"
                      required
                      register={register}
                      errors={errors}
                      validation={{
                        required: "Title is required",
                        minLength: { value: 3, message: "Title must be at least 3 characters" }
                      }}
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
                      min={1}
                      step={1}
                      validation={{
                        required: "Timeline is required",
                        valueAsNumber: true,
                        min: { value: 1, message: "Timeline must be at least 1 day" },
                        validate: (value) =>
                          Number.isInteger(value) || "Enter a whole number of days",
                      }}
                    />
                  </div>

                  <TextAreaField
                    label="Project Description"
                    name="description"
                    icon={FileText}
                    placeholder="Describe your project, its purpose, and what makes it special..."
                    required
                    rows={4}
                    showAIRewrite={true}
                    register={register}
                    errors={errors}
                    watchedDescription={watchedDescription}
                    watchedGoals={watchedGoals}
                    isRewriting={isRewriting}
                    aiDisabled={aiDisabled}
                    rewriteWithAI={rewriteWithAI}
                    rewriteGoalsWithAI={rewriteGoalsWithAI}
                    descriptionRef={descriptionRef}
                    goalsRef={goalsRef}
                    lastCursorPosition={lastCursorPosition}
                    lastGoalsCursorPosition={lastGoalsCursorPosition}
                    validation={{
                      required: "Description is required",
                      minLength: { value: 20, message: "Description must be at least 20 characters" }
                    }}
                  />

                  <TextAreaField
                    label="Goals & Objectives"
                    name="goals"
                    icon={Target}
                    placeholder="What do you want to achieve with this project?"
                    required
                    rows={3}
                    showAIRewrite={true}
                    register={register}
                    errors={errors}
                    watchedDescription={watchedDescription}
                    watchedGoals={watchedGoals}
                    isRewriting={isRewriting}
                    aiDisabled={aiDisabled}
                    rewriteWithAI={rewriteWithAI}
                    rewriteGoalsWithAI={rewriteGoalsWithAI}
                    descriptionRef={descriptionRef}
                    goalsRef={goalsRef}
                    lastCursorPosition={lastCursorPosition}
                    lastGoalsCursorPosition={lastGoalsCursorPosition}
                    validation={{
                      required: "Goals are required",
                      minLength: { value: 10, message: "Goals must be at least 10 characters" }
                    }}
                  />

                  <TextAreaField
                    label="Motivation"
                    name="motivation"
                    icon={Sparkles}
                    placeholder="Why should others join this project? What's the inspiring vision?"
                    required={false}
                    rows={3}
                    showAIRewrite={true}
                    register={register}
                    errors={errors}
                    watchedDescription={watchedDescription}
                    watchedGoals={watchedGoals}
                    watchedMotivation={watchedMotivation}
                    isRewriting={isRewriting}
                    aiDisabled={aiDisabled}
                    rewriteWithAI={rewriteWithAI}
                    rewriteGoalsWithAI={rewriteGoalsWithAI}
                    rewriteMotivationWithAI={rewriteMotivationWithAI}
                    descriptionRef={descriptionRef}
                    goalsRef={goalsRef}
                    motivationRef={motivationRef}
                    lastCursorPosition={lastCursorPosition}
                    lastGoalsCursorPosition={lastGoalsCursorPosition}
                    lastMotivationCursorPosition={lastMotivationCursorPosition}
                    validation={{
                      maxLength: { value: 500, message: "Motivation must be under 500 characters" }
                    }}
                  />
                </div>

                {/* Skills & Technology */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-orange-400" />
                    Skills & Technology
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField
                      label="Required Skills"
                      name="requiredSkills"
                      icon={Code}
                      placeholder="React, Node.js, Python, Design..."
                      register={register}
                      errors={errors}
                    />
                    
                    <InputField
                      label="Tech Stack"
                      name="techStack"
                      icon={Code}
                      placeholder="MongoDB, Express, React, Node.js..."
                      register={register}
                      errors={errors}
                    />
                  </div>
                </div>

                {/* Team & Media */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-400" />
                    Team & Media
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField
                      label="Maximum Team Members"
                      name="maxMembers"
                      type="number"
                      icon={Users}
                      placeholder="e.g., 5"
                      register={register}
                      errors={errors}
                      min={1}
                      max={8}
                      validation={{
                        valueAsNumber: true,
                        min: { value: 1, message: "At least 1 member required" },
                        max: { value: 8, message: "Maximum 8 members allowed" },
                      }}
                    />
                    
                    {/* Image Upload */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Image className="w-4 h-4 text-orange-400" />
                        Project Image
                      </label>
                      
                      {!preview ? (
                        <div
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer ${
                            dragActive 
                              ? 'border-orange-500 bg-orange-500/10' 
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            {...register("projectImage")}
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">
                              Drop an image here or <span className="text-orange-400">browse</span>
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg border-2 border-orange-500/50"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="pt-6 border-t border-gray-700/50"
                >
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-3 ${
                      isSubmitting
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-xl'
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
                        Creating Project...
                      </>
                    ) : (
                      <>
                        Create Project
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectCreation;
