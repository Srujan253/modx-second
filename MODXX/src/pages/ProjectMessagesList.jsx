import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Users, Clock, ArrowRight, Loader2 } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const ProjectMessagesList = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Get all projects where user is a member (accepted)
        const { data } = await axiosInstance.get("/project/memberships");
        setProjects(data.accepted || []);
      } catch (err) {
        toast.error("Failed to load your projects.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-orange-500/30"
          >
            <MessageCircle className="w-8 h-8 text-orange-400" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2">
            Project Messages
          </h1>
          <p className="text-gray-400 text-lg">
            Connect with your project teams
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mb-4"
                >
                  <Loader2 className="w-10 h-10 text-orange-500" />
                </motion.div>
                <p className="text-gray-400 text-lg">Loading your projects...</p>
              </motion.div>
            ) : projects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-700/50 rounded-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  No Projects Yet
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  You are not a member of any projects. Join a project to start messaging with your team!
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group"
                  >
                    <Link
                      to={`/project-messages/${project.id}`}
                      className="block"
                    >
                      <div className="bg-gray-700/50 hover:bg-gray-700/70 rounded-xl p-4 border border-gray-600/50 hover:border-orange-500/50 transition-all duration-300 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                          {/* Project Avatar */}
                          <div className="relative">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                              {project.title?.[0]?.toUpperCase() || "P"}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800 animate-pulse"></div>
                          </div>

                          {/* Project Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-white truncate group-hover:text-orange-400 transition-colors">
                                {project.title}
                              </h3>
                              <MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            </div>
                            <p className="text-gray-400 text-sm truncate mb-2">
                              {project.description?.slice(0, 60) || "No description available."}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>Active now</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <motion.div
                            whileHover={{ x: 5 }}
                            className="flex items-center space-x-2 text-orange-400 group-hover:text-orange-300"
                          >
                            <span className="text-sm font-medium hidden sm:block">Open Chat</span>
                            <ArrowRight className="w-5 h-5" />
                          </motion.div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Stats */}
        {!loading && projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <p className="text-gray-400">
              {projects.length} project{projects.length !== 1 ? 's' : ''} available for messaging
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProjectMessagesList;