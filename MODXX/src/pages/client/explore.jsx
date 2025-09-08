// Helper to get the image URL for a project
function getImageUrl(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  // Always use /uploads/ path with API URL
  return `${API_URL}/uploads/${imagePath.replace(/^.*[\\\/]/, "")}`;
}
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { Search, Star, Users, ArrowRight, Briefcase } from "lucide-react";
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
  const { user } = useAuth();
  const navigate = useNavigate();

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
  // Handle apply to join
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

  return (
    <div>
      {/* ...search/filter UI... */}
      <div>
        <select
          onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
          className="bg-gray-700 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">All Skills</option>
          <option value="React">React</option>
          <option value="Python">Python</option>
          <option value="UI/UX Design">UI/UX Design</option>
          <option value="PostgreSQL">PostgreSQL</option>
          <option value="Node.js">Node.js</option>
          <option value="Express">Express</option>
          <option value="JavaScript">JavaScript</option>
          <option value="TypeScript">TypeScript</option>
          <option value="Java">Java</option>
          <option value="C++">C++</option>
          <option value="C#">C#</option>
          <option value="Go">Go</option>
          <option value="Rust">Rust</option>
          <option value="Django">Django</option>
          <option value="Flask">Flask</option>
          <option value="MongoDB">MongoDB</option>
          <option value="MySQL">MySQL</option>
          <option value="AWS">AWS</option>
          <option value="Azure">Azure</option>
          <option value="Figma">Figma</option>
          <option value="Other">Other</option>
        </select>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <svg
            className="animate-spin h-10 w-10 text-orange-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-lg text-center">
          <h3 className="text-2xl text-gray-400">
            No projects found matching your criteria.
          </h3>
          <p className="mt-4 text-gray-500">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const isMember = userMemberships.accepted.includes(project.id);
            const isPending =
              userMemberships.pending.includes(project.id) ||
              appliedProjects.includes(project.id);
            const canApply = !isMember && !isPending;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col border border-gray-700"
              >
                <div className="w-full h-48 bg-gray-800 flex items-center justify-center overflow-hidden">
                  {project.project_image ? (
                    <img
                      src={getImageUrl(project.project_image)}
                      alt={project.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-gray-500">No Image</div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold mb-2 text-orange-400 truncate">
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
                      <span
                        key={index}
                        className="bg-gray-700 text-gray-300 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
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
        </div>
      )}
    </div>
  );
};

export default ExploreProjects;
