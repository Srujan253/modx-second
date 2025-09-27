import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  Send,
  Eye,
  Star,
  Mail,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronDown,
  User,
  Badge,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const ApplyJoinSystem = () => {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState([]); // Projects created by user
  const [potentialMembers, setPotentialMembers] = useState([]); // Users to invite
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Fetch projects created by the user (leader)
    axios
      .get(`${API_URL}/project/user-projects`, { withCredentials: true })
      .then((res) => setMyProjects(res.data.projects || []))
      .catch(() => toast.error("Failed to fetch your projects."));
  }, [user]);

  const handleSelectProject = async (projectId) => {
    setSelectedProject(projectId);
    setLoading(true);
    try {
      // Fetch users who are not already members of this project
      const { data } = await axios.get(
        `${API_URL}/project/${projectId}/potential-members`,
        { withCredentials: true }
      );
      setPotentialMembers(data.users || []);
    } catch {
      toast.error("Failed to fetch potential members.");
    }
    setLoading(false);
  };

  const handleSendInvite = async (userId) => {
    try {
      await axios.post(
        `${API_URL}/project/${selectedProject}/invite`,
        { userId },
        { withCredentials: true }
      );
      toast.success("Invitation sent!");
      setPotentialMembers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      toast.error("Failed to send invite.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-6xl mx-auto"
        >
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full backdrop-blur-sm border border-orange-500/30">
                <Users className="w-8 h-8 text-orange-500" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                Find & Invite Members
              </h1>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover talented individuals and build your dream team with our
              intelligent member discovery system
            </p>
          </motion.div>

          {/* Project Selection Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Search className="w-5 h-5 text-orange-500" />
                </div>
                <label className="text-xl font-semibold text-white">
                  Select Your Project
                </label>
              </div>

              <div className="relative">
                <select
                  className="w-full p-4 rounded-xl bg-gray-700/50 backdrop-blur-sm text-white border border-gray-600/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 appearance-none cursor-pointer hover:bg-gray-700/70"
                  value={selectedProject || ""}
                  onChange={(e) => handleSelectProject(e.target.value)}
                >
                  <option value="" disabled>
                    🎯 Choose a project to find team members...
                  </option>
                  {myProjects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl px-6 py-4">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-300 text-lg">
                    Discovering potential team members...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Members Grid */}
          <AnimatePresence>
            {selectedProject && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-400">
                    Potential Team Members
                  </h3>
                  <div className="bg-green-500/20 px-3 py-1 rounded-full">
                    <span className="text-green-400 text-sm font-medium">
                      {potentialMembers.length} Found
                    </span>
                  </div>
                </div>

                {potentialMembers.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center shadow-xl"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700/50 rounded-full mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-300 mb-2">
                      No Available Members
                    </h4>
                    <p className="text-gray-500">
                      All suitable members have been invited or no matches found
                      for this project.
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {potentialMembers.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-orange-500/30 transition-all duration-300 group"
                      >
                        {/* Member Avatar & Status */}
                        <div className="relative mb-4">
                          <div className="relative inline-block">
                            <img
                              src={`https://ui-avatars.com/api/?name=${member.full_name.replace(
                                " ",
                                "+"
                              )}&background=random&color=FFF`}
                              alt={member.full_name}
                              className="w-20 h-20 rounded-full border-4 border-orange-500/30 group-hover:border-orange-500/60 transition-all duration-300 shadow-lg"
                            />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Member Info */}
                        <div className="text-center mb-4">
                          <h4 className="text-lg font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                            {member.full_name}
                          </h4>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Badge className="w-4 h-4 text-orange-400" />
                            <p className="text-sm text-gray-400">
                              {member.skills?.slice(0, 2).join(", ") ||
                                "No skills listed"}
                              {member.skills?.length > 2 &&
                                ` +${member.skills.length - 2} more`}
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-400">
                              4.8 Rating
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <Link
                            to={`/profile/${member.id}`}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-xl transition-all duration-200 group/btn"
                          >
                            <Eye className="w-4 h-4 group-hover/btn:text-orange-400 transition-colors" />
                            View Profile
                          </Link>

                          <motion.button
                            onClick={() => handleSendInvite(member.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl group/btn"
                          >
                            <Send className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                            Send Invite
                          </motion.button>
                        </div>

                        {/* Hover Effect Glow */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ApplyJoinSystem;
