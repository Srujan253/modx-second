import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../api/axiosInstance";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Sparkles,
  Grid3x3,
  SearchX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
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
            className="mb-8"
          >
            <Button
              asChild
              variant="outline"
              className="bg-gray-900/50 backdrop-blur-xl border-gray-800 hover:border-orange-500/50 text-gray-400 hover:text-white font-black uppercase tracking-[0.2em] text-[10px] h-10 px-6 rounded-xl transition-all duration-300"
            >
              <Link to="/explore">
                <ArrowLeft size={14} className="mr-2" /> Sector Return
              </Link>
            </Button>
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
          {/* Stats Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center mb-12"
          >
            <Badge variant="outline" className="bg-orange-500/5 border-orange-500/20 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.1)]">
              <Sparkles className="text-orange-500 w-4 h-4 mr-2" />
              <span className="text-orange-100 font-black uppercase tracking-widest text-[10px]">
                CALIBRATED: {displayedProjects.length} / {allProjects.length} SIGNALS DETECTED
              </span>
            </Badge>
          </motion.div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="max-w-6xl mx-auto px-4">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-gray-900/50 border-gray-800 p-6 space-y-6 animate-pulse">
                <Skeleton className="w-full h-48 rounded-xl" />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex gap-2 pt-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </Card>
            ))}
          </div>
        ) : allProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/50 border-2 border-dashed border-gray-800 p-20 rounded-[3rem] text-center mt-12 shadow-2xl"
          >
            <div className="bg-gray-800/50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 border-4 border-gray-700/50">
              <SearchX size={48} className="text-gray-600" />
            </div>
            <h3 className="text-4xl font-black italic tracking-tighter text-gray-500 mb-4 uppercase">
              GRID VACANT
            </h3>
            <p className="text-gray-600 font-medium max-w-sm mx-auto">
              The project matrix is currently empty. Re-initiate search at a later timestamp.
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-gray-900/50 border-gray-800 p-6 space-y-6 opacity-50">
                    <Skeleton className="w-full h-48 rounded-xl" />
                    <Skeleton className="h-8 w-3/4" />
                  </Card>
                ))}
              </div>
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
