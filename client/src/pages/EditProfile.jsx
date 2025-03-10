import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import defaultProfile from "../assets/default-profile.png";
import Loader from "../components/Loader";

export default function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = location.state || {};
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    email: profile?.email || "",
    username: profile?.username || "",
    image: profile?.image || "",
  });
  const [imageFile, setImageFile] = useState(null);

  console.log("Profile data received in EditProfile:", profile);

  // Since the image is stored as a full S3 URL, we simply return it.
  const getImageUrl = (url) => url || defaultProfile;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      image: "",
    });
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formPayload = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "image" && !imageFile && !value.trim()) return;
      formPayload.append(key, value);
    });

    if (imageFile) {
      formPayload.append("image", imageFile);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");

      const response = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/api/users/${profile._id}`,
        formPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response.data.message || "Profile updated successfully.");
      navigate("/dashboard/profile");
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while updating the profile. Please try again."
      );
    }
  };

  const imageUrl = getImageUrl(formData.image);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg"
      >
        <h2 className="mb-6 text-2xl font-semibold text-gray-700">
          Edit Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Image URL (optional)
            </label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Image URL"
              className="w-full px-4 py-2 border rounded-lg"
              disabled={!!imageFile}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Upload Image (optional)
            </label>
            <input
              type="file"
              name="file"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div className="mt-4">
            {imageFile ? (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="object-cover w-40 h-40 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = defaultProfile;
                }}
              />
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt="Current Profile"
                className="object-cover w-40 h-40 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = defaultProfile;
                }}
              />
            ) : null}
          </div>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 mt-4 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Update Profile
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="w-full px-4 py-2 mt-2 font-bold text-white bg-gray-500 rounded-lg hover:bg-gray-600"
        >
          Reset
        </button>
      </form>
    </div>
  );
}
