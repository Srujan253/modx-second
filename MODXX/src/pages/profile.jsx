import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
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
  Activity
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const Profile = () => {
  const { user, loading } = useAuth();
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setProfileLoading(true);
    axios
      .get(`${API_URL}/users/${userId}`, { withCredentials: true })
      .then((res) => setProfile(res.data.user))
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, [userId]);

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
        <p className={`font-semibold ${highlight ? 'text-orange-400' : 'text-white'} text-lg`}>
          {value || 'Not specified'}
        </p>
      </div>
    </motion.div>
  );

  const ActionButton = ({ icon: Icon, label, variant = 'primary', onClick, className = '' }) => (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl
        ${variant === 'primary' 
          ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white' 
          : 'bg-gray-800/80 hover:bg-gray-700/80 text-orange-400 border border-orange-500/30 hover:border-orange-400 backdrop-blur-sm'
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
            <h2 className="text-3xl font-bold text-white mb-2">Profile Not Found</h2>
            <p className="text-gray-400 text-lg">The user you're looking for doesn't exist.</p>
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
                      Joined {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "Unknown"}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <ProfileInfo icon={Mail} label="Email Address" value={profile.email} />
                {profile.username && (
                  <ProfileInfo icon={User} label="Username" value={profile.username} />
                )}
                {profile.role && (
                  <ProfileInfo icon={Shield} label="Role" value={profile.role} highlight />
                )}
                <ProfileInfo 
                  icon={Calendar} 
                  label="Member Since" 
                  value={profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : "Unknown"} 
                />
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
          <p className="text-gray-400 text-lg">You need to be logged in to view this profile.</p>
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
                  src={`https://ui-avatars.com/api/?name=${user.full_name?.replace(
                    /\s/g,
                    "+"
                  )}&background=222&color=FFF&size=128`}
                  alt={user.full_name}
                  className="w-32 h-32 rounded-2xl border-4 border-gray-700 shadow-2xl object-cover bg-gray-800 group-hover:border-orange-500/50 transition-colors duration-300"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
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
                    Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
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
                  className="p-3 bg-gray-700/50 hover:bg-orange-500/20 rounded-xl border border-gray-600/50 hover:border-orange-500/30 text-gray-400 hover:text-orange-400 transition-all"
                >
                  <Settings size={18} />
                </motion.button>
              </motion.div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <ProfileInfo icon={Mail} label="Email Address" value={user.email} />
              {user.username && (
                <ProfileInfo icon={User} label="Username" value={user.username} />
              )}
              {user.role && (
                <ProfileInfo icon={Shield} label="Role" value={user.role} highlight />
              )}
              <ProfileInfo 
                icon={Calendar} 
                label="Member Since" 
                value={user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : "Unknown"} 
              />
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <ActionButton
                icon={Edit3}
                label="Edit Profile"
                variant="primary"
                className="flex-1 sm:flex-none"
                onClick={() => {/* Add edit profile logic */}}
              />
              <ActionButton
                icon={Lock}
                label="Change Password"
                variant="secondary"
                className="flex-1 sm:flex-none"
                onClick={() => {/* Add change password logic */}}
              />
              <ActionButton
                icon={Settings}
                label="Account Settings"
                variant="secondary"
                className="flex-1 sm:flex-none"
                onClick={() => {/* Add settings logic */}}
              />
            </motion.div>
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-3 gap-6 mt-8"
        >
          {[
            { icon: User, label: "Projects Created", value: "0", color: "orange" },
            { icon: UserCheck, label: "Collaborations", value: "0", color: "green" },
            { icon: Activity, label: "Total Contributions", value: "0", color: "blue" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-200 group cursor-pointer"
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  stat.color === 'orange' ? 'bg-orange-500/10 border border-orange-500/20' :
                  stat.color === 'green' ? 'bg-green-500/10 border border-green-500/20' :
                  'bg-blue-500/10 border border-blue-500/20'
                }`}>
                  <stat.icon size={24} className={
                    stat.color === 'orange' ? 'text-orange-400' :
                    stat.color === 'green' ? 'text-green-400' :
                    'text-blue-400'
                  } />
                </div>
                <span className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                  {stat.value}
                </span>
              </div>
              <h3 className="text-gray-300 font-medium">{stat.label}</h3>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;