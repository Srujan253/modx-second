import React, { useState, useRef, useEffect } from "react";
import apiClient from "../api/axiosInstance"; // Use your central API client
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, ArrowUp, Mic, Camera, Paperclip, MoreHorizontal, Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

const EXAMPLES = [
  "What are the rules for creating a project?",
  "Find projects related to healthcare technology.", 
  "What skills do I need for a Web3 project?",
  "How do I collaborate effectively with my team?",
  "Show me trending technologies in the platform",
  "Help me create a compelling project description"
];

const RECOMMENDATIONS = {
  "project": [
    "How to create a new project?",
    "What makes a good project description?",
    "How to find team members for my project?",
    "Project management best practices"
  ],
  "skill": [
    "What skills are most in demand?",
    "How to showcase my skills effectively?",
    "Skills needed for frontend development",
    "Skills required for backend development"
  ],
  "team": [
    "How to build an effective team?",
    "Best practices for team collaboration",
    "How to manage remote team members?",
    "Team communication strategies"
  ],
  "technology": [
    "Latest trending technologies",
    "Best technologies for web development",
    "Mobile app development technologies",
    "AI and machine learning tools"
  ],
  "collaboration": [
    "How to collaborate effectively?",
    "Best collaboration tools for developers",
    "Managing project deadlines",
    "Code review best practices"
  ],
  "portfolio": [
    "How to create an impressive portfolio?",
    "What projects should I include in my portfolio?",
    "Portfolio optimization tips",
    "Showcasing your work effectively"
  ],
  "career": [
    "Career guidance for developers",
    "How to advance in tech career?",
    "Remote work opportunities",
    "Freelancing vs full-time work"
  ]
};

const MODXChat = () => {
  const [messages, setMessages] = useState([
    {
      role: "model",
      content:
        "Hello! I'm **MODX Assistant**, your intelligent AI companion for navigating the MODX platform. I'm here to help you discover projects, connect with collaborators, and make the most of your development journey. What would you like to explore today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const messagesEndRef = useRef(null);

  // Effect to scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Smart recommendations based on input
  const getSmartRecommendations = (inputText) => {
    const text = inputText.toLowerCase();
    let suggestions = [];
    
    // Check for keywords and add relevant recommendations
    Object.keys(RECOMMENDATIONS).forEach(keyword => {
      if (text.includes(keyword)) {
        suggestions.push(...RECOMMENDATIONS[keyword]);
      }
    });

    // If no specific keyword matches, show general suggestions
    if (suggestions.length === 0 && text.length > 2) {
      // Add some general suggestions based on common patterns
      if (text.includes('how')) {
        suggestions.push(
          "How to get started with MODX?",
          "How to find the right project?",
          "How to improve my development skills?"
        );
      } else if (text.includes('what')) {
        suggestions.push(
          "What are the platform guidelines?",
          "What projects are trending?",
          "What skills should I learn next?"
        );
      } else if (text.includes('help')) {
        suggestions.push(
          "Help me understand the platform",
          "Help with project collaboration",
          "Help with technical decisions"
        );
      } else {
        // Default suggestions for any text
        suggestions.push(
          "Find similar projects in this domain",
          "Show best practices for this topic",
          "Connect me with experts in this area"
        );
      }
    }

    return suggestions.slice(0, 4); // Limit to 4 suggestions
  };

  // Handle input change with recommendations
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    
    if (value.trim().length > 1) {
      const suggestions = getSmartRecommendations(value);
      setRecommendations(suggestions);
      setShowRecommendations(suggestions.length > 0);
    } else {
      setShowRecommendations(false);
      setRecommendations([]);
    }
  };

  // Handle recommendation selection
  const selectRecommendation = (recommendation) => {
    setInput(recommendation);
    setShowRecommendations(false);
    setRecommendations([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);
    setInput("");
    setShowRecommendations(false);
    setRecommendations([]);

    try {
      // --- API CALL ---
      // Send the user's raw query to your intelligent backend
      const { data } = await apiClient.post("/ai/chat", {
        query: input,
      });

      // Simulate typing effect
      setTimeout(() => {
        const modelMessage = { role: "model", content: data.answer };
        setMessages((prev) => [...prev, modelMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (err) {
      toast.error("Error contacting the AI Assistant. Please try again.");
      // Add an error message to the chat
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment.",
        },
      ]);
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                MODX Assistant
              </h1>
            </div>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome Section - Only show when no messages except initial */}
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-gray-100 mb-4">
              Hello, I'm your MODX Assistant
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              I can help you navigate the MODX platform, find projects, connect with developers, and answer questions about collaboration and development.
            </p>
            
            {/* Example Prompts */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-8 max-w-4xl mx-auto">
              {EXAMPLES.map((example, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setInput(example)}
                  className="p-4 text-left bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-800 transition-all hover:shadow-md group"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {example}
                  </div>
                  <ArrowUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 rotate-45 opacity-0 group-hover:opacity-100 transition-all" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <div className="space-y-6 mb-6">
          <AnimatePresence mode="popLayout">
            {messages.slice(1).map((message, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group"
              >
                {message.role === "user" ? (
                  <div className="flex justify-end mb-4">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-3xl rounded-br-lg px-6 py-4 max-w-[80%]">
                      <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        <ReactMarkdown 
                          components={{
                            p: ({ children }) => (
                              <p className="text-gray-900 dark:text-gray-100 leading-relaxed mb-4 last:mb-0">
                                {children}
                              </p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-gray-900 dark:text-gray-100">
                                {children}
                              </strong>
                            ),
                            code: ({ children }) => (
                              <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl overflow-x-auto">
                                {children}
                              </pre>
                            )
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                          <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                          <ThumbsUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                          <ThumbsDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                          <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-1 py-4">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </motion.div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <form onSubmit={handleSubmit} className="relative">
            {/* Recommendations Dropdown */}
            <AnimatePresence>
              {showRecommendations && recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                      Suggestions
                    </div>
                    {recommendations.map((recommendation, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => selectRecommendation(recommendation)}
                        className="w-full text-left px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group flex items-center justify-between"
                      >
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {recommendation}
                        </span>
                        <ArrowUp className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 rotate-45 transition-all" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end gap-3 bg-gray-100 dark:bg-gray-900 rounded-3xl p-4 border border-gray-200 dark:border-gray-800 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
              {/* Attachment Button */}
              <button
                type="button"
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors flex-shrink-0"
                disabled={isLoading}
              >
                <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Text Input */}
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                    if (e.key === 'Escape') {
                      setShowRecommendations(false);
                    }
                  }}
                  onFocus={() => {
                    if (input.trim().length > 1) {
                      const suggestions = getSmartRecommendations(input);
                      setRecommendations(suggestions);
                      setShowRecommendations(suggestions.length > 0);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding recommendations to allow clicking
                    setTimeout(() => setShowRecommendations(false), 150);
                  }}
                  placeholder="Ask MODX Assistant anything..."
                  className="w-full bg-transparent resize-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 min-h-[24px] max-h-[120px]"
                  rows={1}
                  style={{ 
                    height: 'auto',
                    minHeight: '24px'
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  disabled={isLoading}
                />
              </div>

              {/* Voice Input Button */}
              <button
                type="button"
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors flex-shrink-0"
                disabled={isLoading}
              >
                <Mic className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Send Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!input.trim() || isLoading}
                className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                  input.trim() && !isLoading
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5" />
                )}
              </motion.button>
            </div>

            {/* Footer Text */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
              MODX Assistant can make mistakes. Consider checking important information.
            </p>
          </form>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="h-32"></div>
    </div>
  );
};

export default MODXChat;
