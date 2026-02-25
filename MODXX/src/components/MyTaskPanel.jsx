import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
        const res = await axiosInstance.get(`project/${projectId}/tasks`);
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
      await axiosInstance.patch(`project/${projectId}/tasks/${taskId}`, {
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
    <div className="space-y-4">
      {error && (
        <Badge variant="destructive" className="w-full justify-center py-2 rounded-xl mb-2">
          <AlertCircle size={14} className="mr-2" /> {error}
        </Badge>
      )}
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl bg-gray-800/50" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 bg-gray-950/30 rounded-2xl border border-gray-800 border-dashed">
          <p className="text-gray-600 font-bold text-[10px] tracking-widest uppercase mb-1">ZERO ASSIGNMENTS</p>
          <p className="text-gray-700 italic text-xs">Awaiting mission protocols.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className="bg-gray-800/20 border-gray-800/50 hover:border-orange-500/30 transition-all group overflow-hidden"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-black italic tracking-tighter text-white group-hover:text-orange-500 transition-colors uppercase text-sm truncate">
                    {task.title}
                  </h4>
                  <Badge 
                    className={cn(
                      "text-[8px] px-2 py-0.5 font-black uppercase tracking-widest",
                      task.status === "done" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    )}
                  >
                    {task.status || "PENDING"}
                  </Badge>
                </div>
                
                <p className="text-gray-500 text-[10px] leading-tight mb-3 line-clamp-2">
                  {task.description}
                </p>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar size={10} />
                    <span className="text-[9px] font-black uppercase">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "N/A"}</span>
                  </div>
                </div>

                {task.status !== "done" && (
                  <Button
                    onClick={() => handleMarkDone(task.id)}
                    disabled={loading}
                    variant="outline"
                    className="w-full h-8 bg-green-500/5 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white font-black uppercase tracking-widest text-[9px] rounded-lg"
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" size={12} /> : <CheckCircle size={12} className="mr-2" />}
                    COMPLETE UNIT
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTaskPanel;
