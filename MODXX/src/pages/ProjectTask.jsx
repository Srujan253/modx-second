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
import Modal from "../components/Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ProjectTask = () => {
  // Remove member handler (for leader)
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  // Remove member handler (for leader)
  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await axiosInstance.delete(`project/${projectId}/members/${memberToRemove}`);
      toast.success("Member removed");
      // Refresh members
      const res = await axiosInstance.get(`project/${projectId}/members`);
      setMembers(res.data.members || []);
    } catch (err) {
      toast.error("Failed to remove member");
    } finally {
      setMemberToRemove(null);
    }
  };

  const triggerRemoveMember = (memberId) => {
    setMemberToRemove(memberId);
    setIsRemoveModalOpen(true);
  };
  // ...existing code...

  // Edit and delete handlers for tasks
  const handleEditTask = async (taskId, updates) => {
    try {
      const res = await axiosInstance.patch(
        `project/${projectId}/tasks/${taskId}`,
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
      await axiosInstance.delete(`project/${projectId}/tasks/${taskId}`);
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
        const res = await axiosInstance.get(`project/${projectId}/members`);
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
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="w-32 h-10 rounded-xl" />
          </div>
          <Skeleton className="w-64 h-12 rounded-xl" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="w-full h-[60vh] rounded-2xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="w-full h-64 rounded-2xl" />
              <Skeleton className="w-full h-32 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case "leader":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-black uppercase text-[10px] tracking-widest px-3 py-1">
            <Crown size={10} className="mr-1.5" /> Core Leader
          </Badge>
        );
      case "mentor":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-black uppercase text-[10px] tracking-widest px-3 py-1">
            <Shield size={10} className="mr-1.5" /> Project Mentor
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-800/50 text-gray-400 border-gray-700/50 font-black uppercase text-[10px] tracking-widest px-3 py-1">
            <User size={10} className="mr-1.5" /> Unit Member
          </Badge>
        );
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

      <div className="relative z-10 border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <Button
                asChild
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-2xl bg-gray-800 border-gray-700 hover:border-orange-500/50 group"
              >
                <Link to={`/project/${projectId}`}>
                  <ArrowLeft size={20} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">MISSION CONTROL</h1>
                <p className="text-gray-500 font-bold text-xs tracking-widest uppercase">
                  PROJECT ID: {projectId?.substring(0, 8) || "UNKNOWN"} // STATUS: OPERATIONAL
                </p>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex bg-gray-950 p-1.5 rounded-2xl border border-gray-800 shadow-inner">
              <Button
                onClick={() => setActiveView("tasks")}
                variant={activeView === "tasks" ? "default" : "ghost"}
                className={cn(
                  "h-10 px-6 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all",
                  activeView === "tasks" ? "bg-orange-500 text-white shadow-[0_4px_0_rgb(153,27,27)]" : "text-gray-500 hover:text-white"
                )}
              >
                <Target size={14} className="mr-2" /> Task Grid
              </Button>
              <Button
                onClick={() => setActiveView("overview")}
                variant={activeView === "overview" ? "default" : "ghost"}
                className={cn(
                  "h-10 px-6 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all",
                  activeView === "overview" ? "bg-orange-500 text-white shadow-[0_4px_0_rgb(153,27,27)]" : "text-gray-500 hover:text-white"
                )}
              >
                <Users size={14} className="mr-2" /> Unit Overview
              </Button>
            </div>
          </div>
        </div>
      </div>
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
                <Card className="bg-gray-900 border-gray-800 shadow-2xl overflow-hidden">
                  <CardHeader className="bg-orange-500/5 border-b border-gray-800 p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                          <Settings className="text-orange-500 w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-black italic tracking-tighter text-white uppercase">
                            COMMAND INTERFACE
                          </CardTitle>
                          <p className="text-gray-500 font-bold text-[10px] tracking-widest uppercase mt-1">
                            {isLeaderOrMentor ? "System Authorization Enabled" : "Read-Only Terminal"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(myRole)}
                      </div>
                    </div>
                  </CardHeader>

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
                </Card>
              </motion.div>

              {/* My Tasks Sidebar */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                {/* My Tasks Panel */}
                <Card className="bg-gray-900 border-gray-800 shadow-2xl overflow-hidden">
                  <CardHeader className="bg-green-500/5 border-b border-gray-800 p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-xl border border-green-500/20">
                        <UserCheck className="text-green-500 w-4 h-4" />
                      </div>
                      <CardTitle className="text-sm font-black uppercase tracking-widest text-white italic">MY DEPLOYMENTS</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 max-h-96 overflow-y-auto">
                    <MyTaskPanel projectId={projectId} />
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="bg-gray-900 border-gray-800 p-6 shadow-2xl group border-2 border-transparent hover:border-orange-500/20 transition-all duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-500/10 rounded-xl">
                      <Activity className="text-orange-500 w-5 h-5" />
                    </div>
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-white italic">TELEMETRY</CardTitle>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-800/50 rounded-2xl border border-gray-700/30">
                      <div className="text-3xl font-black italic tracking-tighter text-orange-500">
                        {members.length}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">UNITS</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 rounded-2xl border border-gray-700/30">
                      <div className="text-3xl font-black italic tracking-tighter text-blue-500">
                        {members.filter((m) => m.role === "mentor").length}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">MASTERS</div>
                    </div>
                  </div>
                </Card>
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
              <Card className="bg-gray-900 border-gray-800 shadow-2xl overflow-hidden">
                <CardHeader className="bg-blue-500/5 border-b border-gray-800 p-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500">
                      <Users size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black italic tracking-tighter text-white uppercase">
                        UNIT DIRECTORY
                      </CardTitle>
                      <p className="text-gray-500 font-bold text-[10px] tracking-widest uppercase mt-1">
                        Active Personnel Status and Telemetry
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {members.map((member, index) => (
                      <Card
                        key={member.id}
                        className="bg-gray-800/30 border-gray-700/50 hover:border-orange-500/30 transition-all duration-500 group relative overflow-hidden"
                      >
                        <CardContent className="p-6">
                           {/* Member Avatar */}
                           <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center mb-4 border-2 border-gray-700 group-hover:border-orange-500 transition-all duration-500 relative">
                              <span className="text-white font-black italic tracking-tighter text-2xl uppercase">
                                {member.full_name?.charAt(0) || "U"}
                              </span>
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900" />
                            </div>

                            <h3 className="text-lg font-black italic tracking-tighter text-white uppercase mb-2 group-hover:text-orange-500 transition-colors">
                              {member.full_name || "Unknown Unit"}
                            </h3>
                            
                            <div className="mb-4">
                              {getRoleBadge(member.role)}
                            </div>

                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6 truncate w-full">
                              {member.email}
                            </p>

                            {isLeaderOrMentor && myRole === "leader" && member.role !== "leader" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full bg-red-500/5 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-[9px] h-8"
                                onClick={() => triggerRemoveMember(member.id)}
                              >
                                Terminate Access
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {members.length === 0 && (
                    <div className="text-center py-24 bg-gray-950/50 rounded-[3rem] border-2 border-dashed border-gray-800">
                      <Users size={48} className="text-gray-700 mx-auto mb-6" />
                      <h3 className="text-2xl font-black italic tracking-tighter text-gray-500 mb-2 uppercase">
                        Zero Units Detected
                      </h3>
                      <p className="text-gray-600 font-medium">
                        Deployment matrix is currently vacant.
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-8 border-t border-gray-800">
                    <ProjectTaskCharts projectId={projectId} members={members} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Modal
        isOpen={isRemoveModalOpen}
        onClose={() => {
          setIsRemoveModalOpen(false);
          setMemberToRemove(null);
        }}
        onConfirm={handleRemoveMember}
        title="Remove Team Member"
        message="Are you sure you want to remove this member from the project team? They will lose access to all project tasks and messages."
        confirmText="Remove Member"
      />
    </div>
  );
};

export default ProjectTask;
