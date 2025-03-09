import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import defaultProfile from "../assets/default-profile.png";
import EditProfileModal from "./EditProfileModal"; // Adjust path if needed

// Utility to capitalize first letter
const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

function Team() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token)
          throw new Error("Authentication token missing. Please log in.");
        const { data } = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/api/users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Raw team members response:", data.data);
        const membersArray = Array.isArray(data.data) ? data.data : [];
        // Filter out any falsy items or those without a unique identifier.
        const validMembers = membersArray.filter(
          (member) => member && (member._id || member.username)
        );
        console.log("Valid team members:", validMembers);
        // Only include admins and staffs.
        const filteredTeam = validMembers.filter(
          (user) => user.role === "admin" || user.role === "staff"
        );
        setTeamMembers(filteredTeam);
      } catch (err) {
        console.error("Error fetching team members:", err);
        setError("Error loading team members.");
        toast.error("Error loading team members.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

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
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Filter again for safety.
  const validMembers = (teamMembers || []).filter(
    (member) => member && (member._id || member.username)
  );
  const admins = validMembers
    .filter((member) => member.role === "admin")
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
  const staffs = validMembers
    .filter((member) => member.role === "staff")
    .sort((a, b) => a.firstName.localeCompare(b.firstName));

  // Helper: Build image URL (if image starts with "/uploads/", prepend S3 base URL)
  const getImageUrl = (member) => {
    if (member.photo) return member.photo;
    if (member.image) {
      if (member.image.startsWith("/uploads/")) {
        const s3Base = import.meta.env.VITE_APP_S3_URL || "";
        return s3Base ? `${s3Base}${member.image}` : member.image;
      }
      return member.image;
    }
    return defaultProfile;
  };

  const handleMemberClick = (member) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo || userInfo.role !== "admin") {
      toast.error("Only admins can edit team member info.");
      return;
    }
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const TeamCard = ({ member, index }) => {
    // Defensive check
    if (!member || !(member._id || member.username)) return null;
    const uniqueKey = member._id || member.username || index;
    return (
      <div
        key={uniqueKey}
        onClick={() => handleMemberClick(member)}
        className="flex flex-col items-center p-5 transition-shadow bg-white rounded-lg shadow-lg cursor-pointer hover:shadow-2xl w-80 md:w-96"
      >
        <img
          src={getImageUrl(member)}
          alt={`${member.firstName} ${member.lastName}`}
          onError={(e) => {
            e.currentTarget.src = defaultProfile;
          }}
          className="object-cover w-32 h-32 mb-4 rounded-full"
        />
        <h2 className="text-xl font-semibold">
          {member.firstName} {member.lastName}
        </h2>
        <p className="text-indigo-500">{capitalize(member.username)}</p>
        <p className="text-gray-600">{member.email}</p>
        {member.phoneNumber && (
          <p className="text-gray-600">{member.phoneNumber}</p>
        )}
        {member.bio && (
          <p className="mt-2 text-sm text-center text-gray-500">{member.bio}</p>
        )}
        <p
          className={`mt-2 font-bold ${member.role === "admin" ? "text-red-500" : "text-blue-500"}`}
        >
          {member.role.toUpperCase()}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen px-5 py-10 bg-gray-100">
      {/* Dashboard Button */}
      <div className="flex justify-end w-full mb-5">
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 font-bold text-white bg-indigo-500 rounded hover:bg-indigo-600"
        >
          ➤ Dashboard
        </button>
      </div>
      <h1 className="mb-10 text-4xl font-bold text-center text-violet-700">
        Our Team
      </h1>
      <div className="flex flex-col items-center">
        {admins.length > 0 && (
          <div className="w-full mb-10">
            <h2 className="mb-5 text-2xl font-bold text-center">
              Administrators
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
              {admins.map((admin, idx) => (
                <TeamCard key={admin._id || idx} member={admin} index={idx} />
              ))}
            </div>
          </div>
        )}
        {staffs.length > 0 && (
          <div className="w-full">
            <h2 className="mb-5 text-2xl font-bold text-center">
              Staff Members
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
              {staffs.map((staff, idx) => (
                <TeamCard key={staff._id || idx} member={staff} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
      {isModalOpen && selectedMember && (
        <EditProfileModal
          member={selectedMember}
          onClose={() => setIsModalOpen(false)}
          onUpdated={(updatedMember) => {
            // Defensive check: if updatedMember is invalid, do nothing.
            if (
              !updatedMember ||
              !(updatedMember._id || updatedMember.username)
            ) {
              console.warn("Updated member is invalid:", updatedMember);
              return;
            }
            setTeamMembers((prev) =>
              prev
                .filter((m) => m) // Remove any undefined items
                .map((m, idx) => {
                  // Use _id or username as unique identifier
                  const key = m._id || m.username;
                  const updatedKey =
                    updatedMember._id || updatedMember.username;
                  return key === updatedKey ? updatedMember : m;
                })
            );
          }}
        />
      )}
    </div>
  );
}

export default Team;
