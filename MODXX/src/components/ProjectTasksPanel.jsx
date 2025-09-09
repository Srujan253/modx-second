import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import ProjectTasks from "./ProjectTasks";
import MyTaskPanel from "./MyTaskPanel";
import { useAuth } from "../context/AuthContext";

const ProjectTasksPanel = ({ projectId }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axiosInstance.get(`/project/${projectId}/members`);
        setMembers(res.data.members || []);
      } catch (err) {
        setMembers([]);
      }
      setLoading(false);
    };
    fetchMembers();
  }, [projectId]);

  if (loading) return <div className="text-center p-4">Loading tasks...</div>;

  // Find the user's project role from members list
  const myMembership = members.find((m) => m.id === user?.id);
  const myRole = myMembership?.role;
  const isLeaderOrMentor = myRole === "leader" || myRole === "mentor";

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Leader/Mentor: Assign tasks, see all tasks. Member: See own tasks. */}

      {isLeaderOrMentor && (
        <button
          className="btn btn-primary w-full mb-2"
          onClick={() => {
            window.location.href = `/project/${projectId}/tasks`;
          }}
        >
          Go to Task Management
        </button>
      )}
      {/* Right-side scrollable panel for tasks */}
      <div className="bg-gray-800 rounded-lg shadow-inner p-4 overflow-y-auto max-h-[40vh] w-full">
        <MyTaskPanel projectId={projectId} />
      </div>
    </div>
  );
};

export default ProjectTasksPanel;
