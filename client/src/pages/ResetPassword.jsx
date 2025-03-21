import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import log from "../assets/logo2.png";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const resetToken = query.get("token");

  const handleResetPassword = async (e) => {
    e.preventDefault();

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
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/auth/resetPassword`,
        { resetToken, newPassword: password.trim() }
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
      <div className="h-[50%] w-[70%] flex flex-col items-center justify-between">
        <div className="w-[70%] text-center">
          <h1 className="text-4xl font-bold">
            {resetToken ? "Reset Password" : "Forgot Password"}
          </h1>
        </div>
        <div className="w-[70%] flex flex-col h-[60%] items-center justify-start space-y-4">
          {resetToken ? (
            <form onSubmit={handleResetPassword} className="grid w-full gap-3">
              {/* Password Field */}
              <div className="w-5/5">
                {/* Fixed container for input + icon */}
                <div className="relative w-full mb-2 h-9">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="New Password"
                    className="w-full h-full pr-12 text-center border-2 border-slate-400 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              <div className="w-5/5">
                {/* Fixed container for input + icon */}
                <div className="relative w-full mb-2 h-9">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="w-full h-full pr-12 text-center border-2 border-slate-400 rounded-xl"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                    autoComplete="new-confirm-password"
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
                      confirmPassword === password && confirmPassword
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {confirmPassword === password && confirmPassword
                      ? "✅ Matched"
                      : "Not matched"}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="flex items-center justify-center w-full h-12 font-bold text-white bg-red-500 rounded-xl"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          ) : (
            <>
              <p className="text-lg">
                Please check your email for a reset link.
              </p>
              <div className="w-full text-right">
                <Link to="/login" className="font-bold text-blue-500 underline">
                  Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
