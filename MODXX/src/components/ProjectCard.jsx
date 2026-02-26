import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Star,
  Users,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { BASE_URL } from "../api/axiosInstance";

// Helper to get the image URL for a project
function getImageUrl(imagePath) {
  if (!imagePath) return "https://placehold.co/600x400/1f2937/d1d5db?text=Project+Image";
  if (imagePath.startsWith("http")) return imagePath;
  const cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;
  return `${BASE_URL}${cleanPath}`;
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group"
    >
      <Card className="relative overflow-hidden bg-gray-900/50 backdrop-blur-xl border-gray-800 hover:border-orange-500/50 transition-all duration-300 shadow-2xl h-full flex flex-col">
        {/* Recommended Badge */}
        {showRecommendedBadge && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-orange-500 text-white font-black uppercase tracking-widest animate-pulse border-none shadow-lg">
              <Sparkles size={10} className="mr-1" /> Recommended
            </Badge>
          </div>
        )}

        {/* Project Image */}
        <div className="relative w-full h-48 overflow-hidden">
          {project.project_image ? (
            <img
              src={getImageUrl(project.project_image)}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <Star size={40} className="text-gray-700" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent opacity-60" />
          
          {/* Status Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {isMember && (
              <Badge variant="default" className="bg-green-500 text-white font-black uppercase text-[10px] tracking-widest border-none">
                Joined
              </Badge>
            )}
            {isPending && !isMember && (
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-black uppercase text-[10px] tracking-widest">
                Pending
              </Badge>
            )}
          </div>
        </div>

        {/* Project Content */}
        <CardContent className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-black italic tracking-tighter text-white group-hover:text-orange-500 transition-colors mb-2 truncate">
            {project.title}
          </h3>
          
          <p className="text-gray-400 text-sm font-medium mb-6 line-clamp-2 leading-relaxed flex-grow">
            {project.description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-gray-500 text-[11px] font-black uppercase tracking-widest mb-6">
            <span className="flex items-center gap-1.5 bg-gray-800/50 px-2.5 py-1 rounded-md">
              <Star size={12} className="text-yellow-500" />
              {project.avg_rating || "0.0"}
            </span>
            <span className="flex items-center gap-1.5 bg-gray-800/50 px-2.5 py-1 rounded-md">
              <Users size={12} /> {project.member_count || 0} / {project.max_members}
            </span>
          </div>
          
          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2 mb-8">
            {project.tech_stack?.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="bg-gray-800/30 border-gray-700/50 text-gray-400 font-bold hover:border-orange-500/30">
                {tag}
              </Badge>
            ))}
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between gap-4 mt-auto">
            <Button
              asChild
              variant="link"
              className="p-0 text-orange-500 hover:text-orange-400 font-black uppercase tracking-widest text-[10px]"
            >
              <Link to={`/project/${project.id}`} className="flex items-center gap-2">
                Launch Details <ArrowRight size={14} />
              </Link>
            </Button>
            
            {isMember ? (
              <Badge variant="outline" className="text-green-500 border-green-500/20 font-black uppercase tracking-widest text-[10px]">
                Authorized
              </Badge>
            ) : (
              <Button
                onClick={() => onApply && onApply(project.id)}
                disabled={isPending}
                className={cn(
                  "font-black uppercase tracking-widest text-[10px] h-9 px-6",
                  isPending 
                    ? "bg-gray-800 text-gray-500" 
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                )}
              >
                <Briefcase size={12} className="mr-2" />
                {isPending ? "Syncing..." : "Apply"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;
