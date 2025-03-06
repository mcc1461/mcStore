import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setCredentials } from "../slices/authSlice";
import Loader from "../components/Loader";
import log from "../assets/logo2.png";

function Login() {
  const BASE_URL = import.meta.env.VITE_APP_API_URL;
  const [credentials, setCredentialsState] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // If already logged in, redirect to /dashboard
  useEffect(() => {
    if (userInfo && window.location.pathname === "/login") {
      navigate("/dashboard");
    }
  }, [userInfo, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentialsState((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = async (e) => {
    // Prevent default if possible
    if (e.cancelable) {
      e.preventDefault();
    }

    // Validate fields
    if (!credentials.username.trim() || !credentials.password.trim()) {
      toast.error("Username and Password are required.");
      return;
    }

    setIsLoading(true);
    try {
      // Call your login API
      const { data } = await axios.post(
        `${BASE_URL}/api/auth/login`,
        credentials
      );

      // Store token and user data
      localStorage.setItem("token", data.bearer.accessToken);
      dispatch(
        setCredentials({
          userInfo: data.user,
          token: data.bearer.accessToken,
          refreshToken: data.bearer.refreshToken,
        })
      );

      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login Failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Invalid login credentials. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center w-screen h-screen p-0 m-0 overflow-hidden lg:flex-row lg:items-center lg:justify-center">
      {/* Logo */}
      <img
        src={log}
        alt="Logo"
        className="
          object-contain
          w-1/2
          h-auto
          mb-4
          lg:mb-0
          lg:w-1/3
          max-h-[30vh]
        "
      />

      {/* Form Container */}
      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          w-full
          h-[50%]
          p-4
          lg:w-2/3
        "
      >
        {/* Heading */}
        <div className="w-full mb-4">
          <p className="text-3xl font-bold text-center">Login</p>
        </div>

        {/* Form */}
        <form
          onSubmit={submitHandler}
          className="relative flex flex-col items-center w-full gap-6 "
        >
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-3/5 h-12 text-center border-2 border-gray-400 rounded-xl focus:outline-none focus:border-blue-500"
            value={credentials.username}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-3/5 h-12 text-center border-2 border-gray-400 rounded-xl focus:outline-none focus:border-blue-500"
            value={credentials.password}
            onChange={handleChange}
          />

          {/* Show Loader while authenticating */}
          {isLoading && <Loader />}

          {/* Login Button */}
          <button
            type="submit"
            className="flex items-center justify-center w-3/5 h-12 font-bold text-white bg-red-500 rounded-xl"
          >
            Login
          </button>

          {/* Forgot Password Link */}
          <div className="w-3/5 text-right">
            <Link to="/forgotPassword" className="text-blue-500 underline">
              Forgot Password
            </Link>
          </div>
        </form>

        {/* Register Prompt */}
        <p className="mt-4 text-xl font-bold">
          Don't have an account?{" "}
          <Link to="/register" className="text-red-500">
            Register
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
