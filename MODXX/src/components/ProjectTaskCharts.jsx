import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import axiosInstance from "../api/axiosInstance";

const COLORS = [
  "#34d399",
  "#f59e42",
  "#6366f1",
  "#f43f5e",
  "#38bdf8",
  "#fbbf24",
  "#a3e635",
  "#f472b6",
  "#818cf8",
  "#f87171",
];

function getDaysArray() {
  const arr = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

const ProjectTaskCharts = ({ projectId, members }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/project/${projectId}/tasks`);
        setTasks(Array.isArray(res.data) ? res.data : res.data.tasks || []);
      } catch (err) {
        setTasks([]);
      }
      setLoading(false);
    };
    fetchTasks();
  }, [projectId]);

  // Helper: robust member-task matching
  function isTaskAssignedToMember(task, member) {
    return (
      task.assigned_to === member.id ||
      task.assigned_to === member.email ||
      task.assigned_to === member.name ||
      task.assigned_to === member.full_name
    );
  }

  // Pie 1: Completed tasks per member
  const completedPie = members
    .map((m) => ({
      name: m.name || m.full_name || "User",
      value: tasks.filter(
        (t) => isTaskAssignedToMember(t, m) && t.status === "done"
      ).length,
    }))
    .filter((d) => d.value > 0);

  // Pie 2: Expired (deadline passed, not done) per member
  const expiredPie = members
    .map((m) => ({
      name: m.name || m.full_name || "User",
      value: tasks.filter(
        (t) =>
          isTaskAssignedToMember(t, m) &&
          t.status !== "done" &&
          t.deadline &&
          new Date(t.deadline) < new Date()
      ).length,
    }))
    .filter((d) => d.value > 0);

  // Bar/Line: Daily assigned/completed for last 7 days
  const days = getDaysArray();
  const dailyStats = days.map((date) => {
    // Assigned: tasks with deadline on this day
    const assigned = tasks.filter(
      (t) => t.deadline && t.deadline.slice(0, 10) === date
    ).length;
    // Completed: tasks marked done on this day
    const completed = tasks.filter(
      (t) =>
        t.status === "done" && t.deadline && t.deadline.slice(0, 10) === date
    ).length;
    // Pending: tasks not done and deadline is today
    const pending = tasks.filter(
      (t) =>
        t.status !== "done" && t.deadline && t.deadline.slice(0, 10) === date
    ).length;
    return { date, assigned, completed, pending };
  });

  // Table: Each user completed, expired, uncompleted
  const memberStats = members.map((m) => {
    const completed = tasks.filter(
      (t) => isTaskAssignedToMember(t, m) && t.status === "done"
    ).length;
    const expired = tasks.filter(
      (t) =>
        isTaskAssignedToMember(t, m) &&
        t.status !== "done" &&
        t.deadline &&
        new Date(t.deadline) < new Date()
    ).length;
    const uncompleted = tasks.filter(
      (t) =>
        isTaskAssignedToMember(t, m) &&
        t.status !== "done" &&
        (!t.deadline || new Date(t.deadline) >= new Date())
    ).length;
    return {
      name: m.name || m.full_name || "User",
      completed,
      expired,
      uncompleted,
    };
  });

  if (loading)
    return (
      <div className="text-center py-8 text-gray-400">Loading charts...</div>
    );

  return (
    <div className="space-y-10 mt-10">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">
            Completed Tasks Contribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={completedPie}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {completedPie.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">
            Expired Tasks (Not Done)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={expiredPie}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {expiredPie.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill="#f43f5e" // red color for expired tasks
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">
          Weekly Task Progress
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={dailyStats}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: "#fbbf24", fontSize: 12 }} />
            <YAxis tick={{ fill: "#34d399", fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="assigned" fill="#fbbf24" name="Assigned" />
            <Bar dataKey="completed" fill="#34d399" name="Completed" />
            <Bar dataKey="pending" fill="#f59e42" name="Pending/In Progress" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-gray-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
        <h3 className="text-lg font-bold text-white mb-4">Member Task Stats</h3>
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-gray-400">
              <th className="py-2 px-4">Member</th>
              <th className="py-2 px-4">Completed</th>
              <th className="py-2 px-4">Expired</th>
              <th className="py-2 px-4">Uncompleted</th>
            </tr>
          </thead>
          <tbody>
            {memberStats.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-700">
                <td className="py-2 px-4 text-white font-semibold">
                  {row.name}
                </td>
                <td className="py-2 px-4 text-green-400">{row.completed}</td>
                <td className="py-2 px-4 text-orange-400">{row.expired}</td>
                <td className="py-2 px-4 text-yellow-400">{row.uncompleted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectTaskCharts;
