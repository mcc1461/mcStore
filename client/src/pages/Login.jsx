import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import log from "../assets/logo2.png";
import Loader from "../components/Loader";

function Login() {
  // State for user credentials
  const [credentials, setCredentialsState] = useState({
    username: "",
    password: "",
  });

  // Local user info from storage (if any)
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("userInfo")) || null
  );

  // Loading indicator
  const [isLoading, setIsLoading] = useState(false);

  const { username, password } = credentials;
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (userInfo) {
      navigate("/dashboard/board");
    }
  }, [userInfo, navigate]);

  // Update credentials on input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentialsState((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form (login) handler
  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting login with:", { username, password });

      // Make login API call
      const { data } = await axios.post("/api/auth/login", {
        username,
        password,
      });
      // Expected response structure:
      // data = {
      //   message: "Login successful",
      //   bearer: { accessToken, refreshToken },
      //   user: { ... }
      // }

      // Store tokens & user info in localStorage
      localStorage.setItem("token", data.bearer.accessToken);
      localStorage.setItem("refreshToken", data.bearer.refreshToken);
      localStorage.setItem("userInfo", JSON.stringify(data.user));

      // Update local state
      setUserInfo(data.user);

      toast.success("Login successful!");
      console.log("Login success! User info:", data.user);

      // Navigate to dashboard
      navigate("/dashboard/board");
    } catch (error) {
      console.error("Login Failed:", error); // Print entire error
      console.error(
        "Full error details:",
        error.response?.data || error.message
      );

      // Show a toast based on server's message, or a generic fallback
      toast.error(
        error?.response?.data?.message || "Invalid login credentials"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <img src={log} alt="Log" className="w-1/3 h-auto" />

      <div className="flex flex-col items-center justify-between w-2/3 h-3/4">
        {/* Header */}
        <div className="flex items-center justify-between w-3/5 mt-10">
          <p className="text-3xl font-bold">Login</p>
        </div>

        {/* Login Form */}
        <form
          className="flex flex-col items-center w-3/5 gap-6"
          onSubmit={submitHandler}
        >
          {/* Username Input */}
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full h-12 text-center border-2 border-gray-400 rounded-xl focus:outline-none focus:border-blue-500"
            value={username}
            onChange={handleChange}
            autoComplete="username"
          />

          {/* Password Input */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full h-12 text-center border-2 border-gray-400 rounded-xl focus:outline-none focus:border-blue-500"
            value={password}
            onChange={handleChange}
            autoComplete="current-password"
          />

          {/* Loading Indicator */}
          {isLoading && <Loader />}

          {/* Login Button */}
          <button
            type="submit"
            className="flex items-center justify-center w-full h-12 font-bold text-white bg-red-500 rounded-xl"
          >
            Login
          </button>

          {/* Forgot Password Link */}
          <div className="w-full text-right">
            <Link to="/forgotPassword" className="text-blue-500 underline">
              Forgot Password
            </Link>
          </div>
        </form>

        {/* Redirect to Register */}
        <p className="text-xl font-bold">
          Don't have an account?{" "}
          <Link to="/register" className="text-red-500">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
