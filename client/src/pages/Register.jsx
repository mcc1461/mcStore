import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import log from "../assets/log.png";
import Logo from "../components/Logo1";
import Loader from "../components/Loader";

function Register() {
  // State for form data
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

  // Local state for user info (based on localStorage)
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("userInfo")) || null
  );

  // State for toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRoleCode, setShowRoleCode] = useState(false);

  // Local loading state
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (userInfo) {
      navigate("/dashboard/board");
    }
  }, [userInfo, navigate]);

  // Update form data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Reset form fields
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
  };

  // Submit the registration form
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

    // Validate password
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate role code for admin/staff
    if ((role === "admin" || role === "staff") && !roleCode) {
      toast.error(`Please provide the ${role} code.`);
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data
      const registrationData = {
        firstName,
        lastName,
        username,
        email,
        password,
        role,
        roleCode,
      };

      // Make the axios call
      const { data } = await axios.post("/api/auth/register", registrationData);
      // data = {
      //   message: "User registered successfully",
      //   bearer: { accessToken, refreshToken },
      //   user: { ... }
      // }

      // Store tokens & user in localStorage
      localStorage.setItem("token", data.bearer.accessToken);
      localStorage.setItem("refreshToken", data.bearer.refreshToken);
      localStorage.setItem("userInfo", JSON.stringify(data.user));

      // Update local state
      setUserInfo(data.user);

      toast.success("Registration successful!");
      navigate("/dashboard/board");
    } catch (error) {
      console.error("Registration error:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <img src={log} alt="Log" className="w-1/3 h-auto" />

      <div className="h-[90%] w-2/3 flex flex-col items-center justify-between">
        {/* Header */}
        <div className="w-3/5 mt-10">
          <div className="flex items-center justify-between w-full">
            <Logo />
            <p className="text-3xl font-bold">Sign Up</p>
          </div>
        </div>

        {/* Registration Form */}
        <form
          className="flex flex-col items-center w-full gap-2"
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

          {/* Password / Confirm Password */}
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

          {/* Role Code Input (Admin/Staff) */}
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

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
              <Loader />
            </div>
          )}

          {/* Buttons */}
          <button
            type="submit"
            className="w-3/5 mt-4 font-bold text-white bg-red-500 h-9 rounded-xl"
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="w-3/5 mt-2 font-bold text-white bg-gray-500 h-9 rounded-xl"
          >
            Reset
          </button>
        </form>

        {/* Redirect */}
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
