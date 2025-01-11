import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

export default function Profile() {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth); // Get user info from Redux
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userInfo) {
      toast.error("User not authenticated. Redirecting to login...");
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token missing. Please login again.");
        }

        const { data } = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/api/users/${userInfo._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProfile(data.data);
      } catch (err) {
        const message = err.response?.data?.message || "Error loading profile.";
        console.error("Error fetching profile:", message);
        setError(message);
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = profile.image?.startsWith("/uploads/")
    ? `${import.meta.env.VITE_APP_API_URL}${profile.image}`
    : profile.image || "/default-profile.png";

  return (
    <div className="flex items-center justify-center min-h-screen px-5 py-10 bg-gray-100">
      <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Your Profile</h2>
          <button
            onClick={() => {
              navigate("/dashboard/update", { state: { profile } });
              console.log(
                "Profile data being sent to edit profile page",
                profile
              );
            }}
            className="px-4 py-2 font-semibold text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600"
          >
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left Side */}
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
              <p
                className={`text-lg font-bold ${
                  profile.role === "admin"
                    ? "text-red-500"
                    : profile.role === "staff"
                      ? "text-blue-500"
                      : "text-green-500"
                }`}
              >
                {profile.role}
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col items-center">
            <img
              src={imageUrl}
              alt="Profile"
              className="object-cover w-40 h-40 rounded-full shadow-lg"
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
