import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import axiosInstance, { BASE_URL } from "../api/axiosInstance";
import { toast } from "react-toastify";
import { 
  Plus, 
  Star, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  User,
  Calendar,
  Settings,
  Eye,
  Grid3X3,
  List,
  Target,
  Bell,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "../components/EmptyState";


const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]); // Projects created by user
  const [selectedProjects, setSelectedProjects] = useState([]); // Projects user is a member (accepted)
  const [pendingRequests, setPendingRequests] = useState([]); // Projects user has applied (pending)
  const [invites, setInvites] = useState([]); // Project invites for this user
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [activeTab, setActiveTab] = useState('my-projects'); // my-projects, selected, pending
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all dashboard data
  const fetchAll = async () => {
    try {
      setLoading(true);
      // 1. Projects created by user
      const { data: myProjects } = await axiosInstance.get("project/user-projects");
      setProjects(myProjects.projects);

      // 2. Projects where user is a member (accepted) or has pending request
      const { data: memberData } = await axiosInstance.get("project/memberships");
      setSelectedProjects(memberData.accepted || []);
      setPendingRequests(memberData.pending || []);

      // 3. Fetch project invites (status: 'invited')
      const { data: inviteData } = await axiosInstance.get("project/invites");
      setInvites(inviteData.invites || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch dashboard data."
      );
    } finally {
      setLoading(false);
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
      await axiosInstance.patch(
        `project/${projectId}/requests/${inviteId}`,
        { status: "accepted" }
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
      await axiosInstance.delete(
        `project/${projectId}/requests/${inviteId}`
      );
      toast.success("Invitation rejected.");
      fetchAll(); // Refresh dashboard data
    } catch (err) {
      toast.error("Failed to reject invitation.");
    }
  };

  const ProjectCard = ({ project, type, isListView = false }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className={`overflow-hidden border-gray-800 bg-gray-900/50 backdrop-blur-xl hover:border-orange-500/50 transition-all duration-300 shadow-2xl ${
        isListView ? 'flex flex-col sm:flex-row' : ''
      }`}>
        <div className={`relative ${isListView ? 'w-full sm:w-64 h-48 sm:h-auto' : 'h-48'} overflow-hidden`}>
          <img
            src={
              project.project_image
                ? project.project_image.startsWith("http")
                  ? project.project_image
                  : `${BASE_URL}${project.project_image.startsWith("/") ? project.project_image.substring(1) : project.project_image}`
                : "https://placehold.co/600x400/1f2937/d1d5db?text=Project+Image"
            }
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent opacity-60" />
        </div>
        
        <CardContent className={`p-6 flex flex-col ${isListView ? 'flex-1' : ''}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-black italic tracking-tighter text-white group-hover:text-orange-500 transition-colors truncate pr-4">
              {project.title}
            </h3>
            {type === 'pending' && (
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-black uppercase text-[10px] tracking-widest">
                <Clock className="w-3 h-3 mr-1" /> Pending
              </Badge>
            )}
          </div>

          <p className="text-gray-400 text-sm font-medium line-clamp-2 mb-6 leading-relaxed">
            {project.description}
          </p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1.5 bg-gray-800/50 px-2 py-1 rounded-lg border border-gray-700/50">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-black text-gray-300">{project.avg_rating || "0.0"}</span>
            </div>
            {project.created_at && (
              <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold font-mono">
                <Calendar className="w-4 h-4" />
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {(Array.isArray(project.tech_stack)
              ? project.tech_stack
              : String(project.tech_stack || "").split(",").map(t => t.trim()).filter(Boolean)
            ).slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="bg-gray-800/30 border-gray-700/50 text-gray-400 font-bold hover:border-orange-500/30">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between">
            <Button
              asChild
              variant="outline"
              className="border-orange-500/20 hover:border-orange-500/50 hover:bg-orange-500/10 text-orange-500 font-black uppercase tracking-widest text-[10px] px-6"
            >
              <Link to={`/project/${project.id}`}>
                <Eye className="w-4 h-4 mr-2" /> View Operations
              </Link>
            </Button>
            
            {type === 'my-projects' && (
              <Button size="icon" variant="ghost" className="text-gray-500 hover:text-orange-500 transition-colors">
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const InviteCard = ({ invite, isListView = false }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`border-orange-500/20 bg-gray-900/50 backdrop-blur-xl p-6 hover:border-orange-500/40 transition-all ${
        isListView ? 'flex flex-col sm:flex-row items-center gap-6' : ''
      }`}>
        <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-orange-500/20">
          <Target className="text-orange-500 w-6 h-6" />
        </div>
        <div className="flex-1 mt-4 sm:mt-0">
          <Badge variant="outline" className="mb-2 bg-orange-500/5 text-orange-500 border-orange-500/20 font-black uppercase text-[10px] tracking-widest">
            New Invitation
          </Badge>
          <h4 className="text-2xl font-black italic tracking-tighter text-white mb-2">
            {invite.project_title}
          </h4>
          <p className="text-gray-400 text-sm font-medium mb-6">
            Command authorization requested by <span className="text-orange-500 font-black italic">{invite.leader_name}</span>. Join the operation?
          </p>
          
          <div className="flex gap-4">
            <Button
              onClick={() => handleAcceptInvite(invite.id, invite.project_id)}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs h-11"
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Accept
            </Button>
            <Button
              variant="outline"
              onClick={() => handleRejectInvite(invite.id, invite.project_id)}
              className="flex-1 border-gray-800 hover:bg-gray-800 text-gray-400 font-black uppercase tracking-widest text-xs h-11"
            >
              Reject
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const renderProjects = () => {
    if (loading) {
      const isListView = viewMode === 'list';
      return (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6' 
            : 'flex flex-col gap-4'
        }>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`bg-gray-900/50 rounded-2xl p-6 border border-gray-800 ${isListView ? 'flex gap-6' : ''}`}>
              <Skeleton className={`${isListView ? 'w-64 h-48' : 'w-full h-48'} rounded-xl mb-6`} />
              <div className="flex-1">
                <Skeleton className="w-3/4 h-8 mb-4" />
                <Skeleton className="w-full h-4 mb-2" />
                <Skeleton className="w-2/3 h-4 mb-6" />
                <div className="flex gap-2">
                  <Skeleton className="w-20 h-6" />
                  <Skeleton className="w-20 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    let emptyConfig = {};
    switch (activeTab) {
      case 'my-projects':
        emptyConfig = {
          icon: Plus,
          title: "No projects yet",
          description: "Start your journey by creating your first project!"
        };
        if (projects.length === 0) return <EmptyState type={activeTab} {...emptyConfig} />;
        break;
      case 'selected':
        emptyConfig = {
          icon: CheckCircle,
          title: "No joined projects",
          description: "You are not a member of any projects yet."
        };
        if (selectedProjects.length === 0) return <EmptyState type={activeTab} {...emptyConfig} />;
        break;
      case 'pending':
        emptyConfig = {
          icon: Clock,
          title: "No pending requests",
          description: "You have no pending join requests."
        };
        if (pendingRequests.length === 0) return <EmptyState type={activeTab} {...emptyConfig} />;
        break;
      case 'invites':
        emptyConfig = {
          icon: Bell,
          title: "No invitations",
          description: "You don't have any pending project invitations."
        };
        if (invites.length === 0) return <EmptyState type={activeTab} {...emptyConfig} />;
        break;
      default:
        break;
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${viewMode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6' 
              : 'flex flex-col gap-3 sm:gap-4'
          }
        >
          {activeTab === 'invites' ? (
            invites.map((invite) => (
              <InviteCard 
                key={invite.id} 
                invite={invite} 
                isListView={viewMode === 'list'} 
              />
            ))
          ) : (
            (activeTab === 'my-projects' ? projects : activeTab === 'selected' ? selectedProjects : pendingRequests).map((project) => (
              <ProjectCard 
                key={`${activeTab}-${project.id}`} 
                project={project} 
                type={activeTab}
                isListView={viewMode === 'list'} 
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                  Welcome back, <span className="text-orange-500">{user?.name || user?.full_name}</span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">Manage your projects and collaborations</p>
              </div>
              <div className="w-full sm:w-auto">
                <Button 
                  asChild
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] py-6 px-8 rounded-2xl shadow-[0_8px_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none transition-all"
                >
                  <Link to="/project/create">
                    <Plus className="w-5 h-5 mr-1" /> Create Operation
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Navigation Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div className="flex bg-gray-900/80 rounded-2xl p-1.5 border border-gray-800 backdrop-blur-3xl w-full sm:w-auto overflow-x-auto shadow-2xl">
                {[
                  { id: 'my-projects', label: 'My Projects', count: projects.length },
                  { id: 'selected', label: 'Joined', count: selectedProjects.length },
                  { id: 'pending', label: 'Applied', count: pendingRequests.length },
                  { id: 'invites', label: 'Invites', count: invites.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <Badge variant={activeTab === tab.id ? "default" : "secondary"} className={`rounded-md text-[9px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-500'}`}>
                        {tab.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-4">
                <div className="flex bg-gray-800/50 rounded-lg p-1 backdrop-blur-sm border border-gray-700/50">
                  <motion.button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Grid3X3 size={16} />
                  </motion.button>
                  <motion.button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <List size={16} />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            {renderProjects()}
          </div>
        </div>

        {/* Desktop Sidebar (Optional/Secondary for Invitations) */}
        <motion.div 
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden xl:block w-96 bg-gray-800/50 backdrop-blur-sm border-l border-gray-700/50 p-6 h-screen overflow-y-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Bell size={20} className="text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">Latest Invites</h3>
              <p className="text-gray-400 text-sm">Quick access to project invites</p>
            </div>
          </div>

          <AnimatePresence>
            {invites.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <Bell size={24} className="text-gray-500" />
                </div>
                <p className="text-gray-400">No new invitations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invites.map((invite) => (
                  <motion.div
                    key={`sidebar-${invite.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-900/80 rounded-xl p-4 border border-gray-700/50 hover:border-orange-500/30 transition-all"
                  >
                    <h4 className="font-semibold text-orange-400 mb-1 truncate">{invite.project_title}</h4>
                    <p className="text-xs text-gray-400 mb-3">From {invite.leader_name}</p>
                    <button 
                      onClick={() => setActiveTab('invites')}
                      className="text-xs font-bold text-orange-500 hover:text-orange-400 flex items-center gap-1"
                    >
                      View in Invitations Tab <ArrowRight size={12} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
