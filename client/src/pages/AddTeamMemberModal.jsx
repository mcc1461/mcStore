import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AddTeamMemberModal = ({ onClose, onCreated }) => {
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    role: "user",
    roleCode: "",
    image: "",
    bio: "",
    phoneNumber: "",
  });

  const roles = ["admin", "staff", "manager", "coordinator", "user"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found.");

      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/users`,
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Team member created successfully!");
      onCreated(response.data.user);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create team member."
      );
      console.error("Creation error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-center">
          Add New Team Member
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              onChange={handleChange}
              required
              placeholder="First Name"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              onChange={handleChange}
              required
              placeholder="Last Name"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              required
              placeholder="Email"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              onChange={handleChange}
              required
              placeholder="Username"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              required
              placeholder="Password"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              name="role"
              onChange={handleChange}
              value={newUser.role}
              className="w-full px-3 py-2 border rounded"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          {["admin", "staff", "coordinator", "user"].includes(newUser.role) && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Role Code
              </label>
              <input
                type="text"
                name="roleCode"
                onChange={handleChange}
                placeholder="Role Code"
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          )}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Image URL (optional)
            </label>
            <input
              type="text"
              name="image"
              onChange={handleChange}
              placeholder="Image URL"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Bio (optional)
            </label>
            <textarea
              name="bio"
              onChange={handleChange}
              placeholder="Bio"
              className="w-full px-3 py-2 border rounded"
            ></textarea>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Phone Number (optional)
            </label>
            <input
              type="text"
              name="phoneNumber"
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-green-500 rounded hover:bg-green-600"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamMemberModal;
