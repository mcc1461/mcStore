// src/components/Profile.jsx

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Access userInfo from Redux store
  const { userInfo } = useSelector((state) => state.auth);

  // Fetch profile data using RTK Query
  const { data: profileData, error, isLoading } = useProfileQuery();

  // Redirect to login page if user is not authenticated
  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }
  }, [userInfo, navigate]);

  // Show loader while data is being fetched
  if (isLoading) {
    return <Loader />;
  }

  // Handle errors during data fetching
  if (error) {
    console.error("Error fetching profile info:", error);
    toast.error(error.data?.message || "Error fetching profile info");
    return <div>Error loading profile</div>;
  }

  // Destructure profile data
  const profile = profileData || {};

  return (
    <div className="flex flex-col justify-center w-[80vw] h-[85vh]">
      <div className="flex items-start justify-center h-full w-[90%] gap-10 mt-5">
        {/* Profile Details Section */}
        <div className="bg-white rounded-lg shadow-lg w-[45%] h-full flex flex-col items-center justify-center">
          <div className="h-full w-[95%] flex flex-col gap-2">
            <h2 className="text-2xl font-bold border-b-2 border-gray-300">
              Profile Details
            </h2>

            <p className="mt-1 font-bold">Name:</p>
            <p className="mb-1 font-semibold text-gray-500">
              {`${profile.firstName} ${profile.lastName}`}
            </p>

            <p className="mt-1 font-bold">Username:</p>
            <p className="mb-1 font-semibold text-gray-500">
              {profile.username}
            </p>

            <p className="mt-1 font-bold">Email:</p>
            <p className="mb-1 font-semibold text-gray-500">{profile.email}</p>

            <p className="mt-1 font-bold">Phone Number:</p>
            <p className="mb-1 font-semibold text-gray-500">
              {profile.phoneNumber || "N/A"}
            </p>

            <p className="mt-1 font-bold">Description:</p>
            <p className="mb-1 font-semibold text-gray-500">
              {profile.bio || "No description available"}
            </p>

            <div>
              <Link to="/dashboard/update">
                <button className="px-4 py-2 mt-2 font-semibold text-center text-white no-underline bg-red-500 rounded hover:bg-red-600">
                  Edit Profile
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Image Section */}
        <div className="w-[45%] h-full flex flex-col items-center gap-7">
          <p className="text-xl">Profile Image:</p>
          <img
            src={profile.profileImage || "/default-profile.png"}
            alt="Profile"
            className="object-cover w-48 h-48 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
