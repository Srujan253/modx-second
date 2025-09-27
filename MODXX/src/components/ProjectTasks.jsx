import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Users,
  FileText,
  Loader2,
  Crown,
  Shield,
  UserCheck,
} from "lucide-react";

const ProjectTasks = (props) => {
  const {
    projectId,
    members,
    showAssignForm: showAssignFormProp,
    canEditDelete,
    onEditTask,
    onDeleteTask,
  } = props;
  const [editTaskId, setEditTaskId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    deadline: "",
    status: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    assigned_to: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Find the user's project role from members list
  const myMembership = members.find((m) => m.id === user?.id);
  const myRole = myMembership?.role;

  // Confirmation dialog state (fix misplaced line)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, [projectId]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/project/${projectId}/tasks`);
      // Support both array and {tasks: array} response for compatibility
      setTasks(Array.isArray(res.data) ? res.data : res.data.tasks || []);
    } catch (err) {
      setError("Failed to fetch tasks");
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axiosInstance.post(`/project/${projectId}/tasks`, form);
      setForm({ title: "", description: "", deadline: "", assigned_to: "" });
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      setError("Failed to create task");
    }
    setLoading(false);
  };

  const handleMarkDone = async (taskId) => {
    setLoading(true);
    setError("");
    try {
      await axiosInstance.patch(`/project/${projectId}/tasks/${taskId}`, {
        status: "done",
      });
      fetchTasks();
    } catch (err) {
      setError("Failed to update task");
    }
    setLoading(false);
  };

  const isLeaderOrMentor = myRole === "leader" || myRole === "mentor";
  // Use prop to control form visibility if provided
  const showAssignForm =
    typeof showAssignFormProp === "boolean"
      ? showAssignFormProp
      : isLeaderOrMentor;
  const isMember = myRole === "member";
  const visibleTasks = isMember
    ? tasks.filter((t) => t.assigned_to === user.id)
    : tasks;

  const getStatusIcon = (status) => {
    switch (status) {
      case "done":
        return CheckCircle;
      case "in-progress":
        return Clock;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "done":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "in-progress":
        return "text-blue-400 bg-blue-500/20 border-blue-500/30";
      default:
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "leader":
        return Crown;
      case "mentor":
        return Shield;
      default:
        return UserCheck;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <Target className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isMember ? "My Tasks" : "All Tasks"}
            </h3>
            <p className="text-gray-400 text-sm">
              {visibleTasks.length}{" "}
              {visibleTasks.length === 1 ? "task" : "tasks"}
              {isMember ? " assigned to you" : " in total"}
            </p>
          </div>
        </div>

        {showAssignForm && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={16} />
            New Task
          </motion.button>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400"
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Creation Form */}
      <AnimatePresence>
        {showAssignForm && showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-700/30 backdrop-blur-sm rounded-2xl border border-gray-600/30 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Plus className="w-5 h-5 text-orange-400" />
                <h4 className="text-lg font-bold text-white">
                  Create New Task
                </h4>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Task Title
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter task title..."
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:bg-gray-800/70 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the task..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:bg-gray-800/70 transition-all resize-none"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Deadline
                    </label>
                    <input
                      name="deadline"
                      type="date"
                      value={form.deadline}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-orange-500/50 focus:bg-gray-800/70 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Assign to
                    </label>
                    <select
                      name="assigned_to"
                      value={form.assigned_to}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-orange-500/50 focus:bg-gray-800/70 transition-all"
                      required
                    >
                      <option value="">Select member...</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create Task
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-xl font-semibold transition-all border border-gray-600/30"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      {loading && visibleTasks.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
            <p className="text-gray-400">Loading tasks...</p>
          </div>
        </div>
      ) : visibleTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/30 flex items-center justify-center">
            <Target size={32} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-400 mb-2">No tasks yet</h3>
          <p className="text-gray-500">
            {showAssignForm
              ? "Create your first task to get started"
              : "No tasks have been assigned to you yet"}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {visibleTasks.map((task, index) => {
              const submitEdit = async (e) => {
                e.preventDefault();
                setEditLoading(true);
                await onEditTask(task.id, editForm);
                setEditLoading(false);
                closeEdit();
                fetchTasks();
              };
              const assignedMember = members.find(
                (m) => m.id === task.assigned_to
              );
              const RoleIcon = getRoleIcon(assignedMember?.role);
              const StatusIcon = getStatusIcon(task.status);
              // Edit modal logic
              const openEdit = () => {
                setEditTaskId(task.id);
                setEditForm({
                  title: task.title,
                  description: task.description,
                  deadline: task.deadline ? task.deadline.slice(0, 10) : "",
                  status: task.status || "",
                });
              };
              const closeEdit = () => {
                setEditTaskId(null);
                setEditForm({
                  title: "",
                  description: "",
                  deadline: "",
                  status: "",
                });
              };
              const handleEditChange = (e) => {
                setEditForm({ ...editForm, [e.target.name]: e.target.value });
              };
              // ...existing code...
              return (
                <React.Fragment key={task.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gray-700/30 backdrop-blur-sm rounded-2xl border border-gray-600/30 p-6 hover:border-orange-500/30 transition-all duration-300 group"
                  >
                    {/* ...existing code for task card... */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors mb-2">
                          {task.title}
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {task.description}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-1 px-3 py-1 rounded-full border ${
                          task.status !== "done" &&
                          task.deadline &&
                          new Date(task.deadline) < new Date()
                            ? "text-red-400 bg-red-500/20 border-red-500/30"
                            : getStatusColor(task.status)
                        }`}
                      >
                        <StatusIcon size={12} />
                        <span className="text-xs font-medium capitalize">
                          {task.status !== "done" &&
                          task.deadline &&
                          new Date(task.deadline) < new Date()
                            ? "expired"
                            : task.status || "pending"}
                        </span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-600/30 rounded-lg">
                          <User size={16} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Assigned to</p>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">
                              {assignedMember?.full_name || task.assigned_to}
                            </p>
                            {assignedMember?.role && (
                              <div className="flex items-center gap-1">
                                <RoleIcon
                                  size={12}
                                  className="text-orange-400"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-600/30 rounded-lg">
                          <Calendar size={16} className="text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Deadline</p>
                          <p className="text-white font-medium">
                            {task.deadline
                              ? new Date(task.deadline).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )
                              : "No deadline"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {isMember &&
                      task.status !== "done" &&
                      task.assigned_to === user.id && (
                        <div className="pt-4 border-t border-gray-600/30">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleMarkDone(task.id)}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                          >
                            {loading ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <CheckCircle size={14} />
                                Mark as Done
                              </>
                            )}
                          </motion.button>
                        </div>
                      )}
                    {canEditDelete && (
                      <div className="pt-4 border-t border-gray-600/30 flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={openEdit}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                        >
                          <FileText size={14} /> Edit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setConfirmDeleteId(task.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                        >
                          <AlertCircle size={14} /> Delete
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                  {/* Edit Modal */}
                  {editTaskId === task.id && (
                    <div className="fixed inset-0 z-50 flex justify-center items-start bg-black/40">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: -40 }}
                        exit={{ opacity: 0, scale: 0.95, y: 40 }}
                        className="bg-gray-900 rounded-2xl p-4 shadow-2xl border border-gray-700 w-full max-w-xs overflow-y-auto max-h-[80vh] flex flex-col justify-center mt-12"
                      >
                        <h3 className="text-lg font-bold text-white mb-2 text-center">
                          Edit Task
                        </h3>
                        <form onSubmit={submitEdit} className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">
                              Title
                            </label>
                            <input
                              name="title"
                              value={editForm.title}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/70 transition-all text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">
                              Description
                            </label>
                            <textarea
                              name="description"
                              value={editForm.description}
                              onChange={handleEditChange}
                              rows={2}
                              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/70 transition-all resize-none text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">
                              Deadline
                            </label>
                            <input
                              name="deadline"
                              type="date"
                              value={editForm.deadline}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/70 transition-all text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">
                              Status
                            </label>
                            <select
                              name="status"
                              value={editForm.status}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/70 transition-all text-sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                          </div>
                          <div className="flex gap-2 pt-2 justify-center">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              type="submit"
                              disabled={editLoading}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {editLoading ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <FileText size={16} />
                              )}
                              {editLoading ? "Saving..." : "Save"}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              type="button"
                              onClick={closeEdit}
                              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-xl font-semibold transition-all border border-gray-600/30 text-sm"
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </form>
                      </motion.div>
                    </div>
                  )}
                  {/* Delete Confirmation Modal */}
                  {confirmDeleteId === task.id && (
                    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700 w-full max-w-xs flex flex-col justify-center"
                      >
                        <h3 className="text-lg font-bold text-white mb-2 text-center">
                          Delete Task?
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 text-center">
                          Are you sure you want to delete this task? This action
                          cannot be undone.
                        </p>
                        <div className="flex gap-2 justify-center">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={async () => {
                              await onDeleteTask(task.id);
                              setConfirmDeleteId(null);
                              fetchTasks();
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all border border-red-600/30 text-sm"
                          >
                            Delete
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-xl font-semibold transition-all border border-gray-600/30 text-sm"
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
export default ProjectTasks;
