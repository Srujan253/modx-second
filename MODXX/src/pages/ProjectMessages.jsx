import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
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
  const messagesEndRef = useRef(null);

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
    fetchMessages();
    intervalId = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(intervalId);
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
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
    } catch (err) {
      toast.error("Failed to send message.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-orange-400 mb-4">Project Chat</h2>
      <div className="h-80 overflow-y-auto bg-gray-800 rounded p-4 mb-4 flex flex-col">
        {loading ? (
          <div className="text-gray-400">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500">No messages yet.</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-3 flex flex-col ${
                msg.sender_id === user.id ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs ${
                  msg.sender_id === user.id
                    ? "bg-orange-500 text-white"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                <span className="font-semibold text-xs">
                  {msg.sender_name} {msg.sender_id === user.id && "(You)"}
                </span>
                <div className="text-sm mt-1">{msg.message_text}</div>
              </div>
              <span className="text-xs text-gray-400 mt-1">
                {new Date(msg.sent_at).toLocaleString()}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded bg-gray-700 text-white focus:outline-none"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ProjectMessages;
