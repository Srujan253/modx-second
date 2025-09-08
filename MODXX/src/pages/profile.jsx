import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import axios from "axios";

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

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // If viewing another user's profile
  if (userId) {
    if (!profile) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
          <h2 className="text-2xl font-bold mb-2">Profile</h2>
          <p className="text-lg">User not found.</p>
        </div>
      );
    }
    return (
      <div className="max-w-3xl mx-auto mt-16 mb-12 p-8 bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <img
            src={`https://ui-avatars.com/api/?name=${profile.full_name?.replace(
              /\s/g,
              "+"
            )}&background=222&color=FFF&size=128`}
            alt={profile.full_name}
            className="w-32 h-32 rounded-full border-4 border-orange-500 shadow-lg object-cover"
          />
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-2">
              {profile.full_name}
            </h2>
            <p className="text-lg text-gray-400 mb-1">
              <span className="font-semibold text-orange-400">Email:</span>{" "}
              {profile.email}
            </p>
            {profile.username && (
              <p className="text-lg text-gray-400 mb-1">
                <span className="font-semibold text-orange-400">Username:</span>{" "}
                {profile.username}
              </p>
            )}
            {profile.role && (
              <p className="text-lg text-gray-400 mb-1">
                <span className="font-semibold text-orange-400">Role:</span>{" "}
                {profile.role}
              </p>
            )}
            <p className="text-lg text-gray-400 mb-1">
              <span className="font-semibold text-orange-400">Joined:</span>{" "}
              {profile.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "-"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default: own profile
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <h2 className="text-2xl font-bold mb-2">Profile</h2>
        <p className="text-lg">You are not logged in.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-16 mb-12 p-8 bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <img
          src={`https://ui-avatars.com/api/?name=${user.full_name?.replace(
            /\s/g,
            "+"
          )}&background=222&color=FFF&size=128`}
          alt={user.full_name}
          className="w-32 h-32 rounded-full border-4 border-orange-500 shadow-lg object-cover"
        />
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-white mb-2">
            {user.full_name}
          </h2>
          <p className="text-lg text-gray-400 mb-1">
            <span className="font-semibold text-orange-400">Email:</span>{" "}
            {user.email}
          </p>
          {user.username && (
            <p className="text-lg text-gray-400 mb-1">
              <span className="font-semibold text-orange-400">Username:</span>{" "}
              {user.username}
            </p>
          )}
          {user.role && (
            <p className="text-lg text-gray-400 mb-1">
              <span className="font-semibold text-orange-400">Role:</span>{" "}
              {user.role}
            </p>
          )}
          <p className="text-lg text-gray-400 mb-1">
            <span className="font-semibold text-orange-400">Joined:</span>{" "}
            {user.created_at
              ? new Date(user.created_at).toLocaleDateString()
              : "-"}
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col md:flex-row gap-4">
        <button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md shadow transition">
          Edit Profile
        </button>
        <button className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-orange-400 font-semibold rounded-md border border-orange-500 transition">
          Change Password
        </button>
      </div>
    </div>
  );
};

export default Profile;
