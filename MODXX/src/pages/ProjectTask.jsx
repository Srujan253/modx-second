import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProjectTasks from "../components/ProjectTasks";
import MyTaskPanel from "../components/MyTaskPanel";
import ProjectTaskCharts from "../components/ProjectTaskCharts";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  UserCheck,
  Loader2,
  Settings,
  Target,
  Crown,
  Shield,
  User,
  Calendar,
  Clock,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Activity,
} from "lucide-react";
import { toast } from "react-toastify";

const ProjectTask = () => {
  // ...existing code...

  // Edit and delete handlers for tasks
  const handleEditTask = async (taskId, updates) => {
    try {
      const res = await axiosInstance.patch(
        `/project/${projectId}/tasks/${taskId}`,
        updates
      );
      toast.success("Task updated");
      // Optionally: trigger a refresh or callback
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  // Delete handler for tasks
  const handleDeleteTask = async (taskId) => {
    try {
      await axiosInstance.delete(`/project/${projectId}/tasks/${taskId}`);
      toast.success("Task deleted");
      // Optionally: trigger a refresh or callback
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const { projectId } = useParams();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("tasks"); // 'tasks' or 'overview'

  // Find current user's role in the project (after hooks)
  const myMember = members.find((m) => m.email === user?.email);
  const myRole = myMember?.role || "member";
  const isLeaderOrMentor = myRole === "leader" || myRole === "mentor";

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axiosInstance.get(`/project/${projectId}/members`);
        setMembers(res.data.members || []);
      } catch (err) {
        setMembers([]);
      }
      setLoading(false);
    };
    fetchMembers();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-gray-700 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-2 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse" }}
            ></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Loading Project Tasks
          </h3>
          <p className="text-gray-400">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "leader":
        return Crown;
      case "mentor":
        return Shield;
      default:
        return User;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "leader":
        return "text-yellow-400";
      case "mentor":
        return "text-blue-400";
      default:
        return "text-green-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-purple-500/3 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to={`/project/${projectId}`}
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-orange-400 transition-all duration-200"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Project Tasks</h1>
                <p className="text-gray-400">
                  Manage and track project progress
                </p>
              </div>
            </div>
            {/* You can add header actions here if needed */}
          </div>
          {/* View Toggle */}
          <div className="flex bg-gray-800/80 rounded-xl p-1 border border-gray-600/50 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView("tasks")}
              className={`px-4 py-2 rounded-lg transition-all font-medium ${
                activeView === "tasks"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Target size={16} className="mr-2 inline" />
              Tasks
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView("overview")}
              className={`px-4 py-2 rounded-lg transition-all font-medium ${
                activeView === "overview"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Users size={16} className="mr-2 inline" />
              Overview
            </motion.button>
          </div>
        </div>
      </motion.div>
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-8">
        <AnimatePresence mode="wait">
          {activeView === "tasks" ? (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              {/* Main Task Management Panel */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2"
              >
                <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
                  {/* Panel Header */}
                  <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 p-6 border-b border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                          <Settings className="text-orange-400 w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            Task Management
                          </h2>
                          <p className="text-gray-400 text-sm">
                            {isLeaderOrMentor
                              ? "Assign and manage all tasks"
                              : "View project tasks"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(myRole) && (
                          <div
                            className={`flex items-center gap-1 px-3 py-1 rounded-full bg-gray-700/50 ${getRoleColor(
                              myRole
                            )}`}
                          >
                            {React.createElement(getRoleIcon(myRole), {
                              size: 14,
                            })}
                            <span className="text-sm font-medium capitalize">
                              {myRole || "Member"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Task Content */}
                  <div className="p-6">
                    <ProjectTasks
                      projectId={projectId}
                      members={members}
                      showAssignForm={isLeaderOrMentor}
                      canEditDelete={isLeaderOrMentor}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                    />
                  </div>
                </div>
              </motion.div>

              {/* My Tasks Sidebar */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                {/* My Tasks Panel */}
                <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 p-4 border-b border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <UserCheck className="text-green-400 w-4 h-4" />
                      </div>
                      <h3 className="text-lg font-bold text-white">My Tasks</h3>
                    </div>
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto">
                    <MyTaskPanel projectId={projectId} />
                  </div>
                </div>

                {/* Quick Stats */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-blue-400 w-5 h-5" />
                    <h3 className="text-lg font-bold text-white">
                      Quick Stats
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-700/30 rounded-xl">
                      <div className="text-2xl font-bold text-orange-400">
                        {members.length}
                      </div>
                      <div className="text-xs text-gray-400">Team Size</div>
                    </div>
                    <div className="text-center p-3 bg-gray-700/30 rounded-xl">
                      <div className="text-2xl font-bold text-green-400">
                        {members.filter((m) => m.role === "leader").length}
                      </div>
                      <div className="text-xs text-gray-400">Leaders</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Team Overview */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 p-6 border-b border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Users className="text-blue-400 w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Team Overview
                      </h2>
                      <p className="text-gray-400">
                        Meet your project collaborators
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map((member, index) => {
                      const RoleIcon = getRoleIcon(member.role);
                      return (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30 hover:border-orange-500/30 transition-all duration-300 group"
                        >
                          {/* Member Avatar */}
                          <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-orange-500/25 transition-shadow">
                              <span className="text-white font-bold text-lg">
                                {member.name?.charAt(0) || "U"}
                              </span>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                              {member.name || "Unknown User"}
                            </h3>

                            <div
                              className={`flex items-center gap-1 px-3 py-1 rounded-full bg-gray-800/50 ${getRoleColor(
                                member.role
                              )} mb-3`}
                            >
                              <RoleIcon size={12} />
                              <span className="text-xs font-medium capitalize">
                                {member.role || "Member"}
                              </span>
                            </div>

                            {member.email && (
                              <p className="text-gray-400 text-sm truncate w-full">
                                {member.email}
                              </p>
                            )}
                          </div>

                          {/* Member Status Indicator */}
                          <div className="mt-4 pt-4 border-t border-gray-600/30">
                            <div className="flex items-center justify-center gap-2 text-green-400">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-xs">Active</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {members.length === 0 && (
                    <div className="text-center py-12">
                      <Users size={48} className="text-gray-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-400 mb-2">
                        No team members found
                      </h3>
                      <p className="text-gray-500">
                        This project doesn't have any members yet.
                      </p>
                    </div>
                  )}
                  {/* Task Analytics Charts & Table - moved here for correct placement */}
                  <ProjectTaskCharts projectId={projectId} members={members} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProjectTask;
