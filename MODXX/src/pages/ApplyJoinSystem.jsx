import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const ApplyJoinSystem = () => {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState([]); // Projects created by user
  const [potentialMembers, setPotentialMembers] = useState([]); // Users to invite
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Fetch projects created by the user (leader)
    axios
      .get(`${API_URL}/project/user-projects`, { withCredentials: true })
      .then((res) => setMyProjects(res.data.projects || []))
      .catch(() => toast.error("Failed to fetch your projects."));
  }, [user]);

  const handleSelectProject = async (projectId) => {
    setSelectedProject(projectId);
    setLoading(true);
    try {
      // Fetch users who are not already members of this project
      const { data } = await axios.get(
        `${API_URL}/project/${projectId}/potential-members`,
        { withCredentials: true }
      );
      setPotentialMembers(data.users || []);
    } catch {
      toast.error("Failed to fetch potential members.");
    }
    setLoading(false);
  };

  const handleSendInvite = async (userId) => {
    try {
      await axios.post(
        `${API_URL}/project/${selectedProject}/invite`,
        { userId },
        { withCredentials: true }
      );
      toast.success("Invitation sent!");
      setPotentialMembers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      toast.error("Failed to send invite.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-orange-500 mb-8">
          Find & Invite Members
        </h2>
        <div className="mb-8">
          <label className="block mb-2 text-lg font-semibold">
            Select Your Project:
          </label>
          <select
            className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700"
            value={selectedProject || ""}
            onChange={(e) => handleSelectProject(e.target.value)}
          >
            <option value="" disabled>
              -- Choose a project --
            </option>
            {myProjects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.title}
              </option>
            ))}
          </select>
        </div>
        {loading && <div className="text-gray-400">Loading members...</div>}
        {selectedProject && !loading && (
          <div>
            <h3 className="text-2xl font-bold text-green-400 mb-4">
              Potential Members
            </h3>
            {potentialMembers.length === 0 ? (
              <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400">
                No suitable members found or all have been invited.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {potentialMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-gray-800 rounded-xl p-6 flex flex-col items-center"
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${member.full_name.replace(
                        " ",
                        "+"
                      )}&background=222&color=FFF`}
                      alt={member.full_name}
                      className="w-16 h-16 rounded-full mb-3 border-2 border-orange-500"
                    />
                    <h4 className="text-lg font-bold mb-1">
                      {member.full_name}
                    </h4>
                    <p className="text-gray-400 mb-2">
                      {member.skills?.join(", ")}
                    </p>
                    <Link
                      to={`/profile/${member.id}`}
                      className="text-orange-400 hover:underline mb-2"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => handleSendInvite(member.id)}
                      className="mt-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
                    >
                      Send Invite
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyJoinSystem;
