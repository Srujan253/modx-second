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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, PieChart as PieIcon, Activity, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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
        const res = await axiosInstance.get(`project/${projectId}/tasks`);
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
      <div className="space-y-10 mt-10">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-[350px] w-full rounded-[2rem] bg-gray-900 border border-gray-800" />
          <Skeleton className="h-[350px] w-full rounded-[2rem] bg-gray-900 border border-gray-800" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-[2rem] bg-gray-900 border border-gray-800" />
      </div>
    );

  return (
    <div className="space-y-10 mt-10">
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-gray-950 border-gray-800 shadow-2xl rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-orange-500/5 border-b border-gray-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                <PieIcon size={18} />
              </div>
              <CardTitle className="text-sm font-black italic tracking-tighter text-white uppercase">CONTRIBUTION ANALYSIS</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={completedPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={60}
                  paddingAngle={5}
                >
                  {completedPie.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                      stroke="rgba(0,0,0,0.5)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-950 border-gray-800 shadow-2xl rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-red-500/5 border-b border-gray-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                <Activity size={18} />
              </div>
              <CardTitle className="text-sm font-black italic tracking-tighter text-white uppercase">EXPIRATION TERMINALS</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expiredPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={60}
                  paddingAngle={5}
                >
                  {expiredPie.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill="#ef4444"
                      stroke="rgba(0,0,0,0.5)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-950 border-gray-800 shadow-2xl rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-blue-500/5 border-b border-gray-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <TrendingUp size={18} />
            </div>
            <CardTitle className="text-sm font-black italic tracking-tighter text-white uppercase">TEMPORAL PROGRESS GRID</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={dailyStats}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#666", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
              />
              <Bar dataKey="assigned" fill="#fbbf24" name="DEPLOYED" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="#10b981" name="SECURED" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="#3b82f6" name="ACTIVE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gray-950 border-gray-800 shadow-2xl rounded-[3rem] overflow-hidden">
        <CardHeader className="bg-gray-900/50 border-b border-gray-800 p-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-xl text-gray-400">
              <Users size={18} />
            </div>
            <CardTitle className="text-xl font-black italic tracking-tighter text-white uppercase">UNIT TELEMETRY FEED</CardTitle>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-900/30">
                <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-gray-500">UNIT ID</th>
                <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-gray-500">SECURED</th>
                <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-gray-500">EXPIRED</th>
                <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-gray-500">ACTIVE</th>
              </tr>
            </thead>
            <tbody>
              {memberStats.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="py-6 px-8">
                    <span className="text-white font-black italic tracking-tighter uppercase">{row.name}</span>
                  </td>
                  <td className="py-6 px-8">
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 font-black">
                      {row.completed}
                    </Badge>
                  </td>
                  <td className="py-6 px-8">
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 font-black">
                      {row.expired}
                    </Badge>
                  </td>
                  <td className="py-6 px-8">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-black">
                      {row.uncompleted}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ProjectTaskCharts;
