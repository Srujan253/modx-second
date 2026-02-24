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
  Loader2,
  AlertCircle
} from "lucide-react";

// (Import moved up or handled by axiosInstance)

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("admin/users");
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePromote = async (userId) => {
    try {
      const { data } = await axiosInstance.patch(
        `admin/users/${userId}/promote`,
        {}
      );
      if (data.success) {
        toast.success(data.message);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to promote user.");
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      const { data } = await axiosInstance.delete(
        `admin/users/${userToDelete._id}`
      );
      if (data.success) {
        toast.success("User deleted successfully.");
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    members: users.filter(u => u.role !== 'admin').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 w-12 h-12" />
      </div>
    );
  }

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
          <p className="text-gray-400">Manage platform users and permissions</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.total, icon: Users, color: "orange" },
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
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-black mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-500/10 rounded-xl`}>
                <stat.icon className={`text-${stat.color}-500 w-6 h-6`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/50 border-2 border-gray-700/50 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-600"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-gray-800/50 border-2 border-gray-700/50 rounded-xl py-2.5 px-4 outline-none focus:border-orange-500 transition-all font-medium text-sm w-full md:w-40"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-gray-800/30 backdrop-blur-sm border-2 border-gray-700/30 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800/50 text-gray-400 text-xs font-black uppercase tracking-[0.2em] border-b border-gray-700/50">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Enrolled On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30 font-medium">
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
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-orange-500 border-2 border-gray-600">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-bold">{u.fullName}</p>
                            <p className="text-gray-500 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-black uppercase border border-orange-500/20">
                            <Shield size={12} /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-700/50 text-gray-400 text-xs font-bold border border-gray-600/30">
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handlePromote(u._id)}
                              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                              title="Promote to Admin"
                            >
                              <UserPlus size={18} />
                            </button>
                          )}
                          {u._id !== currentUser.id && (
                            <button
                              onClick={() => {
                                setUserToDelete(u);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                              title="Delete User"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <div className="bg-gray-800/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-gray-700/50">
                <AlertCircle className="text-gray-600 w-8 h-8" />
              </div>
              <p className="text-gray-500 font-bold">No users found matching your search.</p>
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-gray-900 border-4 border-red-500/20 p-8 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.1)]"
            >
              <div className="bg-red-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border-2 border-red-500/20">
                <Trash2 className="text-red-500 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black italic tracking-tighter mb-2">ERASE <span className="text-red-500">USER?</span></h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                You are about to permanently delete <span className="text-white font-bold">{userToDelete?.fullName}</span>. This action is irreversible and will remove all their data from the grid.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 px-6 rounded-xl bg-gray-800 text-gray-300 font-black hover:bg-gray-700 transition-all uppercase tracking-widest text-xs"
                >
                  Abort
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 px-6 rounded-xl bg-red-600 text-white font-black hover:bg-red-700 transition-all uppercase tracking-widest text-xs shadow-[0_4px_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
