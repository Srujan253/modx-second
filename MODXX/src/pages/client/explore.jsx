// Helper to get the image URL for a project
function getImageUrl(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  // Always use /uploads/ path with API URL
  return `${API_URL}/uploads/${imagePath.replace(/^.*[\\\/]/, "")}`;
}
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  Search, 
  Star, 
  Users, 
  ArrowRight, 
  Briefcase,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Code,
  Sparkles,
  ChevronDown,
  SlidersHorizontal,
  X,
  Heart,
  Eye,
  Clock,
  CheckCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const ExploreProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    skills: "",
    techStack: "",
  });
  const [appliedProjects, setAppliedProjects] = useState([]);
  const [userMemberships, setUserMemberships] = useState({
    accepted: [],
    pending: [],
  });
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [favorites, setFavorites] = useState([]);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const skills = [
    "React", "Python", "UI/UX Design", "PostgreSQL", "Node.js", "Express",
    "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "Django",
    "Flask", "MongoDB", "MySQL", "AWS", "Azure", "Figma", "Other"
  ];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/project/explore`, {
        params: {
          search: searchTerm,
          skills: filters.skills,
          techStack: filters.techStack,
        },
        withCredentials: true,
      });
      setProjects(data.projects || []);
    } catch (error) {
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user memberships (accepted and pending)
  useEffect(() => {
    const fetchMemberships = async () => {
      if (!user) return;
      try {
        const { data } = await axios.get(`${API_URL}/project/memberships`, {
          withCredentials: true,
        });
        setUserMemberships({
          accepted: data.accepted?.map((p) => p.id) || [],
          pending: data.pending?.map((p) => p.id) || [],
        });
      } catch (err) {
        // ignore
      }
    };
    fetchMemberships();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [user, searchTerm, filters.skills, filters.techStack]);

  // Rendering logic
  let filteredProjects = user
    ? projects.filter((project) => project.leader_id !== user.id)
    : projects;
  if (filters.skills === "Other") {
    const knownSkills = [
      "React",
      "Python",
      "UI/UX Design",
      "PostgreSQL",
      "Node.js",
      "Express",
      "JavaScript",
      "TypeScript",
      "Java",
      "C++",
      "C#",
      "Go",
      "Rust",
      "Django",
      "Flask",
      "MongoDB",
      "MySQL",
      "AWS",
      "Azure",
      "Figma",
    ];
    filteredProjects = filteredProjects.filter((project) => {
      if (!project.required_skills) return true;
      return project.required_skills.every(
        (skill) => !knownSkills.includes(skill)
      );
    });
  } else if (filters.skills) {
    filteredProjects = filteredProjects.filter((project) =>
      project.required_skills?.includes(filters.skills)
    );
  }
  // Sort projects
  filteredProjects.sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.avg_rating || 0) - (a.avg_rating || 0);
      case 'members':
        return (b.member_count || 0) - (a.member_count || 0);
      case 'newest':
      default:
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }
  });

  // Handle apply to join - KEEPING EXACT SAME LOGIC
  const handleApply = async (projectId) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/project/${projectId}/apply`,
        {},
        { withCredentials: true }
      );
      toast.success(data.message || "Applied successfully!");
      setAppliedProjects((prev) => [...prev, projectId]); // Mark as pending immediately
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to apply to project."
      );
    }
  };

  const toggleFavorite = (projectId) => {
    setFavorites(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-400 rounded-full font-medium mb-6 border border-orange-500/20 backdrop-blur-sm">
              <Sparkles size={16} />
              Discover Amazing Projects
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Projects</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Find exciting projects to collaborate on and grow your skills with talented developers
            </p>
          </motion.div>

          {/* Search and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Search Bar */}
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects by name, description, or technology..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 focus:border-orange-500/50 focus:outline-none text-white placeholder-gray-400 transition-all hover:bg-gray-800/70"
              />
            </div>

            {/* Filter and View Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all border ${
                    showFilters
                      ? 'bg-orange-500 text-white border-orange-400 shadow-lg'
                      : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border-gray-600/50'
                  }`}
                >
                  <SlidersHorizontal size={16} />
                  Filters
                </motion.button>

                {/* Active Filter Display */}
                <AnimatePresence>
                  {filters.skills && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg text-sm border border-orange-500/30"
                    >
                      <Code size={14} />
                      {filters.skills}
                      <button
                        onClick={() => setFilters({ ...filters, skills: "" })}
                        className="hover:bg-orange-500/30 rounded-full p-0.5 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-4 py-2 pr-8 bg-gray-800/80 text-gray-300 rounded-xl border border-gray-600/50 focus:outline-none focus:border-orange-500/50 transition-all cursor-pointer hover:bg-gray-700/80"
                  >
                    <option value="newest">Newest First</option>
                    <option value="rating">Highest Rated</option>
                    <option value="members">Most Popular</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-800/80 rounded-xl p-1 border border-gray-600/50">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid3X3 size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List size={16} />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Expandable Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
                >
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Filter size={18} />
                    Filter by Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <motion.button
                        key={skill}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilters({ 
                          ...filters, 
                          skills: filters.skills === skill ? "" : skill 
                        })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          filters.skills === skill
                            ? 'bg-orange-500 text-white shadow-lg'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/30'
                        }`}
                      >
                        {skill}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Results Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {filteredProjects.length} Projects Found
            </h2>
            <p className="text-gray-400">
              {searchTerm && `Showing results for "${searchTerm}"`}
              {filters.skills && (searchTerm ? ` filtered by ${filters.skills}` : `Filtered by ${filters.skills}`)}
            </p>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-700 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin animate-reverse"></div>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center backdrop-blur-sm border border-gray-700/50">
              <Search size={40} className="text-gray-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-400 mb-4">No projects found</h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              Try adjusting your search criteria or browse all available projects
            </p>
          </motion.div>
        ) : (
          /* Projects Grid */
          <motion.div
            layout
            className={viewMode === 'grid' 
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-8' 
              : 'flex flex-col gap-6'
            }
          >
            <AnimatePresence>
              {filteredProjects.map((project, index) => {
                const isMember = userMemberships.accepted.includes(project.id);
                const isPending =
                  userMemberships.pending.includes(project.id) ||
                  appliedProjects.includes(project.id);
                const canApply = !isMember && !isPending;
                const isFavorite = favorites.includes(project.id);

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 ${
                      viewMode === 'list' ? 'flex items-center' : 'flex flex-col'
                    }`}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    {/* Animated Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 -top-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
                    
                    {/* Project Image */}
                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-64 h-40 flex-shrink-0' : 'w-full h-48'}`}>
                      {project.project_image ? (
                        <img
                          src={getImageUrl(project.project_image)}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                          <Code size={48} className="text-gray-500" />
                        </div>
                      )}
                      
                      {/* Overlay Actions */}
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(project.id);
                          }}
                          className={`p-2 rounded-full backdrop-blur-sm border transition-colors ${
                            isFavorite 
                              ? 'bg-red-500/80 border-red-400 text-white' 
                              : 'bg-gray-900/80 border-gray-600 text-gray-300 hover:text-red-400'
                          }`}
                        >
                          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                        </motion.button>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        {isMember && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/90 text-green-100 rounded-full text-xs font-semibold backdrop-blur-sm border border-green-400/30">
                            <CheckCircle size={12} /> Joined
                          </span>
                        )}
                        {isPending && !isMember && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/90 text-yellow-100 rounded-full text-xs font-semibold backdrop-blur-sm border border-yellow-400/30">
                            <Clock size={12} /> Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`p-6 flex-1 ${viewMode === 'list' ? '' : 'flex flex-col'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors duration-200 line-clamp-1">
                          {project.title}
                        </h3>
                        <div className="flex items-center gap-1 text-yellow-400 ml-4 flex-shrink-0">
                          <Star size={14} fill="currentColor" />
                          <span className="text-sm font-medium">{project.avg_rating || "N/A"}</span>
                        </div>
                      </div>

                      <p className="text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1 text-blue-400">
                          <Users size={14} />
                          <span>{project.member_count || 0}/{project.max_members}</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-400">
                          <TrendingUp size={14} />
                          <span>Active</span>
                        </div>
                      </div>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.tech_stack?.slice(0, viewMode === 'list' ? 3 : 4).map((tag, tagIndex) => (
                          <motion.span
                            key={tagIndex}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: (index * 0.1) + (tagIndex * 0.05) }}
                            className="px-2.5 py-1 bg-gray-700/70 text-gray-300 text-xs font-medium rounded-full border border-gray-600/50 hover:border-orange-500/50 hover:text-orange-300 transition-all cursor-default"
                          >
                            {tag}
                          </motion.span>
                        ))}
                        {project.tech_stack?.length > (viewMode === 'list' ? 3 : 4) && (
                          <span className="px-2.5 py-1 text-gray-400 text-xs">
                            +{project.tech_stack.length - (viewMode === 'list' ? 3 : 4)} more
                          </span>
                        )}
                      </div>

                      {/* Actions - KEEPING EXACT SAME LOGIC */}
                      <div className="flex items-center gap-4 mt-auto">
                        <Link
                          to={`/project/${project.id}`}
                          className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors font-semibold"
                        >
                          View Details <ArrowRight size={16} />
                        </Link>
                        {isMember ? (
                          <span className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold">
                            Joined
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApply(project.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition duration-200 font-semibold ${
                              isPending
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                            disabled={isPending}
                          >
                            <Briefcase size={16} />{" "}
                            {isPending ? "Pending" : "Apply to Join"}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExploreProjects;