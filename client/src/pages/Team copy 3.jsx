import React, { useEffect, useState, Fragment, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import defaultProfile from "../assets/default-profile.png";
import { Dialog, Transition } from "@headlessui/react";
import { useSelector } from "react-redux";
import { capitalize } from "../utils/helpers";

// NewMemberModal Component
function NewMemberModal({ isOpen, onClose, onMemberAdded }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    role: "",
    role2: "",
    imageUrl: "",
    uploadImage: null,
    phone: "",
    city: "",
    country: "",
    bio: "",
    roleCode: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cancelButtonRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append("firstName", formData.firstName);
    payload.append("lastName", formData.lastName);
    payload.append("email", formData.email);
    payload.append("username", formData.username);
    payload.append("role", formData.role);
    payload.append("role2", formData.role2);
    payload.append("phone", formData.phone);
    payload.append("city", formData.city);
    payload.append("country", formData.country);
    payload.append("bio", formData.bio);
    payload.append("roleCode", formData.roleCode);
    if (formData.uploadImage) {
      payload.append("image", formData.uploadImage);
    } else {
      payload.append("image", formData.imageUrl);
    }
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/users`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || "Member added successfully.");
      if (onMemberAdded) onMemberAdded(response.data.user);
      onClose();
    } catch (error) {
      console.error("Error adding member:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while adding the member."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <div className="flex items-center justify-center min-h-screen p-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300 transform"
            enterFrom="scale-95 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="ease-in duration-200 transform"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-95 opacity-0"
          >
            <div className="relative inline-block w-full max-w-md p-6 overflow-auto text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
              <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                Add New Member
              </Dialog.Title>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {/* Input Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role2 (optional)
                  </label>
                  <input
                    type="text"
                    name="role2"
                    value={formData.role2}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role Code
                  </label>
                  <input
                    type="text"
                    name="roleCode"
                    value={formData.roleCode}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image URL (optional)
                  </label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    disabled={!!formData.uploadImage}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Image (optional)
                  </label>
                  <input
                    type="file"
                    name="uploadImage"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex justify-end mt-4 space-x-4">
                  <button
                    type="button"
                    ref={cancelButtonRef}
                    onClick={onClose}
                    className="px-4 py-2 border rounded"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-white bg-blue-600 rounded"
                  >
                    {isSubmitting ? "Saving..." : "Add Member"}
                  </button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

// Helper function to get an image URL with a timestamp
const getImageUrl = (member) => {
  const url = member.image || member.photo || defaultProfile;
  return url.includes("?")
    ? url + `&t=${Date.now()}`
    : url + `?t=${Date.now()}`;
};

function Team() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.userInfo);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token missing. Please log in.");
        }
        const { data } = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/api/users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const allUsers = data.data;
        // Filter team members by role.
        const filteredTeam = allUsers.filter(
          (user) =>
            user.role === "admin" ||
            user.role === "staff" ||
            user.role === "coordinator" ||
            user.role === "usersf"
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

  const TeamCard = ({ member }) => {
    const formattedUsername =
      member.username.charAt(0).toUpperCase() + member.username.slice(1);
    return (
      <div className="flex flex-col items-center p-5 transition-shadow bg-white rounded-lg shadow-lg hover:shadow-2xl w-80 md:w-96">
        <img
          src={getImageUrl(member)}
          alt={`${member.firstName} ${member.lastName}`}
          onError={(e) => (e.currentTarget.src = defaultProfile)}
          className="object-cover w-32 h-32 mb-4 rounded-full"
        />
        <h2 className="text-xl font-semibold">
          {member.firstName} {member.lastName}
        </h2>
        <p className="text-indigo-500">{formattedUsername}</p>
        <p className="text-gray-600">{member.email}</p>
        {member.phone && <p className="text-gray-600">{member.phone}</p>}
        <p
          className={`mt-2 font-bold ${
            member.role === "admin"
              ? "text-red-500"
              : member.role === "staff"
                ? "text-blue-500"
                : member.role === "coordinator"
                  ? "text-orange-500"
                  : "text-green-500"
          }`}
        >
          {member.role.toUpperCase()}
        </p>
        <button
          onClick={() => setSelectedMember(member)}
          className="px-4 py-2 mt-4 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600"
        >
          View Details
        </button>
      </div>
    );
  };

  // MemberModal for editing/deleting a team member.
  const MemberModal = ({ member, onClose, onUpdated, onDeleted }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedMember, setEditedMember] = useState({
      ...member,
      role2: member.role2 || "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
      const { name, value, type, files } = e.target;
      if (type === "file") {
        setEditedMember((prev) => ({ ...prev, [name]: files[0] }));
      } else {
        setEditedMember((prev) => ({ ...prev, [name]: value }));
      }
    };

    const saveEdits = async () => {
      try {
        setIsSubmitting(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token missing.");

        let updateData = { ...editedMember };
        if (currentUser.role !== "admin") {
          delete updateData.username;
          delete updateData.email;
        }
        const { _id, ...dataWithoutId } = updateData;
        const payload = new FormData();
        payload.append("firstName", dataWithoutId.firstName);
        payload.append("lastName", dataWithoutId.lastName);
        payload.append("phone", dataWithoutId.phone);
        payload.append("city", dataWithoutId.city);
        payload.append("country", dataWithoutId.country);
        payload.append("bio", dataWithoutId.bio || "");
        payload.append("role", dataWithoutId.role || "");
        payload.append("role2", dataWithoutId.role2 || "");
        if (dataWithoutId.uploadImage) {
          payload.append("image", dataWithoutId.uploadImage);
        } else {
          payload.append("image", dataWithoutId.image || "");
        }

        const response = await axios.put(
          `${import.meta.env.VITE_APP_API_URL}/api/users/${member._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(response.data.message || "Changes saved!");
        setIsEditing(false);
        if (onUpdated) onUpdated(response.data.data);
        onClose();
      } catch (err) {
        console.error("Error updating user:", err.response?.data || err);
        if (err.response && err.response.code === 11000) {
          toast.error(
            "Username or email is already in use. Please choose a different one."
          );
        } else if (err.response && err.response.status === 403) {
          toast.error("Not authorized to make changes.");
        } else {
          toast.error(err.response?.data?.message || "Error updating user");
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    const deleteMember = async () => {
      try {
        setIsSubmitting(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token missing.");
        await axios.delete(
          `${import.meta.env.VITE_APP_API_URL}/api/users/${member._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("User deleted successfully.");
        if (onDeleted) onDeleted(member);
        onClose();
      } catch (err) {
        console.error("Error deleting user:", err.response?.data || err);
        if (err.response && err.response.status === 403) {
          toast.error("Not authorized to delete this user.");
        } else {
          toast.error(err.response?.data?.message || "Error deleting user");
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    const confirmDeletion = () => {
      toast.info(
        <div>
          <p className="mb-2">Are you sure you want to delete this user?</p>
          <div className="flex justify-end">
            <button
              onClick={() => {
                toast.dismiss();
                deleteMember();
              }}
              className="px-3 py-1 mr-2 text-sm text-white bg-red-600 rounded"
            >
              Yes
            </button>
            <button
              onClick={() => toast.dismiss()}
              className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded"
            >
              No
            </button>
          </div>
        </div>,
        { autoClose: false }
      );
    };

    return (
      <Transition appear show={!!member} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => {
            setIsEditing(false);
            onClose();
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300 transform"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200 transform"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <Dialog.Title className="text-2xl font-bold leading-6 text-gray-900">
                    {editedMember.firstName} {editedMember.lastName}
                  </Dialog.Title>
                  <div className="mt-4">
                    <img
                      src={getImageUrl(editedMember)}
                      alt={`${editedMember.firstName} ${editedMember.lastName}`}
                      className="object-cover w-32 h-32 mx-auto mb-4 rounded-full"
                    />
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Username
                          </label>
                          <input
                            type="text"
                            name="username"
                            value={editedMember.username || ""}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={editedMember.email || ""}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        {currentUser && currentUser.role === "admin" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Role
                            </label>
                            <input
                              type="text"
                              name="role"
                              value={editedMember.role || ""}
                              onChange={handleInputChange}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Role2
                          </label>
                          <input
                            type="text"
                            name="role2"
                            value={editedMember.role2 || ""}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Phone
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={editedMember.phone || ""}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            City
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={editedMember.city || ""}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Country
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={editedMember.country || ""}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Bio
                          </label>
                          <textarea
                            name="bio"
                            value={editedMember.bio || ""}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <p className="text-gray-600">
                          <strong>Username:</strong> {editedMember.username}
                        </p>
                        <p className="text-gray-600">
                          <strong>Email:</strong> {editedMember.email}
                        </p>
                        <p className="text-gray-600">
                          <strong>Phone:</strong> {editedMember.phone || "N/A"}
                        </p>
                        <p className="text-gray-600">
                          <strong>City:</strong> {editedMember.city || "N/A"}
                        </p>
                        <p className="text-gray-600">
                          <strong>Country:</strong>{" "}
                          {editedMember.country || "N/A"}
                        </p>
                        {editedMember.bio && (
                          <p className="mt-2 text-sm text-center text-gray-500">
                            {editedMember.bio}
                          </p>
                        )}
                        <p className="text-gray-600">
                          <strong>Role:</strong> {editedMember.role}
                        </p>
                        <p className="text-gray-600">
                          <strong>Role2:</strong> {editedMember.role2 || "N/A"}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end mt-6 space-x-3">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                          onClick={saveEdits}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                          onClick={() => {
                            setIsEditing(false);
                            setEditedMember({ ...member });
                          }}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {currentUser &&
                          (currentUser.role === "staff" ||
                            currentUser.role === "admin") && (
                            <button
                              type="button"
                              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                              onClick={() => setIsEditing(true)}
                            >
                              Edit
                            </button>
                          )}
                        {currentUser && currentUser.role === "admin" && (
                          <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                            onClick={confirmDeletion}
                          >
                            Delete
                          </button>
                        )}
                        <button
                          type="button"
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                          onClick={onClose}
                        >
                          Close
                        </button>
                      </>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  };

  const handleMemberUpdated = (updatedMember) => {
    const { photo, ...rest } = updatedMember;
    setTeamMembers((prevMembers) =>
      prevMembers.map((member) =>
        member._id === updatedMember._id ? { ...member, ...rest } : member
      )
    );
    setSelectedMember(null);
  };

  const handleMemberDeleted = (deletedMember) => {
    setTeamMembers((prevMembers) =>
      prevMembers.filter((member) => member._id !== deletedMember._id)
    );
    setSelectedMember(null);
  };

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

  const admins = teamMembers
    .filter((member) => member.role === "admin")
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
  const staffs = teamMembers
    .filter((member) => member.role === "staff")
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
  const regionals = teamMembers
    .filter((member) => member.role === "coordinator")
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
  const regulars = teamMembers
    .filter((member) => member.role === "usersf")
    .sort((a, b) => a.firstName.localeCompare(b.firstName));

  return (
    <div className="min-h-screen px-5 py-10 bg-gray-100">
      <div className="flex justify-between w-full mb-5">
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 font-bold text-white bg-indigo-500 rounded hover:bg-indigo-600"
        >
          ➤ Dashboard
        </button>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-600"
        >
          + Add New Member
        </button>
      </div>

      <h1 className="mb-10 text-4xl font-bold text-center text-violet-700">
        Our Team
      </h1>
      <div className="flex flex-col items-center space-y-10">
        {admins.length > 0 && (
          <div className="w-full">
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
          <div className="w-full">
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
        {regionals.length > 0 && (
          <div className="w-full">
            <h2 className="mb-5 text-2xl font-bold text-center">
              coordinators
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
              {regionals.map((regional) => (
                <TeamCard key={regional._id} member={regional} />
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
      {selectedMember && (
        <MemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdated={handleMemberUpdated}
          onDeleted={handleMemberDeleted}
        />
      )}
      {isAddModalOpen && (
        <NewMemberModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onMemberAdded={(newMember) =>
            setTeamMembers((prev) => [...prev, newMember])
          }
        />
      )}
    </div>
  );
}

export default Team;
