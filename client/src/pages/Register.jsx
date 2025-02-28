import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import log from "../assets/logo2.png";
import defaultProfile from "../assets/default-profile.png";
import Loader from "../components/Loader";

function Register() {
  // Form fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    roleCode: "",
  });

  // New state to allow the user to select image source:
  // "upload" for a file, "url" for an image URL.
  const [imageSource, setImageSource] = useState("upload");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  // Other states
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("userInfo")) || null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRoleCode, setShowRoleCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (userInfo) {
      navigate("/dashboard/board");
    }
  }, [userInfo, navigate]);

  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection for image upload
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImageFile(e.target.files[0]);
    }
  };

  // Reset all form fields and image states
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
      roleCode: "",
    });
    setSelectedImageFile(null);
    setImageUrl("");
    setImageSource("upload");
  };

  // Submit registration form
  const submitHandler = async (e) => {
    e.preventDefault();
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      confirmPassword,
      role,
      roleCode,
    } = formData;

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    // Validate role code for admin/staff
    if ((role === "admin" || role === "staff") && !roleCode.trim()) {
      toast.error(`Please provide the ${role} code.`);
      return;
    }

    try {
      setIsLoading(true);

      // Prepare a FormData payload
      const form = new FormData();
      form.append("firstName", firstName.trim());
      form.append("lastName", lastName.trim());
      form.append("username", username.trim());
      form.append("email", email.trim());
      // Trim the password to avoid accidental whitespace issues
      form.append("password", password.trim());
      form.append("role", role);
      if (roleCode) form.append("roleCode", roleCode.trim());

      // Append the image based on the user’s selection:
      if (imageSource === "upload" && selectedImageFile) {
        form.append("image", selectedImageFile);
      } else if (imageSource === "url" && imageUrl.trim() !== "") {
        form.append("image", imageUrl.trim());
      }

      // Send registration request with multipart/form-data
      const { data } = await axios.post("/api/auth/register", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Save tokens and user data in localStorage
      localStorage.setItem("token", data.bearer.accessToken);
      localStorage.setItem("refreshToken", data.bearer.refreshToken);
      localStorage.setItem("userInfo", JSON.stringify(data.user));

      setUserInfo(data.user);
      toast.success(data.message || "Registration successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          "An unexpected error occurred during registration."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <img src={log} alt="Log" className="w-1/3 h-auto" />

      <div className="h-[50%] w-2/3 flex flex-col items-center justify-between">
        {/* Header */}
        <div className="w-3/5 mt-10">
          <div className="flex items-center justify-between w-full">
            <p className="text-3xl font-bold">Register</p>
          </div>
        </div>

        {/* Registration Form */}
        <form
          className="relative flex flex-col items-center w-full gap-2"
          onSubmit={submitHandler}
        >
          {/* Text Fields */}
          {["firstName", "lastName", "username", "email"].map((field) => (
            <input
              key={field}
              type="text"
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="w-3/5 text-center border-2 h-9 border-slate-400 rounded-xl"
              value={formData[field]}
              onChange={handleChange}
            />
          ))}

          {/* Password and Confirm Password */}
          {["password", "confirmPassword"].map((field) => (
            <div className="relative w-3/5 h-9" key={field}>
              <input
                type={
                  field === "password"
                    ? showPassword
                      ? "text"
                      : "password"
                    : showConfirmPassword
                      ? "text"
                      : "password"
                }
                name={field}
                placeholder={
                  field === "password" ? "Password" : "Confirm Password"
                }
                className="w-full h-full text-center border-2 border-slate-400 rounded-xl"
                value={formData[field]}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => {
                  if (field === "password") {
                    setShowPassword(!showPassword);
                  } else {
                    setShowConfirmPassword(!showConfirmPassword);
                  }
                }}
                className="absolute transform -translate-y-1/2 right-4 top-1/2"
              >
                {field === "password"
                  ? showPassword
                    ? "🙈"
                    : "👁️"
                  : showConfirmPassword
                    ? "🙈"
                    : "👁️"}
              </button>
            </div>
          ))}

          {/* Role Selection */}
          <div className="flex flex-col w-3/5 mt-4">
            <p className="mb-2 text-xl font-bold">Register as:</p>
            {["user", "staff", "admin"].map((roleOption) => (
              <label key={roleOption} className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value={roleOption}
                  checked={formData.role === roleOption}
                  onChange={handleChange}
                />
                <span className="ml-2">
                  {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                </span>
              </label>
            ))}
          </div>

          {/* Role Code Input (for Admin/Staff) */}
          {(formData.role === "admin" || formData.role === "staff") && (
            <div className="relative w-3/5 h-9">
              <input
                type={showRoleCode ? "text" : "password"}
                name="roleCode"
                placeholder="Enter Role Code"
                className="w-full h-full text-center border-2 border-slate-400 rounded-xl"
                value={formData.roleCode}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowRoleCode(!showRoleCode)}
                className="absolute transform -translate-y-1/2 right-4 top-1/2"
              >
                {showRoleCode ? "🙈" : "👁️"}
              </button>
            </div>
          )}

          {/* Profile Image Source Selection */}
          <div className="flex flex-col w-3/5 mt-4">
            <p className="mb-2 text-xl font-bold">
              Select Profile Image Source (optional):
            </p>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="imageSource"
                  value="upload"
                  checked={imageSource === "upload"}
                  onChange={() => setImageSource("upload")}
                />
                <span className="ml-2">Upload File</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="imageSource"
                  value="url"
                  checked={imageSource === "url"}
                  onChange={() => setImageSource("url")}
                />
                <span className="ml-2">Image URL</span>
              </label>
            </div>
          </div>

          {/* Conditional Input: File Upload */}
          {imageSource === "upload" && (
            <div className="flex flex-col items-center w-3/5 mt-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
              {selectedImageFile && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(selectedImageFile)}
                    alt="Preview"
                    className="object-cover w-40 h-40 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = defaultProfile;
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Conditional Input: Image URL */}
          {imageSource === "url" && (
            <div className="flex flex-col items-center w-3/5 mt-4">
              <input
                type="text"
                name="imageUrl"
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full text-center border-2 h-9 border-slate-400 rounded-xl"
              />
              {imageUrl && (
                <div className="mt-4">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="object-cover w-40 h-40 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = defaultProfile;
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
              <Loader />
            </div>
          )}

          {/* Form Buttons */}
          <button
            type="submit"
            className="w-3/5 mt-4 font-bold text-white bg-red-500 h-9 rounded-xl"
          >
            Register
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="w-3/5 mt-2 font-bold text-white bg-gray-500 h-9 rounded-xl"
          >
            Reset
          </button>
        </form>

        {/* Redirect to Login */}
        <p className="mt-4 text-xl font-bold">
          Already have an account?{" "}
          <Link to="/login" className="text-red-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
