import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const ProjectTasks = (props) => {
  const { projectId, members, showAssignForm: showAssignFormProp } = props;
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

  // Find the user's project role from members list
  const myMembership = members.find((m) => m.id === user?.id);
  const myRole = myMembership?.role;

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

  return (
    <div className="bg-white rounded shadow p-4 mt-4">
      <h3 className="font-bold text-lg mb-2">Project Tasks</h3>
      {showAssignForm && (
        <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Task Title"
            className="input input-bordered"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="textarea textarea-bordered"
            required
          />
          <input
            name="deadline"
            type="date"
            value={form.deadline}
            onChange={handleChange}
            className="input input-bordered"
            required
          />
          <select
            name="assigned_to"
            value={form.assigned_to}
            onChange={handleChange}
            className="select select-bordered"
            required
          >
            <option value="">Assign to...</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            Assign Task
          </button>
        </form>
      )}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="divide-y">
          {visibleTasks.map((task) => (
            <li key={task.id} className="py-2">
              <div className="font-semibold">{task.title}</div>
              <div className="text-sm text-gray-600">
                Assigned to:{" "}
                {members.find((m) => m.id === task.assigned_to)?.full_name ||
                  task.assigned_to}
              </div>
              <div className="text-sm">Status: {task.status}</div>
              <div className="text-sm">
                Deadline:{" "}
                {task.deadline
                  ? new Date(task.deadline).toLocaleDateString()
                  : "N/A"}
              </div>
              <div className="text-xs text-gray-500">{task.description}</div>
              {isMember &&
                task.status !== "done" &&
                task.assigned_to === user.id && (
                  <button
                    className="btn btn-xs btn-success mt-2"
                    onClick={() => handleMarkDone(task.id)}
                    disabled={loading}
                  >
                    Mark as Done
                  </button>
                )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectTasks;
