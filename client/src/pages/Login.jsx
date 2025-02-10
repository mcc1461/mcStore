import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../slices/authSlice";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import log from "../assets/logo2.png";

function Login() {
  const [credentials, setCredentialsState] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // If already logged in, redirect from /login to /dashboard
  useEffect(() => {
    if (userInfo && window.location.pathname === "/login") {
      navigate("/dashboard");
    }
  }, [userInfo, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentialsState((prev) => ({ ...prev, [name]: value }));
  };

  // Form submission
  const submitHandler = async (e) => {
    console.log("Form submission triggered.");

    // Prevent default if possible
    if (e.cancelable) {
      e.preventDefault();
      console.log("Default action prevented.");
    } else {
      console.warn("Event is not cancelable.");
    }

    // Validate credentials
    if (!credentials.username.trim() || !credentials.password.trim()) {
      toast.error("Username and Password are required.");
      return;
    }

    setIsLoading(true);
    try {
      // Call your login API endpoint
      const { data } = await axios.post("/api/auth/login", credentials);

      // 1) Store token in localStorage => so an Axios interceptor can pick it up
      localStorage.setItem("token", data.bearer.accessToken);

      // 2) Dispatch credentials to Redux (keeping your existing logic)
      dispatch(
        setCredentials({
          userInfo: data.user,
          token: data.bearer.accessToken,
          refreshToken: data.bearer.refreshToken,
        })
      );

      // Success message + navigate
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
    <div className="flex items-center justify-center w-screen h-screen">
      <img src={log} alt="Log" className="w-1/3 h-auto" />
      <div className="flex flex-col items-center justify-between w-2/3 h-1/2">
        <div className="flex items-center justify-between w-3/5 mt-10">
          <p className="text-3xl font-bold">Login</p>
        </div>

        <form
          className="flex flex-col items-center w-3/5 gap-6"
          onSubmit={submitHandler}
        >
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full h-12 text-center border-2 border-gray-400 rounded-xl focus:outline-none focus:border-blue-500"
            value={credentials.username}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full h-12 text-center border-2 border-gray-400 rounded-xl focus:outline-none focus:border-blue-500"
            value={credentials.password}
            onChange={handleChange}
          />
          {isLoading && <Loader />}
          <button
            type="submit"
            className="flex items-center justify-center w-full h-12 font-bold text-white bg-red-500 rounded-xl"
          >
            Login
          </button>

          <div className="w-full text-right">
            <Link to="/forgotPassword" className="text-blue-500 underline">
              Forgot Password
            </Link>
          </div>
        </form>

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
