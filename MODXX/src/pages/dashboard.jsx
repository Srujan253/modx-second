import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
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
  Bell,
  Filter,
  Grid3X3,
  List
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]); // Projects created by user
  const [selectedProjects, setSelectedProjects] = useState([]); // Projects user is a member (accepted)
  const [pendingRequests, setPendingRequests] = useState([]); // Projects user has applied (pending)
  const [invites, setInvites] = useState([]); // Project invites for this user
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [activeTab, setActiveTab] = useState('my-projects'); // my-projects, selected, pending
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

  const ProjectCard = ({ project, type, isListView = false }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700/50 hover:border-orange-500/30 group ${
        isListView ? 'flex flex-col sm:flex-row items-start sm:items-center' : ''
      }`}
      whileHover={{ y: -4, scale: 1.02 }}
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
        className={`${
          isListView 
            ? 'w-full sm:w-48 h-32 sm:h-32' 
            : 'w-full h-32 sm:h-40 lg:h-48'
        } object-cover group-hover:scale-105 transition-transform duration-300`}
      />
      <div className={`p-3 sm:p-4 lg:p-6 ${isListView ? 'flex-1' : ''}`}>
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <h3 className={`text-base sm:text-lg lg:text-xl font-bold ${
            type === 'my-projects' ? 'text-orange-400' :
            type === 'selected' ? 'text-green-400' : 'text-yellow-400'
          } group-hover:text-white transition-colors duration-200 line-clamp-1`}>
            {project.title}
          </h3>
          {type === 'pending' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-700/50 text-yellow-200 rounded-full text-xs font-semibold border border-yellow-600/30 ml-2 flex-shrink-0">
              <Clock size={10} className="sm:hidden" />
              <Clock size={12} className="hidden sm:block" />
              <span className="hidden sm:inline">Pending</span>
            </span>
          )}
        </div>
        <p className="text-gray-300 mb-3 sm:mb-4 line-clamp-2 text-sm sm:text-base">
          {project.description}
        </p>
        
        <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2 text-gray-400">
            <Star size={14} className="sm:hidden text-yellow-400" />
            <Star size={16} className="hidden sm:block text-yellow-400" />
            <span>{project.avg_rating || "N/A"}</span>
          </div>
          {project.created_at && (
            <div className="flex items-center gap-1 sm:gap-2 text-gray-400">
              <Calendar size={14} className="sm:hidden" />
              <Calendar size={16} className="hidden sm:block" />
              <span className="hidden sm:inline">{new Date(project.created_at).toLocaleDateString()}</span>
              <span className="sm:hidden">{new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
          {(Array.isArray(project.tech_stack)
            ? project.tech_stack
            : String(project.tech_stack || "")
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
          ).slice(0, isListView ? 2 : 3).map((tag, index) => (
            <span
              key={index}
              className="bg-gray-700/70 text-gray-300 text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-gray-600/50 hover:bg-gray-600/70 transition-colors"
            >
              {tag}
            </span>
          ))}
          {(Array.isArray(project.tech_stack) ? project.tech_stack : String(project.tech_stack || "").split(",")).length > (isListView ? 2 : 3) && (
            <span className="text-xs text-gray-400 px-2 py-0.5 sm:py-1">
              +{(Array.isArray(project.tech_stack) ? project.tech_stack : String(project.tech_stack || "").split(",")).length - (isListView ? 2 : 3)} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <Link
            to={`/project/${project.id}`}
            className={`inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-xs sm:text-sm ${
              type === 'my-projects' 
                ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30' :
              type === 'selected' 
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30' : 
                'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30'
            }`}
          >
            <Eye size={14} className="sm:hidden" />
            <Eye size={16} className="hidden sm:block" />
            <span className="hidden sm:inline">View Details</span>
            <span className="sm:hidden">View</span>
          </Link>
          {type === 'my-projects' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-orange-400 transition-colors"
            >
              <Settings size={14} className="sm:hidden" />
              <Settings size={16} className="hidden sm:block" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );

  const EmptyState = ({ type, icon: Icon, title, description }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 lg:p-12 rounded-xl text-center border border-gray-700/50"
    >
      <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
        <Icon size={24} className="sm:hidden text-gray-500" />
        <Icon size={32} className="hidden sm:block text-gray-500" />
      </div>
      <h3 className="text-xl sm:text-2xl text-gray-400 mb-2 font-semibold">{title}</h3>
      <p className="text-gray-500 text-sm sm:text-base">{description}</p>
    </motion.div>
  );

  const renderProjects = () => {
    let projectsToShow = [];
    let emptyConfig = {};

    switch (activeTab) {
      case 'my-projects':
        projectsToShow = projects;
        emptyConfig = {
          icon: Plus,
          title: "No projects yet",
          description: "Start your journey by creating your first project!"
        };
        break;
      case 'selected':
        projectsToShow = selectedProjects;
        emptyConfig = {
          icon: CheckCircle,
          title: "No joined projects",
          description: "You are not a member of any projects yet."
        };
        break;
      case 'pending':
        projectsToShow = pendingRequests;
        emptyConfig = {
          icon: Clock,
          title: "No pending requests",
          description: "You have no pending join requests."
        };
        break;
      default:
        projectsToShow = projects;
    }

    if (projectsToShow.length === 0) {
      return <EmptyState type={activeTab} {...emptyConfig} />;
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
          {projectsToShow.map((project) => (
            <ProjectCard 
              key={`${activeTab}-${project.id}`} 
              project={project} 
              type={activeTab}
              isListView={viewMode === 'list'} 
            />
          ))}
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
                  Welcome back, <span className="text-orange-500">{user?.name}</span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">Manage your projects and collaborations</p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/project/create"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base w-full sm:w-auto"
                >
                  <Plus size={18} className="sm:hidden" />
                  <Plus size={20} className="hidden sm:block" />
                  <span className="sm:inline">Create New Project</span>
                  <span className="sm:hidden">Create Project</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Navigation Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div className="flex bg-gray-800/50 rounded-xl p-1 backdrop-blur-sm border border-gray-700/50 w-full sm:w-auto overflow-x-auto">
                {[
                  { id: 'my-projects', label: 'My Projects', shortLabel: 'My', count: projects.length },
                  { id: 'selected', label: 'Joined Projects', shortLabel: 'Joined', count: selectedProjects.length },
                  { id: 'pending', label: 'Pending', shortLabel: 'Pending', count: pendingRequests.length }
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === tab.id
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs ${
                        activeTab === tab.id ? 'bg-white/20' : 'bg-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </motion.button>
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

            {/* Projects Grid */}
            {renderProjects()}
          </div>
        </div>

        {/* Invitations Sidebar - Mobile: Show as modal or collapsible section */}
        <motion.div 
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full lg:w-96 bg-gray-800/50 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-gray-700/50 p-4 sm:p-6 lg:h-screen lg:overflow-y-auto"
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Bell size={18} className="sm:hidden" />
              <Bell size={20} className="hidden sm:block text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-white">Invitations</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Project invites & notifications</p>
            </div>
            {invites.length > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                {invites.length}
              </span>
            )}
          </div>

          <AnimatePresence>
            {invites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 sm:py-12"
              >
                <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <Bell size={20} className="sm:hidden text-gray-500" />
                  <Bell size={24} className="hidden sm:block text-gray-500" />
                </div>
                <p className="text-gray-400 text-sm sm:text-base">No new invitations</p>
              </motion.div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {invites.map((invite, index) => (
                  <motion.div
                    key={invite.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-700/50 hover:border-orange-500/30 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 sm:w-10 h-8 sm:h-10 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={14} className="sm:hidden text-orange-400" />
                        <User size={16} className="hidden sm:block text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-orange-400 truncate text-sm sm:text-base">
                          {invite.project_title}
                        </h4>
                        <p className="text-gray-300 text-xs sm:text-sm">
                          Invited by <span className="font-medium">{invite.leader_name}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-semibold transition-all border border-green-500/30 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                        onClick={() => handleAcceptInvite(invite.id, invite.project_id)}
                      >
                        <CheckCircle size={14} className="sm:hidden" />
                        <CheckCircle size={16} className="hidden sm:block" />
                        Accept
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold transition-all border border-red-500/30 text-xs sm:text-sm"
                        onClick={() => handleRejectInvite(invite.id, invite.project_id)}
                      >
                        Reject
                      </motion.button>
                    </div>
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