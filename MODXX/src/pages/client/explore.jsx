import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import apiClient from "../../api/axiosInstance"; // Use your central API client
import { toast } from "react-toastify";
import {
  Search,
  Star,
  Users,
  ArrowRight,
  Briefcase,
  Sparkles,
} from "lucide-react"; // Added Sparkles
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Helper to get the image URL for a project
function getImageUrl(imagePath) {
  if (!imagePath) return "/path/to/your/default/placeholder.png"; // Provide a valid placeholder path
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
}

const ExploreProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false); // State to track if a search is active

  // Your existing state for tracking applications and memberships
  const [appliedProjects, setAppliedProjects] = useState([]);
  const [userMemberships, setUserMemberships] = useState({
    accepted: [],
    pending: [],
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- NEW: This single useEffect handles both recommendations and AI search ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response;
        if (isSearching && searchTerm.trim()) {
          // 1. If a search is active, use the AI-powered search endpoint
          response = await apiClient.get(
            `recommendations/search?q=${searchTerm}`
          );
          setProjects(response.data.results || []);
        } else {
          // 2. By default, fetch personalized recommendations for the user
          response = await apiClient.get(
            "recommendations/recommendations/user"
          );
          // console.log("Recommendations Response:", response);
          setProjects(response.data.recommendations || []);
        }
      } catch (error) {
        toast.error("Failed to fetch projects. Please try again later.");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setLoading(false); // If no user, stop loading
    }
  }, [user, isSearching, searchTerm]); // This effect re-runs when the user logs in or a search is performed

  // (Your existing useEffect for fetching memberships is perfect, no changes needed)
  useEffect(() => {
    const fetchMemberships = async () => {
      if (!user) return;
      try {
        const { data } = await apiClient.get(`/project/memberships`);
        setUserMemberships({
          accepted: data.accepted?.map((p) => p.id) || [],
          pending: data.pending?.map((p) => p.id) || [],
        });
      } catch (err) {
        /* ignore */
      }
    };
    fetchMemberships();
  }, [user]);

  // --- NEW: Search handlers to control the state ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true); // Triggers the useEffect to fetch search results
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsSearching(false); // Resets the view to show recommendations
  };

  // (Your existing handleApply function is perfect, no changes needed)
  const handleApply = async (projectId) => {
    try {
      const { data } = await apiClient.post(`/project/${projectId}/apply`, {});
      toast.success(data.message || "Applied successfully!");
      setAppliedProjects((prev) => [...prev, projectId]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to apply.");
    }
  };

  // All your rendering logic is preserved below.
  const projectsToDisplay = user
    ? projects.filter((project) => project.leader_id !== user.id)
    : projects;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 pb-20">
      {/* Header Section */}
      <div className="relative z-10 pt-16 pb-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-white mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                Explore Projects
              </span>
            </h1>
            <p className="text-lg text-gray-300">
              Find exciting projects to collaborate on and grow your skills.
            </p>
          </div>
          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col md:flex-row items-center gap-4 mb-8 justify-center"
          >
            <div className="relative w-full md:w-2/3">
              <Search
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Use AI Search: 'beginner projects about healthcare'..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/90 rounded-xl border border-gray-700/50"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full md:w-auto">
              Search
            </button>
            {isSearching && (
              <button
                type="button"
                onClick={clearSearch}
                className="btn btn-ghost w-full md:w-auto"
              >
                Clear Search
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-6xl mx-auto px-4">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="mb-8 p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg flex items-center gap-3">
              <Sparkles
                className={isSearching ? "text-blue-400" : "text-orange-400"}
              />
              <h2 className="text-xl font-semibold text-white">
                {isSearching
                  ? `Search Results for "${searchTerm}"`
                  : "Recommended For You"}
              </h2>
            </div>
            {projectsToDisplay.length === 0 ? (
              <div className="bg-gray-800 p-8 rounded-lg text-center mt-12">
                <h3 className="text-3xl text-gray-400 mb-2">
                  No projects found
                </h3>
                <p className="text-gray-500 text-lg">
                  Try a different search or check back later.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projectsToDisplay.map((project) => {
                  const isMember = userMemberships.accepted.includes(
                    project.id
                  );
                  const isPending =
                    userMemberships.pending.includes(project.id) ||
                    appliedProjects.includes(project.id);
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 hover:border-orange-500/30 shadow-lg hover:shadow-2xl transition-all flex flex-col"
                    >
                      <div className="relative w-full h-48 overflow-hidden">
                        {project.project_image ? (
                          <img
                            src={getImageUrl(project.project_image)}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                            <Star size={48} className="text-gray-500" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          {isMember && (
                            <span className="badge badge-success">Joined</span>
                          )}
                          {isPending && !isMember && (
                            <span className="badge badge-warning">Pending</span>
                          )}
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-orange-400 transition-colors duration-200 truncate">
                          {project.title}
                        </h3>
                        <p className="text-gray-300 mb-4 flex-grow line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-4 text-gray-400 text-sm mb-4">
                          <span className="flex items-center gap-1">
                            <Star size={16} className="text-yellow-400" />{" "}
                            {project.avg_rating || "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={16} /> {project.member_count || 0} /{" "}
                            {project.max_members}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tech_stack?.map((tag, index) => (
                            <span key={index} className="badge badge-outline">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between gap-4 mt-auto">
                          <Link
                            to={`/project/${project.id}`}
                            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-semibold"
                          >
                            View Details <ArrowRight size={16} />
                          </Link>
                          {isMember ? (
                            <span className="font-semibold text-green-500">
                              Joined
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApply(project.id)}
                              className={`btn btn-sm ${
                                isPending ? "btn-disabled" : "btn-info"
                              }`}
                              disabled={isPending}
                            >
                              <Briefcase size={16} />
                              {isPending ? "Pending" : "Apply"}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExploreProjects;
