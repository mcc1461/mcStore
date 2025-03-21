import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import log from "../assets/logo2.png";
import Logo1 from "../components/Logo1";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false); // Replaces the RTK isLoading
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // Make an API call manually (replace endpoint as needed)
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/auth/forgotPassword`,
        { email }
      );

      // Check your actual API response shape
      if (response?.data?.message === "Password reset link sent to email.") {
        toast.success("Password reset link sent to email.");
        navigate("/login");
      } else {
        toast.error("Unexpected response format. Please try again.");
      }
    } catch (error) {
      // Check for 404 or other errors from your backend
      if (error?.response?.status === 404) {
        toast.error("No account found with this email address.");
      } else {
        toast.error(
          error?.response?.data?.message ||
            "Failed to send password reset link."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen p-0 m-0 overflow-auto lg:flex-row lg:justify-center lg:items-center">
      {/* Left side: an image */}
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

      {/* Right side: input and button */}
      <div className="flex flex-col items-center justify-between h-[30%] w-[70%]">
        <div className="w-[50%]">
          <div className="flex items-center justify-between w-full">
            {/* <Logo1 /> */}
            <p className="w-[100%] text-xl font-bold text-center md:text-3xl">
              Forgot Password
            </p>
          </div>
        </div>

        {/* Input + Button + Link */}
        <div className="flex flex-col items-center justify-start w-[85%] sm:w-[50%] h-[60%] gap-7">
          <input
            type="email"
            placeholder="Email Address"
            className="w-[75%] h-12 h-max-[20%] rounded-xl border-2 border-slate-400 text-center outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <button
            className="flex items-center justify-center w-[75%] h-12 h-max-[20%] text-white font-bold bg-red-500 rounded-xl no-underline"
            onClick={handleForgotPassword}
            disabled={loading}
          >
            {loading ? "Loading..." : "Get Email Reset Link"}
          </button>

          <div className="w-[75%] text-right">
            <Link to="/login" className="font-bold text-blue-500 underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
