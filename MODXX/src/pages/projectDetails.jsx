import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { Star, User, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MyTaskPanel from "../components/MyTaskPanel";
import RelatedProjects from "../components/RelatedProjects";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        // Try public endpoint first (for explore page), fallback to protected if needed
        let data;
        try {
          const res = await axios.get(`${API_URL}/project/public/${projectId}`);
          data = res.data;
        } catch (err) {
          // fallback to protected route if public fails (e.g. for members-only features)
          const res = await axios.get(`${API_URL}/project/${projectId}`, {
            withCredentials: true,
          });
          data = res.data;
        }
        setProject(data.project);
        setLoading(false);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load project details."
        );
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [projectId]);

  // Fetch pending join requests if user is leader
  useEffect(() => {
    const fetchRequests = async () => {
      if (!project || !user || project.leader_id !== user.id) return;
      setRequestsLoading(true);
      try {
        const { data } = await axios.get(
          `${API_URL}/project/${projectId}/requests`,
          { withCredentials: true }
        );
        setPendingRequests(data.requests);
      } catch (error) {
        setPendingRequests([]);
      }
      setRequestsLoading(false);
    };
    fetchRequests();
  }, [project, user, projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <svg
          className="animate-spin h-10 w-10 text-orange-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="mt-4 text-lg">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-red-500">Project Not Found</h2>
          <p className="mt-4 text-lg text-gray-400">
            The project you are looking for does not exist or you do not have
            access.
          </p>
        </div>
      </div>
    );
  }

  const isLeader = project.leader_id === user?.id;
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("/uploads/")) {
      return `${API_URL}${url}`;
    }
    if (url.startsWith("/api/v1/uploads/")) {
      return `${API_URL}${url.replace("/api/v1", "")}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col md:flex-row gap-8">
      {/* Leftmost: Leader button to Task Management */}
      {isLeader && (
        <div className="w-full md:w-60 flex flex-col gap-4 mb-8 md:mb-0">
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg shadow mb-4"
            onClick={() =>
              (window.location.href = `/project/${projectId}/tasks`)
            }
          >
            Go to Task Management
          </button>
          <div className="bg-gray-800 rounded-lg shadow-inner p-4 overflow-y-auto max-h-[40vh]">
            <h3 className="text-xl font-bold text-orange-400 mb-4">
              Pending Join Requests
            </h3>
            {requestsLoading ? (
              <div className="text-gray-400">Loading requests...</div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-gray-500">No pending requests.</div>
            ) : (
              <ul className="space-y-3">
                {pendingRequests.map((req) => (
                  <li
                    key={req.id}
                    className="bg-gray-700 rounded p-3 flex flex-col gap-2"
                  >
                    <span className="font-semibold text-white">
                      {req.full_name}
                    </span>
                    <span className="text-gray-400 text-xs">{req.email}</span>
                    <span className="text-gray-500 text-xs mt-1">
                      Status: {req.status}
                    </span>
                    <div className="flex gap-2 mt-2">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-semibold"
                        onClick={async () => {
                          try {
                            await axios.post(
                              `${API_URL}/project/${projectId}/requests/${req.id}/accept`,
                              {},
                              { withCredentials: true }
                            );
                            toast.success("Request accepted and member added.");
                            setPendingRequests((prev) =>
                              prev.filter((r) => r.id !== req.id)
                            );
                          } catch (err) {
                            toast.error("Failed to accept request.");
                          }
                        }}
                      >
                        Accept
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-semibold"
                        onClick={async () => {
                          try {
                            await axios.delete(
                              `${API_URL}/project/${projectId}/requests/${req.id}`,
                              { withCredentials: true }
                            );
                            toast.info("Request rejected and removed.");
                            setPendingRequests((prev) =>
                              prev.filter((r) => r.id !== req.id)
                            );
                          } catch (err) {
                            toast.error("Failed to reject request.");
                          }
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {/* Main Project Details */}
      <div className="flex-1 max-w-4xl mx-auto">
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          src={
            getImageUrl(project.project_image) ||
            "https://placehold.co/1200x600/1f2937/d1d5db?text=Project+Image"
          }
          alt={project.title}
          className="w-full h-80 object-cover rounded-xl shadow-lg mb-8"
        />
        <h1 className="text-5xl font-bold text-orange-500 mb-4">
          {project.title}
        </h1>
        <div className="flex items-center gap-4 text-gray-400 mb-6">
          <p className="flex items-center gap-1">
            <Star size={20} className="text-yellow-400" />{" "}
            {project.avg_rating || "N/A"}
          </p>
          <p className="flex items-center gap-1">
            <User size={20} /> Leader:{" "}
            <span className="font-semibold text-white">
              {project.leader_name}
            </span>
          </p>
          <p className="flex items-center gap-1">
            <Users size={20} /> Members: {project.member_count} /{" "}
            {project.max_members}
          </p>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Description</h3>
        <p className="text-gray-300 mb-6">{project.description}</p>
        <h3 className="text-2xl font-bold text-white mb-2">Goals</h3>
        <p className="text-gray-300 mb-6">{project.goals}</p>
        <h3 className="text-2xl font-bold text-white mb-2">Motivation</h3>
        <p className="text-gray-300 mb-6">{project.motivation}</p>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.required_skills?.map((tag, index) => (
                <span
                  key={index}
                  className="bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.tech_stack?.map((tag, index) => (
                <span
                  key={index}
                  className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        {isLeader && (
          <div className="mt-8">
            <h3 className="text-3xl font-bold text-white mb-4">Leader Tools</h3>
            <div className="bg-gray-800 p-6 rounded-lg shadow-inner">
              <p className="text-gray-300">
                You can manage members, send invites, and manage project
                settings here.
              </p>
              {/* TODO: Add mentor assignment and member management UI here */}
              <div className="flex gap-4 mt-6">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow"
                  onClick={() =>
                    (window.location.href = `/project/${projectId}/edit`)
                  }
                >
                  Edit Project
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow"
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this project? This action cannot be undone."
                      )
                    ) {
                      try {
                        await axios.delete(`${API_URL}/project/${projectId}`, {
                          withCredentials: true,
                        });
                        toast.success("Project deleted successfully.");
                        window.location.href = "/dashboard";
                      } catch (error) {
                        toast.error(
                          error.response?.data?.message ||
                            "Failed to delete project."
                        );
                      }
                    }
                  }}
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        )}
        <RelatedProjects currentProjectId={projectId} />
      </div>

      {/* Right-side: If not leader, show MyTaskPanel for assigned tasks */}
      {!isLeader && (
        <div className="w-full md:w-80">
          <div className="bg-gray-800 rounded-lg shadow-inner p-4 overflow-y-auto max-h-[60vh] w-full">
            <MyTaskPanel projectId={projectId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
