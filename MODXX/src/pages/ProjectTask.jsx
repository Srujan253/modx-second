import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProjectTasks from "../components/ProjectTasks";
import axiosInstance from "../api/axiosInstance";
import MyTaskPanel from "../components/MyTaskPanel";
import { useAuth } from "../context/AuthContext";

const ProjectTask = () => {
  const { projectId } = useParams();
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

  if (loading) return <div className="text-center p-8">Loading members...</div>;

  // Find the user's project role from members list
  const myMembership = members.find((m) => m.id === user?.id);
  const myRole = myMembership?.role;
  const isLeaderOrMentor = myRole === "leader" || myRole === "mentor";

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto p-4">
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-4">Manage Project Tasks</h2>
        {/* Show assign form only for leader or mentor */}
        <ProjectTasks
          projectId={projectId}
          members={members}
          showAssignForm={isLeaderOrMentor}
        />
      </div>
      {/* Right-side scrollable panel for all users: MyTaskPanel */}
      <div className="w-full md:w-80">
        <div className="bg-gray-800 rounded-lg shadow-inner p-4 overflow-y-auto max-h-[60vh] w-full">
          <MyTaskPanel projectId={projectId} />
        </div>
      </div>
    </div>
  );
};

export default ProjectTask;
