// REACT FORGOT PASSWORD PAGE || ForgotPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import log from "../assets/log.png";
import Logo1 from "../components/Logo1";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState(""); // State for the user's email
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation(); // RTK mutation

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const response = await forgotPassword({ email });
      if (response?.data?.message === "Password reset link sent to email.") {
        toast.success("Password reset link sent to email.");
        navigate("/login");
      } else {
        toast.error("Unexpected response format. Please try again.");
      }
    } catch (error) {
      if (error?.response?.status === 404) {
        toast.error("No account found with this email address.");
      } else {
        toast.error(
          error?.response?.data?.message ||
            "Failed to send password reset link."
        );
      }
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <img src={log} alt="Log" className="h-full w-[30%]" />
      <div className="h-[70%] w-[70%] flex flex-col items-center justify-between">
        <div className="w-[60%]">
          <div className="flex items-center justify-between w-full">
            <Logo1 />
            <p className="text-3xl font-bold">Forgot Password</p>
          </div>
        </div>
        <div className="w-[60%] flex flex-col h-[60%] items-center justify-start gap-7">
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email Address"
            className="w-full outline-none border-2 border-slate-400 text-center rounded-xl h-[20%]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <button
            className="w-full bg-red-500 h-[20%] text-white font-bold rounded-xl text-center flex items-center justify-center no-underline"
            onClick={handleForgotPassword}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Get Email Reset Link"}
          </button>
          <div className="w-full">
            <Link to="/login" className="text-right underline">
              login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
