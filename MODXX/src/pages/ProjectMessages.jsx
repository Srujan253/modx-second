import React, { useEffect, useState, useRef, useCallback } from "react";
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
  MoreVertical,
  Hash,
  Sparkles
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { toast } from "react-toastify";

import { API_URL } from "../api/axiosInstance";

const ProjectMessages = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [projectInfo, setProjectInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch initial messages and project info
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        console.log("🔍 Fetching messages for project:", projectId);
        console.log("📡 API URL:", `${API_URL}/messages/${projectId}/messages`);
        
        const { data } = await axios.get(
          `${API_URL}/messages/${projectId}/messages`,
          {
            withCredentials: true,
          }
        );
        
        console.log("✅ Messages response:", data);
        console.log("📊 Number of messages:", data.messages?.length || 0);
        
        setMessages(data.messages || []);
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
        console.error("📋 Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
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
  }, [projectId]);

  // Memoized message handler to prevent unnecessary re-renders
  const handleNewMessage = useCallback((message) => {
    console.log("📨 New message received:", message);
    setMessages((prev) => [...prev, message]);
  }, []);

  // Socket.IO real-time messaging
  useEffect(() => {
    if (!socket) {
      console.log("⚠️ Socket not available yet");
      return;
    }

    console.log(`🔌 Joining project room: ${projectId}`);
    socket.emit("join-project", projectId);

    // Use the memoized handler
    socket.on("new-message", handleNewMessage);

    return () => {
      console.log(`🚪 Leaving project room: ${projectId}`);
      socket.emit("leave-project", projectId);
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, projectId, handleNewMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    
    console.log("🔍 Send button clicked");
    console.log("Socket available:", !!socket);
    console.log("Message:", newMessage);
    
    if (!newMessage.trim()) {
      console.log("⚠️ Message is empty");
      return;
    }
    
    if (!socket) {
      console.log("❌ Socket not connected!");
      toast.error("Not connected to chat server. Please refresh the page.");
      return;
    }
    
    setSending(true);
    try {
      console.log("📤 Sending message via socket...");
      socket.emit("send-message", {
        projectId,
        message_text: newMessage,
      });
      console.log("✅ Message sent to socket");
      
      setNewMessage("");
      inputRef.current?.focus();
    } catch (err) {
      console.error("❌ Error sending message:", err);
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
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const MessageBubble = ({ msg, isOwn }) => (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex items-end gap-3 mb-4 ${isOwn ? "justify-end" : "justify-start"}`}
    >
      {!isOwn && (
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-purple-500/20"
        >
          {msg.sender_name?.[0]?.toUpperCase()}
        </motion.div>
      )}

      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
        {!isOwn && (
          <span className="text-xs font-semibold text-slate-400 mb-1.5 ml-1 tracking-wide">
            {msg.sender_name}
          </span>
        )}

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.2 }}
          className={`
            relative px-5 py-3 shadow-xl group
            ${isOwn 
              ? "bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white rounded-3xl rounded-br-sm" 
              : "bg-gradient-to-br from-slate-800 to-slate-700 text-slate-50 rounded-3xl rounded-bl-sm border border-slate-600/30"
            }
          `}
        >
          {/* Subtle glow effect */}
          <div className={`absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${isOwn ? "bg-orange-400" : "bg-purple-400"}`} />
          
          <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap relative z-10">
            {msg.message_text}
          </p>

          <div className={`flex items-center justify-end mt-1.5 gap-1 ${isOwn ? "opacity-70" : "opacity-50"}`}>
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-semibold tracking-wide">
              {formatTime(msg.sent_at)}
            </span>
          </div>
        </motion.div>
      </div>

      {isOwn && (
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-orange-500/20"
        >
          {user?.name?.[0]?.toUpperCase() || "Y"}
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="flex flex-col h-screen max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 px-6 py-5 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/project-messages"
                className="group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2.5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 transition-all duration-300 shadow-lg border border-slate-600/30"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
                </motion.div>
              </Link>
              
              <div className="flex items-center space-x-4">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 flex items-center justify-center text-white font-bold shadow-2xl ring-2 ring-orange-500/30"
                >
                  <Hash className="w-6 h-6" />
                </motion.div>
                
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    {projectInfo?.title || "Project Chat"}
                    <Sparkles className="w-4 h-4 text-orange-400" />
                  </h1>
                  <div className="flex items-center text-slate-400 text-sm mt-0.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    <span className="font-medium">{projectInfo?.memberCount || 0} members active</span>
                  </div>
                </div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 transition-all duration-300 shadow-lg border border-slate-600/30"
            >
              <MoreVertical className="w-5 h-5 text-slate-300" />
            </motion.button>
          </div>
        </motion.div>

        {/* Messages Container */}
        <div className="flex-1 overflow-hidden px-6 bg-gradient-to-b from-slate-900/50 to-slate-900/80 backdrop-blur-sm">
          <div className="h-full overflow-y-auto py-8 space-y-1 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-600/70">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-slate-400 font-medium">Loading messages...</p>
                  </div>
                </motion.div>
              ) : messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center mb-6 shadow-2xl border border-slate-600/30"
                  >
                    <MessageCircle className="w-10 h-10 text-slate-500" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                    No messages yet
                  </h3>
                  <p className="text-slate-400 max-w-md leading-relaxed">
                    Start the conversation! Send the first message to get things going.
                  </p>
                </motion.div>
              ) : (
                messages.map((msg) => {
                  const isOwn = String(msg.sender_id) === String(user?.id || user?._id);
                  if (messages.indexOf(msg) === 0) {
                    console.log("🔍 Message ownership check:");
                    console.log("  msg.sender_id:", msg.sender_id, typeof msg.sender_id);
                    console.log("  user.id:", user?.id, typeof user?.id);
                    console.log("  user._id:", user?._id, typeof user?._id);
                    console.log("  isOwn:", isOwn);
                  }
                  
                  return (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      isOwn={isOwn}
                    />
                  );
                })
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-b from-slate-900/80 to-slate-950/95 backdrop-blur-xl border-t border-slate-700/50 px-6 py-5 shadow-2xl"
        >
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all duration-300 shadow-lg border border-slate-600/30"
            >
              <Paperclip className="w-5 h-5 text-slate-400" />
            </motion.button>

            <div className="flex-1 relative group">
              <input
                ref={inputRef}
                type="text"
                className="w-full px-5 py-3.5 bg-slate-800/80 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 shadow-lg group-hover:border-slate-500/50"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
              />
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all duration-300 shadow-lg border border-slate-600/30"
            >
              <Smile className="w-5 h-5 text-slate-400" />
            </motion.button>
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!newMessage.trim() || sending}
              className="p-4 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-slate-700 disabled:to-slate-800 text-white rounded-2xl font-medium transition-all duration-300 disabled:cursor-not-allowed shadow-2xl disabled:shadow-none ring-2 ring-orange-500/20 disabled:ring-0"
            >
              {sending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-5 h-5" />
                </motion.div>
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