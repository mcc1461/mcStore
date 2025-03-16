import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setCredentials } from "../slices/authSlice";
import Loader from "../components/Loader";
import log from "../assets/logo2.png";
import { Dialog, Transition } from "@headlessui/react";

function Login() {
  const BASE_URL = import.meta.env.VITE_APP_API_URL;
  const [credentials, setCredentialsState] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  // New state for demo modal visibility for regular users
  const [showDemoModal, setShowDemoModal] = useState(false);

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // If already logged in and the role is not "user", redirect to /dashboard.
  // For a "user" role, we want to show the demo modal.
  useEffect(() => {
    if (
      userInfo &&
      window.location.pathname === "/login" &&
      userInfo.role !== "user"
    ) {
      navigate("/dashboard");
    }
  }, [userInfo, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentialsState((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = async (e) => {
    if (e.cancelable) {
      e.preventDefault();
    }

    if (!credentials.username.trim() || !credentials.password.trim()) {
      toast.error("Username and Password are required.");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/auth/login`,
        credentials
      );

      localStorage.setItem("token", data.bearer.accessToken);
      dispatch(
        setCredentials({
          userInfo: data.user,
          token: data.bearer.accessToken,
          refreshToken: data.bearer.refreshToken,
        })
      );

      toast.success("Login successful!");

      // For regular users, show the persistent demo modal instead of immediate navigation.
      if (data.user.role === "user") {
        setShowDemoModal(true);
      } else {
        navigate("/dashboard");
      }
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
    <>
      <section
        // Center content vertically on small screens; switch to row layout on large screens
        className="flex flex-col items-center justify-center w-screen h-screen p-0 m-0 overflow-auto lg:flex-row lg:justify-center lg:items-center"
      >
        {/* Logo bigger on both small and large screens */}
        <img
          src={log}
          alt="Logo"
          className="
            object-contain
            w-3/4
            max-h-[25vh]
            mb-4
            lg:mb-0
            lg:w-1/2
            lg:max-h-[35vh]
          "
        />

        {/* Form Container (no forced height) */}
        <div className="flex flex-col items-center justify-center w-full p-4 lg:w-2/3">
          {/* Heading */}
          <div className="w-full mb-4">
            <p className="text-3xl font-bold text-center">Login</p>
          </div>

          {/* Form */}
          <form
            onSubmit={submitHandler}
            className="relative flex flex-col items-center w-full gap-6"
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

            {isLoading && <Loader />}

            <button
              type="submit"
              className="flex items-center justify-center w-3/5 h-12 font-bold text-white bg-red-500 rounded-xl"
            >
              Login
            </button>

            <div className="w-3/5 text-right">
              <Link to="/forgotPassword" className="text-blue-500 underline">
                Forgot Password
              </Link>
            </div>
          </form>

          <p className="mt-4 text-xl font-bold">
            Don't have an account?{" "}
            <Link to="/register" className="text-red-500">
              Register
            </Link>
          </p>
        </div>
      </section>

      {/* Persistent Demo Modal for Regular Users */}
      <Transition appear show={showDemoModal} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setShowDemoModal(false)}
        >
          <div className="min-h-screen px-4 text-center">
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

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title className="text-2xl font-bold text-gray-900">
                  Demo Mode Notice
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    As a regular user, any changes you make will be temporary.
                    They will revert to the original values after 10 minutes.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    onClick={() => {
                      setShowDemoModal(false);
                      navigate("/dashboard");
                    }}
                  >
                    Proceed to Dashboard
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default Login;
