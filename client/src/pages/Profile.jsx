import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import defaultProfile from "../assets/default-profile.png";

export default function Profile() {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userInfo || !(userInfo._id || userInfo.id)) {
      toast.error("User not authenticated. Redirecting to login...");
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token missing.");
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/api/users/${userInfo._id || userInfo.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const userData = response.data.data || response.data;
        setProfile(userData);
      } catch (err) {
        const message = err.response?.data?.message || "Error loading profile.";
        console.error("Profile.jsx error:", message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userInfo, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">No profile data available.</p>
      </div>
    );
  }

  const imageUrl = profile.image || defaultProfile;

  return (
    <div className="flex items-center justify-center min-h-screen px-5 py-10 bg-gray-100">
      <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Your Profile</h2>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 font-semibold text-white bg-gray-500 rounded-lg shadow hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                navigate("/dashboard/update", { state: { profile } });
              }}
              className="px-4 py-2 font-semibold text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left: Profile details */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-500">Name:</p>
              <p className="text-lg font-bold text-gray-700">
                {profile.firstName} {profile.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Username:</p>
              <p className="text-lg font-bold text-gray-700">
                {profile.username}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Email:</p>
              <p className="text-lg font-bold text-gray-700">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Role:</p>
              <p className="text-lg font-bold text-gray-700">{profile.role}</p>
            </div>
            {profile.role2 && (
              <div>
                <p className="text-sm font-semibold text-gray-500">Role2:</p>
                <p className="text-lg font-bold text-gray-700">
                  {profile.role2}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-500">Phone:</p>
              <p className="text-lg font-bold text-gray-700">
                {profile.phone || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">City:</p>
              <p className="text-lg font-bold text-gray-700">
                {profile.city || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Country:</p>
              <p className="text-lg font-bold text-gray-700">
                {profile.country || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Bio:</p>
              <p className="text-lg font-bold text-gray-700">
                {profile.bio || "N/A"}
              </p>
            </div>
          </div>
          {/* Right: Profile image & membership info */}
          <div className="flex flex-col items-center">
            <img
              src={imageUrl}
              alt="Profile"
              crossOrigin="anonymous"
              className="object-cover w-40 h-40 rounded-full shadow-lg"
              onError={(e) => {
                e.currentTarget.src = defaultProfile;
              }}
            />
            <p className="mt-4 text-sm text-gray-500">
              Member since{" "}
              <span className="font-semibold">
                {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
