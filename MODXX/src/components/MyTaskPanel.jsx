import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const MyTaskPanel = ({ projectId }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/project/${projectId}/tasks`);
        const allTasks = Array.isArray(res.data)
          ? res.data
          : res.data.tasks || [];
        setTasks(allTasks.filter((t) => t.assigned_to === user.id));
      } catch (err) {
        setError("Failed to fetch tasks");
      }
      setLoading(false);
    };
    fetchTasks();
  }, [projectId, user]);

  const handleMarkDone = async (taskId) => {
    setLoading(true);
    setError("");
    try {
      await axiosInstance.patch(`/project/${projectId}/tasks/${taskId}`, {
        status: "done",
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: "done" } : t))
      );
    } catch (err) {
      setError("Failed to update task");
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="bg-gray-800 rounded-lg shadow-inner p-4 overflow-y-auto max-h-[40vh] w-full mb-8">
      <h3 className="text-lg font-bold text-orange-400 mb-2">My Tasks</h3>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      {loading ? (
        <div className="text-gray-400">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-gray-500">No tasks assigned.</div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="bg-gray-700 rounded p-2 flex flex-col gap-1"
            >
              <span className="font-semibold text-white">{task.title}</span>
              <span className="text-xs text-gray-300">{task.description}</span>
              <span className="text-xs text-gray-400">
                Deadline:{" "}
                {task.deadline
                  ? new Date(task.deadline).toLocaleDateString()
                  : "N/A"}
              </span>
              <span className="text-xs text-gray-400">
                Status: {task.status}
              </span>
              {task.status !== "done" && (
                <button
                  className="btn btn-xs btn-success mt-1 w-fit"
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

export default MyTaskPanel;
