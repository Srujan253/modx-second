import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import MyTaskPanel from "../components/MyTaskPanel";
import RelatedProjects from "../components/RelatedProjects";
import Modal from "../components/Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Settings, 
  Trash2, 
  Edit, 
  Layout, 
  Calendar,
  Clock,
  ExternalLink,
  Target,
  Star
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import axiosInstance, { BASE_URL } from "../api/axiosInstance";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        // Try public endpoint first (for explore page), fallback to protected if needed
        let data;
        try {
          const res = await axiosInstance.get(`project/public/${projectId}`);
          data = res.data;
        } catch (err) {
          // fallback to protected route if public fails (e.g. for members-only features)
          const res = await axiosInstance.get(`project/${projectId}`);
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
        const { data } = await axiosInstance.get(`project/${projectId}/requests`);
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
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
          {/* Sidebar Skeleton */}
          <div className="hidden md:block w-64 space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          
          {/* Main Content Skeleton */}
          <div className="flex-1 space-y-8">
            <Skeleton className="w-full h-80 rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <div className="flex gap-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-28" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
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

  // Check if current user is the project leader
  // Backend populates leaderId as an object with {_id, fullName}, so we need to access ._id
  const leaderIdValue = typeof project.leaderId === 'object' 
    ? project.leaderId?._id 
    : project.leaderId;
  const isLeader = leaderIdValue?.toString() === user?.id?.toString();
  console.log("🔍 Leader check:", {
    projectLeaderId: project.leaderId,
    leaderIdValue,
    userId: user?.id,
    isLeader
  });
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("/uploads/")) {
      return `${BASE_URL}${url.substring(1)}`;
    }
    if (url.startsWith("/api/v1/uploads/")) {
      return `${BASE_URL}${url.replace("/api/v1/", "")}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col md:flex-row gap-8">
      {/* Leftmost: Leader button to Task Management */}
      {isLeader && (
        <div className="w-full md:w-64 flex flex-col gap-6 mb-8 md:mb-0">
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest py-6 rounded-2xl shadow-[0_6px_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none transition-all"
            onClick={() => navigate(`/project/${projectId}/tasks`)}
          >
            <Layout size={18} className="mr-2" /> Task Center
          </Button>

          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-black italic tracking-tighter text-orange-500">
                PENDING REQUESTS
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[50vh] overflow-y-auto">
              {requestsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <p className="text-gray-500 font-bold text-sm text-center py-4 italic">Zero active signals.</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="p-4 bg-gray-900/50 rounded-xl border border-gray-700/30 group">
                      <p className="font-black text-white text-sm group-hover:text-orange-500 transition-colors truncate">
                        {req.full_name}
                      </p>
                      <p className="text-gray-500 text-[10px] font-bold mb-3">{req.email}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white font-black uppercase text-[10px]"
                          onClick={async () => {
                            try {
                              await axiosInstance.post(`project/${projectId}/requests/${req.id}/accept`, {});
                              toast.success("Member recruited.");
                              setPendingRequests(prev => prev.filter(r => r.id !== req.id));
                            } catch (err) {
                              toast.error("Operation failed.");
                            }
                          }}
                        >
                          Recruit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 text-gray-500 hover:text-red-500 font-black uppercase text-[10px]"
                          onClick={async () => {
                            try {
                              await axiosInstance.delete(`project/${projectId}/requests/${req.id}`);
                              toast.info("Request denied.");
                              setPendingRequests(prev => prev.filter(r => r.id !== req.id));
                            } catch (err) {
                              toast.error("Operation failed.");
                            }
                          }}
                        >
                          Deny
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
                <Badge key={index} variant="secondary" className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-black uppercase text-[10px] tracking-widest px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.tech_stack?.map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-red-500/5 text-red-500 border-red-500/20 font-black uppercase text-[10px] tracking-widest px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        {isLeader && (
          <div className="mt-12">
            <Card className="bg-gray-900 border-2 border-orange-500/20 overflow-hidden">
              <CardHeader className="bg-orange-500/5 border-b border-orange-500/10">
                <CardTitle className="text-2xl font-black italic tracking-tighter text-white">LEADER TOOLS</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-gray-400 font-medium mb-8">
                  Authorize system modifications, finalize recruitment, and manage the core project architecture.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => navigate(`/project/${projectId}/edit`)}
                    className="bg-white text-black hover:bg-gray-200 font-black uppercase tracking-widest text-xs h-12 px-8"
                  >
                    <Edit size={16} className="mr-2" /> Modify Specs
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="border-gray-800 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-gray-500 font-black uppercase tracking-widest text-xs h-12 px-8"
                  >
                    <Trash2 size={16} className="mr-2" /> Abort Mission
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <RelatedProjects currentProjectId={projectId} />

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={async () => {
            try {
              await axiosInstance.delete(`project/${projectId}`);
              toast.success("Project deleted successfully.");
              navigate("/dashboard");
            } catch (error) {
              toast.error(
                error.response?.data?.message || "Failed to delete project."
              );
            }
          }}
          title="Delete Project"
          message="Are you sure you want to delete this project? This action cannot be undone and all project data will be lost forever."
          confirmText="Delete Project"
        />
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
