import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Search, 
  Shield, 
  User,
  ExternalLink,
  Target,
  AlertCircle,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// (Import moved up or handled by axiosInstance)

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [activeTab, setActiveTab] = useState("users"); // "users" or "projects"
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // Can be user or project
  const [deleteType, setDeleteType] = useState("user"); // "user" or "project"

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, projectsRes] = await Promise.all([
        axiosInstance.get("admin/users"),
        axiosInstance.get("admin/projects")
      ]);
      
      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
      }
      if (projectsRes.data.success) {
        setProjects(projectsRes.data.projects);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePromote = async (userId) => {
    try {
      const { data } = await axiosInstance.patch(
        `admin/users/${userId}/promote`,
        {}
      );
      if (data.success) {
        toast.success(data.message);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to promote user.");
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const endpoint = deleteType === "user" 
        ? `admin/users/${itemToDelete._id}` 
        : `admin/projects/${itemToDelete._id}`;
        
      const { data } = await axiosInstance.delete(endpoint);
      
      if (data.success) {
        toast.success(deleteType === "user" ? "User deleted successfully." : "Project deleted successfully.");
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to delete ${deleteType}.`);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredProjects = projects.filter((p) => {
    return p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           p.leader_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const stats = {
    totalUsers: users.length,
    totalProjects: projects.length,
    admins: users.filter(u => u.role === 'admin').length,
    members: users.filter(u => u.role !== 'admin').length
  };

  // Stats are derived from users/projects, so they also depend on loading state
  const isStatsLoading = loading && users.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white p-4 sm:p-6 lg:p-8 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-orange-500 w-8 h-8" />
            <h1 className="text-3xl font-bold italic tracking-tighter">ADMIN <span className="text-orange-500 underline decoration-2 underline-offset-4">DASHBOARD</span></h1>
          </div>
          <p className="text-gray-400">Manage platform users, permissions, and projects</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.totalUsers, icon: Users, color: "orange" },
            { label: "Total Projects", value: stats.totalProjects, icon: Target, color: "purple" },
            { label: "Admins", value: stats.admins, icon: Shield, color: "blue" },
            { label: "Members", value: stats.members, icon: User, color: "green" }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl flex items-center justify-between"
            >
              <div>
                <p className="text-gray-400 text-xs font-black uppercase tracking-wider">{stat.label}</p>
                {isStatsLoading ? (
                  <Skeleton className="h-9 w-12 mt-1" />
                ) : (
                  <p className="text-3xl font-black mt-1">{stat.value}</p>
                )}
              </div>
              <div className={cn("p-3 rounded-xl", `bg-${stat.color}-500/10`)}>
                <stat.icon className={cn("w-6 h-6", `text-${stat.color}-500`)} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tab Controls */}
        <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700/50 mb-8 self-start w-fit">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-all ${
              activeTab === "users" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-gray-400 hover:text-white"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-all ${
              activeTab === "projects" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-gray-400 hover:text-white"
            }`}
          >
            Projects
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder={activeTab === "users" ? "Search by name or email..." : "Search by title or leader..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/50 border-2 border-gray-700/50 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-600 font-medium"
            />
          </div>
          {activeTab === "users" && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-gray-800/50 border-2 border-gray-700/50 rounded-xl py-2.5 px-4 outline-none focus:border-orange-500 transition-all font-black uppercase tracking-widest text-xs w-full md:w-40"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="bg-gray-800/30 backdrop-blur-sm border-2 border-gray-700/30 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-6 p-4 bg-gray-900/40 rounded-xl border border-gray-800">
                    <Skeleton className="w-12 h-12 rounded-2xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <Skeleton className="w-10 h-10 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTab === "users" ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-800/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-gray-700/50">
                    <th className="px-6 py-5">User Profile</th>
                    <th className="px-6 py-5">Authorization</th>
                    <th className="px-6 py-5">History</th>
                    <th className="px-6 py-5 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30 font-medium tracking-tight">
                  <AnimatePresence>
                    {filteredUsers.map((u) => (
                      <motion.tr
                        key={u._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center font-black text-orange-500 border-2 border-gray-700 shadow-xl group-hover:border-orange-500/50 transition-all">
                              {u.fullName?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-black text-sm">{u.fullName}</p>
                              <p className="text-gray-500 text-xs font-bold">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {u.role === 'admin' ? (
                            <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-black uppercase text-[10px] tracking-widest px-3 py-1">
                              <Shield size={10} className="mr-1.5" /> Admin Access
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-700/50 text-gray-400 border-gray-600/30 font-black uppercase text-[10px] tracking-widest px-3 py-1">
                              Standard User
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-gray-300 text-xs font-black uppercase tracking-tighter">Joined On</span>
                            <span className="text-gray-500 text-[10px] font-bold">{new Date(u.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.role !== 'admin' && (
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handlePromote(u._id)}
                                className="bg-blue-500/5 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 border-transparent hover:border-blue-500/20"
                                title="Promote to Admin"
                              >
                                <UserPlus size={18} />
                              </Button>
                            )}
                            {u._id !== currentUser.id && (
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                  setItemToDelete(u);
                                  setDeleteType("user");
                                  setIsDeleteModalOpen(true);
                                }}
                                className="bg-red-500/5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 border-transparent hover:border-red-500/20"
                                title="Delete User"
                              >
                                <Trash2 size={18} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-800/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-gray-700/50">
                    <th className="px-6 py-5">Project Details</th>
                    <th className="px-6 py-5">Lead Strategist</th>
                    <th className="px-6 py-5">Deployment</th>
                    <th className="px-6 py-5 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30 font-medium tracking-tight">
                  <AnimatePresence>
                    {filteredProjects.map((p) => (
                      <motion.tr
                        key={p._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center font-black text-purple-500 border-2 border-gray-700 shadow-xl group-hover:border-purple-500/50 transition-all">
                              <Target size={20} />
                            </div>
                            <div>
                              <p className="text-white font-black text-sm">{p.title}</p>
                              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{p.member_count} Members Active</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-bold text-sm">{p.leader_name}</p>
                          <p className="text-gray-500 text-xs font-medium italic">{p.leader_email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-gray-300 text-xs font-black uppercase tracking-tighter">Established</span>
                            <span className="text-gray-500 text-[10px] font-bold">{new Date(p.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => window.open(`/project/${p._id}`, '_blank')}
                              className="bg-orange-500/5 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 border-transparent hover:border-orange-500/20"
                              title="View Project"
                            >
                              <ExternalLink size={18} />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => {
                                setItemToDelete(p);
                                setDeleteType("project");
                                setIsDeleteModalOpen(true);
                              }}
                              className="bg-red-500/5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 border-transparent hover:border-red-500/20"
                              title="Delete Project"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
          
          {(activeTab === "users" ? filteredUsers.length : filteredProjects.length) === 0 && (
            <div className="py-24 text-center">
              <div className="bg-gray-800/50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-4 border-gray-700/50 rotate-12 group-hover:rotate-0 transition-transform">
                <AlertCircle className="text-gray-600 w-10 h-10" />
              </div>
              <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-sm">No data sectors found matching your query.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0, rotate: 2 }}
              className="relative bg-gray-900 border-4 border-red-500/20 p-10 rounded-[3rem] max-w-md w-full shadow-[0_0_80px_rgba(239,68,68,0.15)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
              <div className="bg-red-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 border-4 border-red-500/20 mx-auto">
                <Trash2 className="text-red-500 w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black italic tracking-tighter mb-4 text-center">ERASE <span className="text-red-500 uppercase">{deleteType}?</span></h2>
              <p className="text-gray-400 mb-10 leading-relaxed text-center font-medium">
                Warning: You are initiating the permanent deletion of <span className="text-white font-black italic">{deleteType === "user" ? itemToDelete?.fullName : itemToDelete?.title}</span>. This protocol is irreversible.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 h-12 bg-gray-800 text-gray-400 font-black hover:bg-gray-700 hover:text-white uppercase tracking-[0.2em] text-[10px] border-2 border-transparent hover:border-gray-600"
                >
                  Abort Protocol
                </Button>
                <Button
                  onClick={handleDelete}
                  className="flex-1 h-12 bg-red-600 text-white font-black hover:bg-red-700 uppercase tracking-[0.2em] text-[10px] shadow-[0_6px_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none"
                >
                  Confirm Erasure
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
