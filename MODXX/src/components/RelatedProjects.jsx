import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/axiosInstance"; // Your central API client
import { Sparkles, ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Helper to get the image URL for a project
function getImageUrl(imagePath) {
  if (!imagePath) return "../assets/placeholder.png";
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
}

const RelatedProjects = ({ currentProjectId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!currentProjectId) return;
      try {
        // This calls the backend endpoint that gets the Top 6 AI recommendations + other projects
        const response = await apiClient.get(
          `recommendations/recommendations/related/${currentProjectId}`
        );
        // We only want to show the top 3 most similar projects
        setRecommendations(response.data.recommendations.top.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch related projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRelated();
  }, [currentProjectId]);

  if (loading || recommendations.length === 0) {
    return null; // Don't show anything if loading or no recommendations are found
  }

  return (
    <div className="mt-12">
      <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
        <Sparkles className="text-orange-400" />
        Similar Projects
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((project) => (
          <Link
            to={`/project/${project.id}`}
            key={project.id}
            className="group block"
          >
            <div className="relative overflow-hidden rounded-lg bg-gray-800 p-4 border border-gray-700 hover:border-orange-500/50 transition-all">
              <img
                src={getImageUrl(project.project_image)}
                alt={project.title}
                className="w-full h-40 object-cover rounded-md mb-4 group-hover:scale-105 transition-transform"
              />
              <h4 className="font-bold text-white truncate">{project.title}</h4>
              <p className="text-sm text-gray-400 line-clamp-2">
                {project.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProjects;
