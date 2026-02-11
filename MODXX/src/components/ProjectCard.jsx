import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Users,
  ArrowRight,
  Briefcase,
  Sparkles,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Helper to get the image URL for a project
function getImageUrl(imagePath) {
  if (!imagePath) return "https://placehold.co/600x400/1f2937/d1d5db?text=Project+Image";
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
}

const ProjectCard = ({
  project,
  isMember = false,
  isPending = false,
  onApply,
  showRecommendedBadge = false,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 hover:border-orange-500/30 shadow-lg hover:shadow-2xl transition-all flex flex-col"
    >
      {/* Recommended Badge */}
      {showRecommendedBadge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-4 right-4 z-10"
        >
          <span className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
            <Sparkles size={12} /> Recommended
          </span>
        </motion.div>
      )}

      {/* Project Image */}
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
        
        {/* Status Badges */}
        <div className="absolute top-4 left-4">
          {isMember && (
            <span className="badge badge-success">Joined</span>
          )}
          {isPending && !isMember && (
            <span className="badge badge-warning">Pending</span>
          )}
        </div>
      </div>

      {/* Project Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-orange-400 transition-colors duration-200 truncate">
          {project.title}
        </h3>
        
        <p className="text-gray-300 mb-4 flex-grow line-clamp-2">
          {project.description}
        </p>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-gray-400 text-sm mb-4">
          <span className="flex items-center gap-1">
            <Star size={16} className="text-yellow-400" />
            {project.avg_rating || "N/A"}
          </span>
          <span className="flex items-center gap-1">
            <Users size={16} /> {project.member_count || 0} /{" "}
            {project.max_members}
          </span>
        </div>
        
        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tech_stack?.map((tag, index) => (
            <span key={index} className="badge badge-outline">
              {tag}
            </span>
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between gap-4 mt-auto">
          <Link
            to={`/project/${project.id}`}
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-semibold transition-colors"
          >
            View Details <ArrowRight size={16} />
          </Link>
          
          {isMember ? (
            <span className="font-semibold text-green-500">
              Joined
            </span>
          ) : (
            <button
              onClick={() => onApply && onApply(project.id)}
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
};

export default ProjectCard;
