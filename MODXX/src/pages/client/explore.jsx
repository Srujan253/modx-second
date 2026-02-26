import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  Search,
  Star,
  Users,
  ArrowRight,
  Briefcase,
  Sparkles,
  SearchX,
  cn,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ProjectCard from "../../components/ProjectCard";
import apiClient, { BASE_URL } from "../../api/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

// Helper to get the image URL for a project
function getImageUrl(imagePath) {
  if (!imagePath) return "https://placehold.co/600x400/1f2937/d1d5db?text=Project+Image";
  if (imagePath.startsWith("http")) return imagePath;
  return `${BASE_URL}${imagePath.startsWith("/") ? imagePath.substring(1) : imagePath}`;
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
        const { data } = await apiClient.get(`project/memberships`);
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
      const { data } = await apiClient.post(`project/${projectId}/apply`, {});
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
            className="flex flex-col md:flex-row items-center gap-4 mb-12 justify-center"
          >
            <div className="relative w-full md:w-2/3 group">
              <Search
                size={18}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors"
              />
              <Input
                type="text"
                placeholder="Use AI Search: 'beginner projects about healthcare'..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 h-14 bg-gray-900/50 border-gray-800 rounded-2xl focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full md:w-auto h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_6px_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none transition-all"
            >
              Execute Search
            </Button>
            {isSearching && (
              <Button
                type="button"
                variant="ghost"
                onClick={clearSearch}
                className="w-full md:w-auto h-14 text-gray-400 hover:text-white font-black uppercase tracking-widest"
              >
                Clear
              </Button>
            )}
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-6xl mx-auto px-4">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-gray-900/50 border-gray-800 p-6 space-y-6">
                <Skeleton className="w-full h-48 rounded-xl" />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="flex justify-between items-center pt-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-8 p-6 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isSearching ? "bg-blue-500/10" : "bg-orange-500/10"
                )}>
                  <Sparkles
                    className={isSearching ? "text-blue-400" : "text-orange-400"}
                    size={20}
                  />
                </div>
                <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">
                  {isSearching
                    ? `Results for "${searchTerm}"`
                    : "Recommended For You"}
                </h2>
              </div>
              {!isSearching && projectsToDisplay.length > 3 && (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/explore/all')}
                  className="text-orange-500 hover:text-orange-400 font-black uppercase tracking-widest text-xs"
                >
                  View All Deployment <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>
            {projectsToDisplay.length === 0 ? (
              <div className="bg-gray-900/50 border-2 border-dashed border-gray-800 p-16 rounded-[2.5rem] text-center mt-12">
                <div className="bg-gray-800/50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 border-4 border-gray-700/50">
                  <SearchX size={40} className="text-gray-600" />
                </div>
                <h3 className="text-3xl font-black italic tracking-tighter text-gray-400 mb-4 uppercase">
                  No signals detected
                </h3>
                <p className="text-gray-500 font-medium max-w-sm mx-auto">
                   The requested sector returned no results. Try adjusting the frequency of your search parameters.
                </p>
              </div>
            ) : (
              <>
                {/* Project Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projectsToDisplay
                    .slice(0, isSearching ? projectsToDisplay.length : 3)
                    .map((project, index) => {
                      const isMember = userMemberships.accepted.includes(
                        project.id
                      );
                      const isPending =
                        userMemberships.pending.includes(project.id) ||
                        appliedProjects.includes(project.id);
                      
                      return (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          isMember={isMember}
                          isPending={isPending}
                          onApply={handleApply}
                          showRecommendedBadge={!isSearching && index < 3}
                          index={index}
                        />
                      );
                    })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExploreProjects;
