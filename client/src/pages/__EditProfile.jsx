import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import EditProfileModal from "../components/EditProfileModal";

export default function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get the profile passed via location state…
  const profileFromState = location.state?.profile;
  // …or use the stored profile from localStorage (make sure Profile.jsx saves it)
  const storedProfile = localStorage.getItem("profile")
    ? JSON.parse(localStorage.getItem("profile"))
    : null;

  // Initialize state using whichever source is available.
  const [profileData, setProfileData] = useState(
    profileFromState || storedProfile
  );
  const [isLoading, setIsLoading] = useState(!profileData);

  useEffect(() => {
    // If no profileData is available, fetch it from the API using the stored profile's ID.
    if (!profileData) {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token missing.");
        navigate("/login");
        return;
      }
      // Try to get the user ID from the stored profile.
      const userId = storedProfile?.id || storedProfile?._id;
      if (!userId) {
        toast.error("User ID not available.");
        navigate("/dashboard");
        return;
      }
      const fetchProfile = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/api/users/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const fullProfile = response.data.data || response.data;
          // Save the full profile to localStorage for future use.
          localStorage.setItem("profile", JSON.stringify(fullProfile));
          console.log("EditProfile: fetched fullProfile", fullProfile);
          setProfileData(fullProfile);
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast.error("Error fetching profile data.");
          navigate("/dashboard");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }
  }, [profileData, navigate, storedProfile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }
  if (!profileData || Object.keys(profileData).length === 0) {
    toast.error("No profile data available.");
    navigate("/dashboard");
    return null;
  }

  console.log("Passing profile to modal:", profileData);
  return (
    <EditProfileModal
      member={profileData}
      onClose={() => {
        console.log("EditProfile: Cancel clicked, navigating back.");
        navigate("/dashboard");
      }}
    />
  );
}
