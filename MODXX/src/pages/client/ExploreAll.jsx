import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../api/axiosInstance";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Grid3x3,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ProjectCard from "../../components/ProjectCard";

const PROJECTS_PER_PAGE = 9;

const ExploreAll = () => {
  const [allProjects, setAllProjects] = useState([]);
  const [displayedProjects, setDisplayedProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const [appliedProjects, setAppliedProjects] = useState([]);
  const [userMemberships, setUserMemberships] = useState({
    accepted: [],
    pending: [],
  });
  
  const { user } = useAuth();
  const observerTarget = useRef(null);

  // Fetch all projects initially
  useEffect(() => {
    const fetchAllProjects = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(
          "recommendations/recommendations/user"
        );
        const projects = response.data.recommendations || [];
        
        // Filter out user's own projects
        const filteredProjects = user
          ? projects.filter((project) => project.leader_id !== user.id)
          : projects;
        
        setAllProjects(filteredProjects);
        
        // Load first page
        const firstPage = filteredProjects.slice(0, PROJECTS_PER_PAGE);
        setDisplayedProjects(firstPage);
        setHasMore(filteredProjects.length > PROJECTS_PER_PAGE);
      } catch (error) {
        toast.error("Failed to fetch projects. Please try again later.");
        setAllProjects([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAllProjects();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Fetch user memberships
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

  // Load more projects
  const loadMoreProjects = () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    // Simulate a slight delay for smooth UX
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = page * PROJECTS_PER_PAGE;
      const endIndex = startIndex + PROJECTS_PER_PAGE;
      const newProjects = allProjects.slice(startIndex, endIndex);
      
      if (newProjects.length > 0) {
        setDisplayedProjects((prev) => [...prev, ...newProjects]);
        setPage(nextPage);
        setHasMore(endIndex < allProjects.length);
      } else {
        setHasMore(false);
      }
      
      setLoadingMore(false);
    }, 500);
  };

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreProjects();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore, page, allProjects]);

  // Handle apply
  const handleApply = async (projectId) => {
    try {
      const { data } = await apiClient.post(`/project/${projectId}/apply`, {});
      toast.success(data.message || "Applied successfully!");
      setAppliedProjects((prev) => [...prev, projectId]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to apply.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 pb-20">
      {/* Header Section */}
      <div className="relative z-10 pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white rounded-xl border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300 font-medium"
            >
              <ArrowLeft size={20} />
              Back to Explore
            </Link>
          </motion.div>

          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Grid3x3 className="w-12 h-12 text-orange-500" />
              <h1 className="text-5xl font-bold text-white">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  All Projects
                </span>
              </h1>
            </div>
            <p className="text-lg text-gray-300">
              Browse through all available projects and find your perfect match.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 mb-8 p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg"
          >
            <Sparkles className="text-orange-400" />
            <p className="text-white font-semibold">
              Showing {displayedProjects.length} of {allProjects.length} projects
            </p>
          </motion.div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="max-w-6xl mx-auto px-4">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <Loader2 className="w-16 h-16 text-orange-500 mx-auto" />
              </motion.div>
              <p className="text-gray-400 text-lg font-medium">Loading projects...</p>
            </div>
          </div>
        ) : allProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 p-12 rounded-lg text-center mt-12"
          >
            <h3 className="text-3xl text-gray-400 mb-2">No projects found</h3>
            <p className="text-gray-500 text-lg">
              Check back later for new projects.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Project Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {displayedProjects.map((project, index) => {
                  const isMember = userMemberships.accepted.includes(project.id);
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
                      showRecommendedBadge={false}
                      index={index % PROJECTS_PER_PAGE}
                    />
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-12"
              >
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-800/80 rounded-xl border border-gray-700/50">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-6 h-6 text-orange-500" />
                  </motion.div>
                  <span className="text-gray-300 font-medium">Loading more projects...</span>
                </div>
              </motion.div>
            )}

            {/* Intersection Observer Target */}
            <div ref={observerTarget} className="h-10" />

            {/* End Message */}
            {!hasMore && displayedProjects.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl">
                  <Sparkles className="text-orange-400" />
                  <span className="text-gray-400 font-medium">
                    You've reached the end! No more projects to load.
                  </span>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExploreAll;
