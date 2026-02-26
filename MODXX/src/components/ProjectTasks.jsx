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
  SearchX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
  const myMembership = members.find((m) => (m._id || m.id) === (user?._id || user?.id));
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
      const res = await axiosInstance.get(`project/${projectId}/tasks`);
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
      await axiosInstance.post(`project/${projectId}/tasks`, form);
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
      await axiosInstance.patch(`project/${projectId}/tasks/${taskId}`, {
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
    ? tasks.filter((t) => (t.assignedTo || t.assigned_to) === (user?._id || user?.id))
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
            <Target className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">
              {isMember ? "My Tasks" : "All Tasks"}
            </h3>
            <p className="text-gray-500 font-bold text-[10px] tracking-widest uppercase mt-1">
              {visibleTasks.length} {visibleTasks.length === 1 ? "Active Task" : "Active Tasks"}
            </p>
          </div>
        </div>

        {showAssignForm && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest px-6 py-6 rounded-2xl shadow-[0_6px_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none transition-all"
          >
            <Plus size={18} className="mr-2" /> NEW TASK
          </Button>
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-8"
          >
            <Card className="bg-gray-950 border-gray-800 p-8 rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                  <Plus className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-xl font-black italic tracking-tighter text-white uppercase">
                    Create New Task
                  </h4>
                  <p className="text-gray-500 font-bold text-[10px] tracking-widest uppercase mt-1">
                    Fill out the task details below
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">
                    Task Title
                  </label>
                  <Input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter task title..."
                    className="h-14 bg-gray-900/50 border-gray-800 rounded-2xl text-white font-bold placeholder:text-gray-700 focus:border-orange-500/30 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">
                    Task Description
                  </label>
                  <Textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe task details..."
                    className="bg-gray-900/50 border-gray-800 rounded-2xl text-white font-bold placeholder:text-gray-700 focus:border-orange-500/30 transition-all min-h-[120px]"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">
                      Due Date
                    </label>
                    <Input
                      name="deadline"
                      type="date"
                      value={form.deadline}
                      onChange={handleChange}
                      className="h-14 bg-gray-900/50 border-gray-800 rounded-2xl text-white font-bold focus:border-orange-500/30 transition-all [color-scheme:dark]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">
                      Assign To
                    </label>
                    <Select
                      name="assigned_to"
                      value={form.assigned_to}
                      onChange={handleChange}
                      className="h-14 bg-gray-900/50 border-gray-800 rounded-2xl text-white font-bold focus:border-orange-500/30 transition-all px-4"
                      required
                    >
                      <SelectItem value="">Select member...</SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m._id || m.id} value={m._id || m.id}>
                          {m.full_name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-14 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_6px_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin mr-2" />
                        CREATING...
                      </>
                    ) : (
                      <>
                        <Plus size={18} className="mr-2" /> CREATE TASK
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="h-14 px-8 bg-gray-900 border-gray-800 text-gray-500 hover:text-white font-black uppercase tracking-widest rounded-2xl border-2 hover:border-gray-700 transition-all"
                  >
                    CANCEL
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      {loading && visibleTasks.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-gray-900 border-gray-800 p-8 space-y-6">
              <div className="flex justify-between">
                <Skeleton className="h-8 w-1/3 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      ) : visibleTasks.length === 0 ? (
        <div className="text-center py-24 bg-gray-950/50 rounded-[3rem] border-2 border-dashed border-gray-800">
          <div className="bg-gray-900 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 border-4 border-gray-800 shadow-2xl">
            <SearchX size={40} className="text-gray-700" />
          </div>
          <h3 className="text-3xl font-black italic tracking-tighter text-gray-500 mb-4 uppercase">
            No Tasks Found
          </h3>
          <p className="text-gray-600 font-medium max-w-sm mx-auto">
            {showAssignForm
              ? "There are no tasks for this project yet. Create one to get started."
              : "You have no tasks assigned to you."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {visibleTasks.map((task, index) => {
              const taskId = task._id || task.id;
              const submitEdit = async (e) => {
                e.preventDefault();
                setEditLoading(true);
                await onEditTask(taskId, editForm);
                setEditLoading(false);
                closeEdit();
                fetchTasks();
              };
              const assignedMember = members.find(
                (m) => (m._id || m.id) === (task.assignedTo || task.assigned_to)
              );
              const RoleIcon = getRoleIcon(assignedMember?.role);
              const StatusIcon = getStatusIcon(task.status);
              // Edit modal logic
              const openEdit = () => {
                setEditTaskId(taskId);
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
                <React.Fragment key={taskId}>
                  <Card className="bg-gray-900 border-gray-800 p-8 hover:border-orange-500/30 transition-all duration-500 group relative overflow-hidden mb-6">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-all" />
                    
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex-1">
                        <h4 className="text-2xl font-black italic tracking-tighter text-white group-hover:text-orange-500 transition-colors uppercase mb-3">
                          {task.title}
                        </h4>
                        <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-2xl">
                          {task.description}
                        </p>
                      </div>
                      <Badge 
                        className={cn(
                          "px-4 py-1.5 font-black uppercase tracking-widest text-[10px] rounded-full",
                          task.status === "done" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                          task.status === "in-progress" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                          "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                          task.status !== "done" && task.deadline && new Date(task.deadline) < new Date() && "bg-red-500/10 text-red-500 border-red-500/20"
                        )}
                      >
                        <StatusIcon size={10} className="mr-2" />
                        {task.status !== "done" && task.deadline && new Date(task.deadline) < new Date() ? "EXPIRED" : task.status || "PENDING"}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-10">
                      <div className="flex items-center gap-4 bg-gray-800/20 p-4 rounded-2xl border border-gray-800/50">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">Assigned To</p>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{assignedMember?.full_name || "Unassigned"}</span>
                            {assignedMember?.role && (
                              <Badge variant="outline" className="text-[8px] h-4 bg-orange-500/5 text-orange-500 border-orange-500/20">
                                {assignedMember.role}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-gray-800/20 p-4 rounded-2xl border border-gray-800/50">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">Due Date</p>
                          <span className="text-white font-bold">
                            {task.deadline ? new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No Due Date"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-8 border-t border-gray-800/50">
                      {isMember && task.status !== "done" && (task.assignedTo || task.assigned_to) === (user?._id || user?.id) && (
                        <Button
                          onClick={() => handleMarkDone(taskId)}
                          disabled={loading}
                          className="bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest px-6 h-10 rounded-xl transition-all"
                        >
                          {loading ? <Loader2 className="animate-spin mr-2" size={14} /> : <CheckCircle size={14} className="mr-2" />}
                          MARK AS DONE
                        </Button>
                      )}
                      
                      {canEditDelete && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={openEdit}
                            className="bg-blue-500/5 text-blue-500 border-blue-500/20 hover:bg-blue-500 hover:text-white font-black uppercase tracking-widest text-[10px] px-6 h-10 rounded-xl transition-all"
                          >
                            <FileText size={14} className="mr-2" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setConfirmDeleteId(taskId)}
                            className="bg-red-500/5 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-[10px] px-6 h-10 rounded-xl transition-all"
                          >
                            <AlertCircle size={14} className="mr-2" /> Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                  {/* Edit Modal */}
                  {editTaskId === taskId && (
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
                  {confirmDeleteId === taskId && (
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
                              await onDeleteTask(taskId);
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
