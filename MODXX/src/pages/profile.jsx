import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import TagInput from "../components/TagInput";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit3,
  Lock,
  UserCheck,
  Settings,
  Badge,
  Clock,
  MapPin,
  Camera,
  Activity,
  Upload,
  FileText,
  Phone,
} from "lucide-react";

import axiosInstance, { BASE_URL } from "../api/axiosInstance";

const Profile = () => {
  const { user, loading } = useAuth();
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [projectsCreated, setProjectsCreated] = useState(0);
  const [collaborations, setCollaborations] = useState(0);

  // Edit modal state and logic
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    role: "",
    mobile: "",
    interests: [],
    skills: [],
    bio: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  // Initialize edit form when user data is available
  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.full_name || "",
        role: user.role || "",
        mobile: user.mobile || "",
        interests: user.interests || [],
        skills: user.skills || [],
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      const updateData = {
        full_name: editForm.username,
        role: editForm.role,
        mobile: editForm.mobile,
        interests: editForm.interests,
        skills: editForm.skills,
        bio: editForm.bio,
      };

      // Add profile image if selected
      if (profileImage) {
        updateData.profileImage = profileImage;
      }

      await axiosInstance.patch(
        "users/me",
        updateData
      );
      window.location.reload();
    } catch (err) {
      setEditError("Failed to update profile.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        setImagePreview(base64Image);
        
        // Upload immediately with all existing user data
        try {
          console.log("Uploading image to Cloudinary...");
          const response = await axiosInstance.patch(
            "users/me",
            { 
              profileImage: base64Image,
              full_name: user.full_name,
              role: user.role,
              interests: user.interests || [],
              skills: user.skills || [],
              bio: user.bio || ""
            }
          );
          console.log("Upload successful:", response.data);
          
          // Reload to show new image
          window.location.reload();
        } catch (err) {
          console.error("Upload error:", err);
          toast.error("Failed to upload image. Please try again.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a PDF or DOC file");
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Resume size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        // reader.result is a data URL like: "data:application/pdf;base64,JVBERi0xLj..."
        // We need to send just the base64 part to Cloudinary
        const base64Resume = reader.result;
        
        try {
          console.log("Uploading resume to Cloudinary...");
          console.log("File type:", file.type);
          console.log("File size:", file.size, "bytes");
          
          const response = await axiosInstance.patch(
            "users/me",
            { 
              resume: base64Resume, // Send the full data URL - Cloudinary will handle it
              full_name: user.full_name,
              role: user.role,
              interests: user.interests || [],
              skills: user.skills || [],
              bio: user.bio || ""
            }
          );
          console.log("Resume upload successful:", response.data);
          
          // Reload to show new resume
          window.location.reload();
        } catch (err) {
          console.error("Resume upload error:", err);
          toast.error("Failed to upload resume. Please try again.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!userId) return;

    setProfileLoading(true);

    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("users/me");
        console.log(res);
        setProfile(res.data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Fetch projects created count
  useEffect(() => {
    if (!user) return;
    axiosInstance
      .get("project/user-projects")
      .then((res) => {
        setProjectsCreated(
          Array.isArray(res.data.projects) ? res.data.projects.length : 0
        );
      })
      .catch(() => setProjectsCreated(0));
  }, [user]);

  // Fetch collaborations count (accepted only)
  useEffect(() => {
    if (!user) return;
    axiosInstance
      .get("project/memberships")
      .then((res) => {
        console.log(res);
        const accepted = Array.isArray(res.data.accepted)
          ? res.data.accepted
          : [];
        setCollaborations(accepted.length);
      })
      .catch(() => setCollaborations(0));
  }, [user]);

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700"></div>
        <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
        <div className="absolute inset-2 animate-pulse rounded-full bg-orange-500/20"></div>
      </div>
    </div>
  );

  if (loading || profileLoading) {
    return <LoadingSpinner />;
  }

  const ProfileInfo = ({ icon: Icon, label, value, highlight = false }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-orange-500/30 transition-all duration-200 group"
    >
      <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
        <Icon size={20} className="text-orange-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-400 mb-1">{label}</p>
        <p
          className={`font-semibold ${
            highlight ? "text-orange-400" : "text-white"
          } text-lg`}
        >
          {value || "Not specified"}
        </p>
      </div>
    </motion.div>
  );

  const ActionButton = ({
    icon: Icon,
    label,
    variant = "primary",
    onClick,
    className = "",
  }) => (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl
        ${
          variant === "primary"
            ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            : "bg-gray-800/80 hover:bg-gray-700/80 text-orange-400 border border-orange-500/30 hover:border-orange-400 backdrop-blur-sm"
        } ${className}
      `}
    >
      <Icon size={18} />
      {label}
    </motion.button>
  );

  // If viewing another user's profile
  if (userId) {
    if (!profile) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center border border-gray-700">
              <User size={40} className="text-gray-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Profile Not Found
            </h2>
            <p className="text-gray-400 text-lg">
              The user you're looking for doesn't exist.
            </p>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header Card */}
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
            {/* Cover Background */}
            <div className="h-32 bg-gradient-to-r from-orange-500/20 to-orange-600/20 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent"></div>
            </div>

            {/* Profile Content */}
            <div className="px-8 pb-8 -mt-16 relative">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${profile.full_name?.replace(
                      /\s/g,
                      "+"
                    )}&background=222&color=FFF&size=128`}
                    alt={profile.full_name}
                    className="w-32 h-32 rounded-2xl border-4 border-gray-700 shadow-2xl object-cover bg-gray-800"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-800 flex items-center justify-center">
                    <Activity size={12} className="text-white" />
                  </div>
                </motion.div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold text-white mb-2"
                  >
                    {profile.full_name}
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-400"
                  >
                    <span className="flex items-center gap-2">
                      <UserCheck size={16} />
                      Member
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar size={16} />
                      Joined{" "}
                      {profile.created_at
                        ? new Date(profile.created_at).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <ProfileInfo
                  icon={Mail}
                  label="Email Address"
                  value={profile.email}
                />
                {profile.username && (
                  <ProfileInfo
                    icon={User}
                    label="Username"
                    value={profile.username}
                  />
                )}
                {profile.role && (
                  <ProfileInfo
                    icon={Shield}
                    label="Role"
                    value={profile.role}
                    highlight
                  />
                )}
                {/* Extra Details Section */}
                <div className="col-span-2 mt-6">
                  <h3 className="text-xl font-bold text-orange-400 mb-2">
                    Extra Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileInfo
                      icon={MapPin}
                      label="Interest"
                      value={profile.interest}
                    />
                    <ProfileInfo
                      icon={MapPin}
                      label="Other Interest"
                      value={profile.other_interest}
                    />
                    <ProfileInfo
                      icon={UserCheck}
                      label="Verified Status"
                      value={profile.is_verified ? "Verified" : "Not Verified"}
                      highlight={profile.is_verified}
                    />
                    {profile.bio && (
                      <div className="col-span-2">
                         <ProfileInfo
                          icon={FileText}
                          label="Bio"
                          value={profile.bio}
                        />
                      </div>
                    )}
                    {profile.skills && profile.skills.length > 0 && (
                      <div className="col-span-2">
                         <div className="p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
                          <p className="text-sm font-medium text-gray-400 mb-2">Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill, idx) => (
                              <span key={idx} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm border border-blue-500/30">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <ProfileInfo
                      icon={Calendar}
                      label="Created At"
                      value={
                        profile.created_at
                          ? new Date(profile.created_at).toLocaleString()
                          : "Unknown"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Default: own profile
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center border border-gray-700">
            <Lock size={40} className="text-gray-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 text-lg">
            You need to be logged in to view this profile.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header Card */}
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
          {/* Cover Background */}
          <div className="h-32 bg-gradient-to-r from-orange-500/20 to-orange-600/20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent"></div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 p-2 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700/50 text-gray-400 hover:text-orange-400 transition-colors"
            >
              <Camera size={16} />
            </motion.button>
          </div>

          {/* Profile Content */}
          <div className="px-8 pb-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative group"
              >
                <img
                  src={
                    user.profile_image_url ||
                    `https://ui-avatars.com/api/?name=${user.full_name?.replace(
                      /\s/g,
                      "+"
                    )}&background=222&color=FFF&size=128`
                  }
                  alt={user.full_name}
                  className="w-32 h-32 rounded-2xl border-4 border-gray-700 shadow-2xl object-cover bg-gray-800 group-hover:border-orange-500/50 transition-colors duration-300"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-xl border-4 border-gray-800 flex items-center justify-center text-white shadow-lg transition-colors"
                >
                  <Camera size={14} />
                </motion.button>
              </motion.div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold text-white mb-2"
                >
                  {user.full_name}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-400"
                >
                  <span className="flex items-center gap-2">
                    <Badge size={16} />
                    Your Profile
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar size={16} />
                    Joined{" "}
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "Unknown"}
                  </span>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center gap-2 p-3 bg-orange-500/80 hover:bg-orange-600 rounded-xl border border-orange-500/30 text-white shadow-lg transition-all"
                  onClick={() => setEditModalOpen(true)}
                >
                  <Edit3 size={18} />
                  Edit
                </motion.button>
              </motion.div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <ProfileInfo
                icon={Mail}
                label="Email Address"
                value={user.email}
              />
              <ProfileInfo
                icon={User}
                label="Username"
                value={user.username || user.full_name}
              />
              <ProfileInfo
                icon={Shield}
                label="Role"
                value={user.role}
                highlight
              />
              <ProfileInfo
                icon={Phone}
                label="Mobile Number"
                value={user.mobile || "Not specified"}
              />
              
              {/* Bio Display */}
              <div className="col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50"
                >
                  <p className="text-sm font-medium text-gray-400 mb-2">Bio / About</p>
                  {user.bio ? (
                    <p className="text-gray-300 leading-relaxed">{user.bio}</p>
                  ) : (
                    <p className="text-gray-500 text-sm italic">Add a bio to help the AI find better projects for you.</p>
                  )}
                </motion.div>
              </div>

              {/* Skills Display */}
              <div className="col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50"
                >
                  <p className="text-sm font-medium text-gray-400 mb-3">Skills</p>
                  {user.skills && user.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium border border-blue-500/30 shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">Add your professional skills.</p>
                  )}
                </motion.div>
              </div>
              
              {/* Interests Display */}
              <div className="col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50"
                >
                  <p className="text-sm font-medium text-gray-400 mb-3">Interests</p>
                  {user.interests && user.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium shadow-md"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      No interests added yet. Click "Edit" to add up to 3 interests.
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Resume Display */}
              <div className="col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-400">Resume</p>
                    <input
                      type="file"
                      ref={resumeInputRef}
                      onChange={handleResumeChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        console.log("Resume URL:", user.resume_url);
                        resumeInputRef.current?.click();
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/80 hover:bg-orange-600 rounded-lg text-white text-sm font-medium transition-colors"
                    >
                      <Upload size={14} />
                      {user.resume_url ? "Replace" : "Upload"}
                    </motion.button>
                  </div>
                  {user.resume_url ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <a
                          href={user.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            console.log("Opening resume URL:", user.resume_url);
                          }}
                          className="flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm transition-colors"
                        >
                          <FileText size={16} />
                          View Resume
                        </a>
                        <span className="text-gray-600">|</span>
                        <a
                          href={user.resume_url}
                          download="resume.pdf"
                          className="flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </a>
                      </div>
                      <p className="text-xs text-gray-500 break-all">
                        {user.resume_url}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      No resume uploaded yet.
                    </p>
                  )}
                </motion.div>
              </div>
              
              <ProfileInfo
                icon={UserCheck}
                label="Verified Status"
                value={user.is_verified ? "Verified" : "Not Verified"}
                highlight={user.is_verified}
              />
              <ProfileInfo
                icon={Calendar}
                label="Member Since"
                value={
                  user.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Unknown"
                }
              />
            </div>


          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-2 gap-6 mt-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-200 group cursor-pointer"
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <User size={24} className="text-orange-400" />
              </div>
              <span className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                {projectsCreated}
              </span>
            </div>
            <h3 className="text-gray-300 font-medium">Projects Created</h3>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-200 group cursor-pointer"
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <UserCheck size={24} className="text-green-400" />
              </div>
              <span className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                {collaborations}
              </span>
            </div>
            <h3 className="text-gray-300 font-medium">Collaborations</h3>
          </motion.div>
        </motion.div>

        {/* Edit Modal */}
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 rounded-2xl p-8 shadow-2xl w-full max-w-md border border-orange-500/30"
            >
              <h2 className="text-2xl font-bold text-orange-400 mb-6">
                Edit Profile
              </h2>
              <form onSubmit={handleEditSubmit} className="space-y-5">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-24 h-24 rounded-xl object-cover border-2 border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setProfileImage(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-gray-400 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={editForm.username}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Role</label>
                  <input
                    type="text"
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    name="mobile"
                    value={editForm.mobile}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 outline-none"
                    placeholder="10-digit mobile number"
                    pattern="\d{10}"
                    title="Mobile number must be exactly 10 digits"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Interests (Max 3)</label>
                  <TagInput
                    tags={editForm.interests}
                    setTags={(interests) => setEditForm({ ...editForm, interests })}
                    maxTags={3}
                    placeholder="Add your interests..."
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Professional Skills</label>
                  <TagInput
                    tags={editForm.skills}
                    setTags={(skills) => setEditForm({ ...editForm, skills })}
                    placeholder="e.g. React, Python, UI Design..."
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Bio / About</label>
                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 outline-none h-24 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                {editError && (
                  <p className="text-red-500 text-sm">{editError}</p>
                )}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    className="flex-1 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
                    onClick={() => setEditModalOpen(false)}
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 font-semibold"
                    disabled={editLoading}
                  >
                    {editLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;
