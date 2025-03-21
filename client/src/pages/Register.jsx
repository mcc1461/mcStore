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

  // Image source selection: "upload" for file, "url" for image URL
  const [imageSource, setImageSource] = useState("upload");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  // States for showing/hiding password hints
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

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
      navigate("/dashboard");
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

    // Normalize role: trim and lower-case it
    const roleLower = role.trim().toLowerCase();

    // Validate role code for admin/staff/coordinator
    if (
      (roleLower === "admin" ||
        roleLower === "staff" ||
        roleLower === "coordinator") &&
      !roleCode.trim()
    ) {
      toast.error(`Please provide the ${roleLower} code.`);
      return;
    }

    try {
      setIsLoading(true);

      let payload;
      let headers;
      // If an image is provided either via file upload or via URL, use FormData.
      if (
        (imageSource === "upload" && selectedImageFile) ||
        (imageSource === "url" && imageUrl.trim() !== "")
      ) {
        payload = new FormData();
        payload.append("firstName", firstName.trim());
        payload.append("lastName", lastName.trim());
        payload.append("username", username.trim());
        payload.append("email", email.trim());
        payload.append("password", password.trim());
        payload.append("role", roleLower);
        if (roleLower !== "user") {
          payload.append("roleCode", roleCode.trim());
        }
        if (imageSource === "upload" && selectedImageFile) {
          payload.append("image", selectedImageFile);
        } else if (imageSource === "url" && imageUrl.trim() !== "") {
          payload.append("image", imageUrl.trim());
        }
        headers = { "Content-Type": "multipart/form-data" };
      } else {
        // No image provided; send data as JSON.
        payload = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
          role: roleLower,
        };
        if (roleLower !== "user") {
          payload.roleCode = roleCode.trim();
        }
        headers = { "Content-Type": "application/json" };
      }

      // --- Temporary Data Tagging ---
      // If the registering role is "user", tag the record as temporary.
      if (roleLower === "user") {
        if (payload instanceof FormData) {
          payload.append("tester", true);
          payload.append("testerCreatedAt", new Date().toISOString());
        } else {
          payload.tester = true;
          payload.testerCreatedAt = new Date().toISOString();
        }
      }
      // --------------------------------

      // Send registration request
      const { data } = await axios.post("/api/auth/register", payload, {
        headers,
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
    <section className="flex flex-col items-center justify-center min-h-screen p-0 m-0 overflow-auto lg:flex-row lg:justify-center lg:items-center">
      {/* Logo is smaller, using object-cover to crop empty space */}
      <img
        src={log}
        alt="Logo"
        className="object-fit h-[30vh] lg:mb-0 lg:w-1/3 lg:h-[30vh] -mt-16 -mb-16"
      />

      {/* Form Container */}
      <div className="flex flex-col items-center justify-center w-full p-4 lg:w-2/3">
        {/* Header */}
        <div className="w-full mb-2">
          <p className="mb-2 text-3xl font-bold text-center">Register</p>
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
              autoComplete="given-name"
            />
          ))}

          {/* Password Field */}
          <div className="w-3/5">
            {/* Fixed container for input + icon */}
            <div className="relative mb-2 h-9">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full h-full pr-12 text-center border-2 border-slate-400 rounded-xl"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute transform -translate-y-1/2 right-4 top-1/2"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {/* Hint text directly beneath with minimal margin */}
            {passwordFocused && (
              <p className="mt-0.5 text-xs text-gray-600">
                Min 8: 1 upper, 1 lower, 1 digit, 1 @$!%*?
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="w-3/5">
            {/* Fixed container for input + icon */}
            <div className="relative mb-2 h-9">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                className="w-full h-full pr-12 text-center border-2 border-slate-400 rounded-xl"
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute transform -translate-y-1/2 right-4 top-1/2"
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {/* Matched/Not Matched text to the right, minimal margin above */}
            {confirmPasswordFocused && (
              <p
                className={`mt-0.5 text-xs text-right ${
                  formData.confirmPassword === formData.password &&
                  formData.confirmPassword
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formData.confirmPassword === formData.password &&
                formData.confirmPassword
                  ? "✅ Matched"
                  : "Not matched"}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div className="flex flex-col w-3/5 mt-4">
            <p className="mb-2 text-xl font-bold">Register as:</p>
            {["user", "staff", "admin", "coordinator"].map((roleOption) => (
              <label key={roleOption} className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value={roleOption}
                  checked={formData.role === roleOption}
                  onChange={handleChange}
                  autoComplete="off"
                />
                <span className="ml-2 capitalize">{roleOption}</span>
              </label>
            ))}
          </div>

          {/* Role Code Input (for Admin/Staff/Coordinator) */}
          {(formData.role === "admin" ||
            formData.role === "staff" ||
            formData.role === "coordinator") && (
            <div className="relative w-3/5 h-9">
              <input
                type={showRoleCode ? "text" : "password"}
                name="roleCode"
                placeholder="Enter Role Code"
                className="w-full h-full text-center border-2 border-slate-400 rounded-xl"
                value={formData.roleCode}
                onChange={handleChange}
                autoComplete="off"
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
                  autoComplete="off"
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
                  autoComplete="off"
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
                name="image"
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
                autoComplete="off"
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
    </section>
  );
}

export default Register;
