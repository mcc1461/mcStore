import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import log from "../assets/logo2.png";
// import Logo1 from "../components/Logo1";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const resetToken = query.get("token"); // e.g. ?token=xxx

  // Send "Forgot Password" request (i.e., request a reset link)
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // Adjust endpoint if your server is at a different path
      const response = await axios.post(
        "http://localhost:8061/forgotPassword",
        {
          email,
        }
      );

      if (response?.data?.message === "Password reset link sent to email.") {
        toast.success("Password reset link sent to email.");
      } else {
        toast.error("Unexpected response format. Please try again.");
      }
    } catch (error) {
      // If server returns 404, show "No account" message
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

  // Submit new password (i.e., reset password)
  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!password || !confirmPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!resetToken) {
      toast.error("Missing reset token.");
      return;
    }

    setLoading(true);
    try {
      // Adjust endpoint if your server is at a different path
      const response = await axios.post(
        "http://localhost:8061/reset-password",
        {
          resetToken,
          newPassword: password.trim(),
        }
      );

      if (response?.data?.message === "Password reset successfully.") {
        toast.success("Password reset successfully.");
        navigate("/login");
      } else {
        toast.error("Unexpected response format. Please try again.");
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || "Failed to reset password.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen space-y-4">
      <img src={log} alt="Log" className="w-[30%]" />

      <div className="h-[50%] w-[70%] flex flex-col items-center justify-between">
        <div className="w-[70%]">
          <div className="flex items-center justify-between w-full">
            {/* <Logo1 /> */}
            <p className="text-4xl font-bold">
              {resetToken ? "Reset Password" : "Forgot Password"}
            </p>
          </div>
        </div>

        <div className="w-[70%] flex flex-col h-[60%] items-center justify-start space-y-4">
          {/* If no resetToken in URL, show the "Forgot Password" form */}
          {!resetToken ? (
            <>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full h-12 text-center border-2 outline-none border-slate-400 rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <button
                className="flex items-center justify-center w-full h-12 font-bold text-white bg-red-500 rounded-xl"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                {loading ? "Sending..." : "Get Email Reset Link"}
              </button>
              <div className="w-full text-right">
                <Link to="/login" className="font-bold text-blue-500 underline">
                  Login
                </Link>
              </div>
            </>
          ) : (
            // If resetToken IS in URL, show the "Reset Password" form
            <>
              <form
                onSubmit={handleResetPassword}
                className="grid w-full gap-3"
              >
                <input
                  type="password"
                  name="password"
                  placeholder="New Password"
                  className="w-full h-12 text-center border-2 outline-none border-slate-400 rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  className="w-full h-12 text-center border-2 outline-none border-slate-400 rounded-xl"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="submit"
                  className="flex items-center justify-center w-full h-12 font-bold text-white bg-red-500 rounded-xl"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
