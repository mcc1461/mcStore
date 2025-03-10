import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import defaultProfile from "../assets/default-profile.png";

function Team() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Set up navigation
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token missing. Please log in.");
        }

        const { data } = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/api/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Assuming the API returns an array in data.data
        const allUsers = data.data;
        const filteredTeam = allUsers.filter(
          (user) =>
            user.role === "admin" ||
            user.role === "staff" ||
            user.role === "user"
        );
        setTeamMembers(filteredTeam);
      } catch (err) {
        console.error("Error fetching team members:", err);
        if (err.response && err.response.status === 403) {
          setError("Not authorized to access team members.");
          toast.error("Not authorized");
        } else {
          setError("Error loading team members.");
          toast.error("Error loading team members.");
        }
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

  // Separate and sort team members alphabetically by first name
  const admins = teamMembers
    .filter((member) => member.role === "admin")
    .sort((a, b) => a.firstName.localeCompare(b.firstName));

  const staffs = teamMembers
    .filter((member) => member.role === "staff")
    .sort((a, b) => a.firstName.localeCompare(b.firstName));

  const regulars = teamMembers
    .filter((member) => member.role === "usersf")
    .sort((a, b) => a.firstName.localeCompare(b.firstName));

  // Helper to determine the proper image URL
  const getImageUrl = (member) => {
    return member.photo || member.image || defaultProfile;
  };

  // Reusable team member card component
  const TeamCard = ({ member }) => {
    const formattedUsername =
      member.username.charAt(0).toUpperCase() + member.username.slice(1);
    return (
      <div
        key={member._id}
        className="flex flex-col items-center p-5 transition-shadow bg-white rounded-lg shadow-lg hover:shadow-2xl w-80 md:w-96"
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
        <p className="text-indigo-500">{formattedUsername}</p>
        <p className="text-gray-600">{member.email}</p>
        {member.phoneNumber && (
          <p className="text-gray-600">{member.phoneNumber}</p>
        )}
        {member.bio && (
          <p className="mt-2 text-sm text-center text-gray-500">{member.bio}</p>
        )}
        <p
          className={`mt-2 font-bold ${
            member.role === "admin"
              ? "text-red-500"
              : member.role === "staff"
                ? "text-blue-500"
                : "text-green-500"
          }`}
        >
          {member.role.toUpperCase()}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen px-5 py-10 bg-gray-100">
      {/* Button to return to Dashboard */}
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
              {admins.map((admin) => (
                <TeamCard key={admin._id} member={admin} />
              ))}
            </div>
          </div>
        )}
        {staffs.length > 0 && (
          <div className="w-full mb-10">
            <h2 className="mb-5 text-2xl font-bold text-center">
              Staff Members
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
              {staffs.map((staff) => (
                <TeamCard key={staff._id} member={staff} />
              ))}
            </div>
          </div>
        )}
        {regulars.length > 0 && (
          <div className="w-full">
            <h2 className="mb-5 text-2xl font-bold text-center">
              Team Members
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
              {regulars.map((user) => (
                <TeamCard key={user._id} member={user} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Team;
