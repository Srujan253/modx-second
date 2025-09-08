import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const ProjectMessagesList = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Get all projects where user is a member (accepted)
        const { data } = await axiosInstance.get("/project/memberships");
        setProjects(data.accepted || []);
      } catch (err) {
        toast.error("Failed to load your projects.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="max-w-md mx-auto bg-gray-900 rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-orange-400 mb-4">
        Project Messages
      </h2>
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-gray-500">
          You are not a member of any projects.
        </div>
      ) : (
        <ul>
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex items-center gap-3 border-b border-gray-800 py-3"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold text-orange-400">
                {project.title?.[0]?.toUpperCase() || "P"}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/project-messages/${project.id}`}
                  className="block text-lg font-semibold text-white truncate hover:text-orange-400"
                >
                  {project.title}
                </Link>
                <div className="text-gray-400 text-sm truncate">
                  {project.description?.slice(0, 40) || "No description."}
                </div>
              </div>
              <Link
                to={`/project-messages/${project.id}`}
                className="text-orange-400 hover:text-orange-300 text-sm font-semibold"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectMessagesList;
