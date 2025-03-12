// components/UserForm.jsx
import React from "react";

export default function UserForm({
  formData,
  onChange,
  isEditing = true,
  isSubmitting = false,
}) {
  // We assume formData contains: { firstName, lastName, email, username, phone, city, country, bio, imageUrl, uploadImage, etc. }
  // and onChange is a function that updates that formData in the parent component.

  if (!formData) return null; // or show a loader

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName || ""}
          onChange={onChange}
          disabled={!isEditing || isSubmitting}
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
          value={formData.lastName || ""}
          onChange={onChange}
          disabled={!isEditing || isSubmitting}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email || ""}
          onChange={onChange}
          disabled={!isEditing || isSubmitting}
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
          value={formData.username || ""}
          onChange={onChange}
          disabled={!isEditing || isSubmitting}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          type="text"
          name="phone"
          value={formData.phone || ""}
          onChange={onChange}
          disabled={!isEditing || isSubmitting}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">City</label>
        <input
          type="text"
          name="city"
          value={formData.city || ""}
          onChange={onChange}
          disabled={!isEditing || isSubmitting}
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
          value={formData.country || ""}
          onChange={onChange}
          disabled={!isEditing || isSubmitting}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          name="bio"
          value={formData.bio || ""}
          onChange={onChange}
          disabled={!isEditing || isSubmitting}
          className="w-full p-2 border rounded"
        />
      </div>
      {/* Optional Image Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Image URL (optional)
        </label>
        <input
          type="text"
          name="imageUrl"
          value={formData.imageUrl || ""}
          onChange={onChange}
          disabled={!isEditing || isSubmitting}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Upload Image (optional)
        </label>
        <input
          type="file"
          name="uploadImage"
          onChange={onChange}
          disabled={!isEditing || isSubmitting}
          className="w-full p-2 border rounded"
        />
      </div>
      {/* ... Add any other fields you need (image preview, etc.) ... */}
    </div>
  );
}
