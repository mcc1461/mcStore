// EditProfileModal.jsx
import React, { useState, Fragment } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import defaultProfile from "../assets/default-profile.png";
import { Dialog, Transition } from "@headlessui/react";

function EditProfileModal({ member, onClose, onUpdated, onDeleted }) {
  // Ensure the member prop includes phone, city, country
  const [formData, setFormData] = useState({
    firstName: member.firstName || "",
    lastName: member.lastName || "",
    email: member.email || "",
    username: member.username || "",
    image: member.image || "",
    phone: member.phone || "",
    city: member.city || "",
    country: member.country || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value);
    });
    if (imageFile) {
      payload.append("image", imageFile);
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");
      const response = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/api/users/${member._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || "Profile updated successfully.");
      if (onUpdated) onUpdated(response.data.data);
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while updating the profile."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");
      await axios.delete(
        `${import.meta.env.VITE_APP_API_URL}/api/users/${member._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("User deleted successfully.");
      if (onDeleted) onDeleted(member);
      onClose();
    } catch (error) {
      console.error("Error deleting user:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while deleting the user."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageUrl = formData.image || defaultProfile;

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
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
            <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
              {/* Loader overlay while submitting */}
              {isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <Loader />
                </div>
              )}

              <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                Edit Profile
              </Dialog.Title>

              <div className="flex justify-center my-4">
                <img
                  src={imageUrl}
                  alt="Current Profile"
                  className="object-cover w-32 h-32 rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = defaultProfile;
                  }}
                />
              </div>

              <form onSubmit={handleSubmit} className="mt-2 space-y-4">
                {/* First Name */}
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
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                {/* Last Name */}
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
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                {/* Email */}
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
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                {/* Username */}
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
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-600">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-600">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-600">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Country"
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                {/* Image URL (optional) */}
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
                    className="w-full px-3 py-2 border rounded"
                    disabled={!!imageFile}
                  />
                </div>

                {/* File Upload (optional) */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-600">
                    Upload Image (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end mt-4 space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-white bg-red-600 rounded"
                  >
                    Delete
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-white bg-blue-600 rounded"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
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

export default EditProfileModal;
