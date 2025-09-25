import React, { useState, useRef, useEffect } from "react";
import apiClient from "../api/axiosInstance"; // Use your central API client
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

const EXAMPLES = [
  "What are the rules for creating a project?",
  "Find projects related to healthcare technology.",
  "What skills do I need for a Web3 project?",
];

const MODXChat = () => {
  const [messages, setMessages] = useState([
    {
      role: "model",
      content:
        "Hello! I'm MentorBot, your AI guide for the MoDX platform. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Effect to scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput("");

    try {
      // --- API CALL ---
      // Send the user's raw query to your intelligent backend
      const { data } = await apiClient.post("/ai/chat", {
        query: input,
      });

      const modelMessage = { role: "model", content: data.answer };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (err) {
      toast.error("Error contacting the AI Mentor. Please try again.");
      // Add an error message to the chat
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Sorry, I seem to be having some trouble right now.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] max-w-2xl mx-auto bg-base-100 dark:bg-slate-800 rounded-2xl shadow-2xl border border-base-300 dark:border-slate-700">
      <div className="p-4 border-b dark:border-slate-700 flex items-center gap-3 justify-center">
        <Sparkles className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-base-content">AI Mentor</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${
                msg.role === "user" ? "justify-end" : ""
              }`}
            >
              {msg.role === "model" && (
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-content">
                  <Bot size={20} />
                </div>
              )}
              <div
                className={`prose dark:prose-invert max-w-[85%] px-4 py-2 rounded-xl ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-base-200 dark:bg-slate-700"
                }`}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center text-white">
                  <User size={20} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <span className="loading loading-dots loading-md text-slate-500"></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t dark:border-slate-700">
        <div className="flex flex-wrap gap-2 mb-2">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => setInput(ex)}
              className="btn btn-xs btn-ghost"
            >
              "{ex}"
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about projects, skills, or platform rules..."
            className="input input-bordered w-full"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn btn-primary btn-square"
            disabled={isLoading || !input.trim()}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MODXChat;
