import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Loader2, 
  ArrowLeft, 
  MessageCircle, 
  Users, 
  Clock,
  Smile,
  Paperclip,
  MoreVertical
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const ProjectMessages = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [projectInfo, setProjectInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let intervalId;
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/messages/${projectId}/messages`,
          {
            withCredentials: true,
          }
        );
        setMessages(data.messages);
      } catch (err) {
        toast.error("Failed to load messages.");
      } finally {
        setLoading(false);
      }
    };

    const fetchProjectInfo = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/project/${projectId}`,
          {
            withCredentials: true,
          }
        );
        setProjectInfo(data.project);
      } catch (err) {
        console.error("Failed to load project info");
      }
    };

    fetchMessages();
    fetchProjectInfo();
    intervalId = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(intervalId);
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      await axios.post(
        `${API_URL}/messages/${projectId}/messages`,
        { message_text: newMessage },
        { withCredentials: true }
      );
      setNewMessage("");
      // Reload messages
      const { data } = await axios.get(
        `${API_URL}/messages/${projectId}/messages`,
        {
          withCredentials: true,
        }
      );
      setMessages(data.messages);
      inputRef.current?.focus();
    } catch (err) {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const MessageBubble = ({ msg, isOwn }) => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`max-w-[70%] ${isOwn ? "order-2" : "order-1"}`}>
        {!isOwn && (
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-2">
              {msg.sender_name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {msg.sender_name}
            </span>
          </div>
        )}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`relative px-4 py-3 rounded-2xl shadow-lg ${
            isOwn
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-md"
              : "bg-gray-700 text-gray-100 rounded-bl-md"
          }`}
        >
          <p className="text-sm leading-relaxed break-words">
            {msg.message_text}
          </p>
          <div className={`flex items-center justify-end mt-2 space-x-1 ${
            isOwn ? "text-orange-100" : "text-gray-400"
          }`}>
            <Clock className="w-3 h-3" />
            <span className="text-xs">
              {formatTime(msg.sent_at)}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <div className="flex flex-col h-screen max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/project-messages"
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {projectInfo?.title?.[0]?.toUpperCase() || "P"}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {projectInfo?.title || "Project Chat"}
                  </h1>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{projectInfo?.memberCount || 0} members</span>
                  </div>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-300" />
            </motion.button>
          </div>
        </motion.div>

        {/* Messages Container */}
        <div className="flex-1 overflow-hidden px-6">
          <div className="h-full overflow-y-auto py-6 space-y-1">
            <AnimatePresence>
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-64"
                >
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading messages...</p>
                  </div>
                </motion.div>
              ) : messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-64 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No messages yet
                  </h3>
                  <p className="text-gray-400 max-w-md">
                    Start the conversation! Send the first message to get things going.
                  </p>
                </motion.div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isOwn={msg.sender_id === user.id}
                  />
                ))
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/80 backdrop-blur-sm border-t border-gray-700/50 px-6 py-4"
        >
          <form onSubmit={handleSend} className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!newMessage.trim() || sending}
              className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-medium transition-all disabled:cursor-not-allowed shadow-lg"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectMessages;
