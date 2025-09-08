import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus, Star, ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]); // Projects created by user
  const [selectedProjects, setSelectedProjects] = useState([]); // Projects user is a member (accepted)
  const [pendingRequests, setPendingRequests] = useState([]); // Projects user has applied (pending)
  const [invites, setInvites] = useState([]); // Project invites for this user
  const navigate = useNavigate();

  // Fetch all dashboard data
  const fetchAll = async () => {
    try {
      // 1. Projects created by user
      const { data: myProjects } = await axios.get(
        `${API_URL}/project/user-projects`,
        { withCredentials: true }
      );
      setProjects(myProjects.projects);

      // 2. Projects where user is a member (accepted) or has pending request
      const { data: memberData } = await axios.get(
        `${API_URL}/project/memberships`,
        { withCredentials: true }
      );
      setSelectedProjects(memberData.accepted || []);
      setPendingRequests(memberData.pending || []);

      // 3. Fetch project invites (status: 'invited')
      const { data: inviteData } = await axios.get(
        `${API_URL}/project/invites`,
        { withCredentials: true }
      );
      setInvites(inviteData.invites || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch dashboard data."
      );
    }
  };

  useEffect(() => {
    if (user) {
      fetchAll();
    }
    // eslint-disable-next-line
  }, [user]);

  // Accept invite (set status to 'accepted')
  const handleAcceptInvite = async (inviteId, projectId) => {
    try {
      await axios.patch(
        `${API_URL}/project/${projectId}/requests/${inviteId}`,
        { status: "accepted" },
        { withCredentials: true }
      );
      toast.success("Invitation accepted!");
      fetchAll(); // Refresh dashboard data
    } catch (err) {
      toast.error("Failed to accept invitation.");
    }
  };

  // Reject invite (delete the invite row)
  const handleRejectInvite = async (inviteId, projectId) => {
    try {
      await axios.delete(
        `${API_URL}/project/${projectId}/requests/${inviteId}`,
        { withCredentials: true }
      );
      toast.success("Invitation rejected.");
      fetchAll(); // Refresh dashboard data
    } catch (err) {
      toast.error("Failed to reject invitation.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-row gap-8">
      <div className="max-w-7xl mx-auto flex-1">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-orange-500">My Projects</h2>
          <Link
            to="/project/create"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center gap-2"
          >
            <Plus size={20} /> Create New Project
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h3 className="text-2xl text-gray-400">
              You haven't created any projects yet.
            </h3>
            <p className="mt-4 text-gray-500">
              Start your journey by creating your first project!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <img
                  src={
                    project.project_image
                      ? project.project_image.startsWith("/uploads/")
                        ? `${API_URL}${project.project_image}`
                        : project.project_image
                      : "https://placehold.co/600x400/1f2937/d1d5db?text=Project+Image"
                  }
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-orange-400">
                    {project.title}
                  </h3>
                  <p className="text-gray-300 mb-4">{project.description}</p>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Star size={16} className="text-yellow-400" />{" "}
                    {project.avg_rating || "N/A"}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(Array.isArray(project.tech_stack)
                      ? project.tech_stack
                      : String(project.tech_stack || "")
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                    ).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-700 text-gray-300 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={`/project/${project.id}`}
                    className="mt-6 inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors"
                  >
                    View Project <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {/* Selected Projects (where user is a member) */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-green-400 mb-4">
          Selected Projects
        </h2>
        {selectedProjects.length === 0 ? (
          <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400">
            You are not a member of any projects yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <img
                  src={
                    project.project_image
                      ? project.project_image.startsWith("/uploads/")
                        ? `${API_URL}${project.project_image}`
                        : project.project_image
                      : "https://placehold.co/600x400/1f2937/d1d5db?text=Project+Image"
                  }
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-green-400">
                    {project.title}
                  </h3>
                  <p className="text-gray-300 mb-4">{project.description}</p>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Star size={16} className="text-yellow-400" />{" "}
                    {project.avg_rating || "N/A"}
                  </div>
                  <Link
                    to={`/project/${project.id}`}
                    className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 mt-4 font-semibold"
                  >
                    View Details <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-yellow-400 mb-4">
          Pending Requests
        </h2>
        {pendingRequests.length === 0 ? (
          <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400">
            You have no pending join requests.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <img
                  src={
                    project.project_image
                      ? project.project_image.startsWith("/uploads/")
                        ? `${API_URL}${project.project_image}`
                        : project.project_image
                      : "https://placehold.co/600x400/1f2937/d1d5db?text=Project+Image"
                  }
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-yellow-400">
                    {project.title}
                  </h3>
                  <p className="text-gray-300 mb-4">{project.description}</p>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Star size={16} className="text-yellow-400" />{" "}
                    {project.avg_rating || "N/A"}
                  </div>
                  <span className="inline-block mt-4 px-3 py-1 bg-yellow-700 text-yellow-200 rounded-full text-xs font-semibold">
                    Pending Approval
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {/* Right-side panel for invites */}
      <div className="w-96 max-w-full bg-gray-800 rounded-lg p-4 h-[80vh] overflow-y-auto shadow-lg flex flex-col">
        <h3 className="text-xl font-bold text-green-400 mb-4">
          Project Invitations
        </h3>
        {invites.length === 0 ? (
          <div className="text-gray-400 text-center">No invitations.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="bg-gray-900 rounded p-3 flex flex-col gap-2 border border-gray-700"
              >
                <div className="font-semibold text-orange-400">
                  {invite.project_title}
                </div>
                <div className="text-gray-300 text-sm">
                  Invited by: {invite.leader_name}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                    onClick={() =>
                      handleAcceptInvite(invite.id, invite.project_id)
                    }
                  >
                    Accept
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                    onClick={() =>
                      handleRejectInvite(invite.id, invite.project_id)
                    }
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
