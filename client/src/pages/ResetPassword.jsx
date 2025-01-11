import { useState } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import log from "../assets/logo2.png";
import Logo1 from "../components/Logo1";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const resetToken = query.get("token");

  const [forgotPassword, { isLoading: isLoadingForgot }] =
    useForgotPasswordMutation();
  const [passwordReset, { isLoading: isLoadingReset }] =
    useResetPasswordMutation(); // For password reset

  // Handle sending password reset link (Forgot Password)
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const response = await forgotPassword({ email });

      if (
        response?.data &&
        response.data.message === "Password reset link sent"
      ) {
        toast.success("Password reset link sent to email");
      } else {
        toast.error("Unexpected response format. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error?.error?.data?.message || "Failed to send password reset link"
      );
    }
  };

  // Handle actual password reset with new password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validate input fields
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      // Reset password request
      const response = await passwordReset({
        resetToken,
        newPassword: password.trim(), // Ensure trimmed password is sent
      });

      // Notify user of success
      toast.success(response.message || "Password reset successfully.");
      navigate("/login");
    } catch (error) {
      console.error("Password reset error:", error);

      // Handle error response
      toast.error(
        error.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen space-y-4">
      <img src={log} alt="Log" className="h-[100%] w-[30%]" />
      <div className="h-[70%] w-[70%] flex flex-col items-center justify-between">
        <div className="w-[70%]">
          <div className="flex items-center justify-between w-[100%]">
            <Logo1 />
            <p className="text-4xl font-bold">
              {resetToken ? "Reset Password" : "Forgot Password"}
            </p>
          </div>
        </div>

        {/* Conditional rendering based on resetToken presence */}
        <div className="w-[70%] flex flex-col h-[60%] items-center justify-start space-y-4">
          {!resetToken ? (
            <>
              {/* Forgot Password form */}
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email Address"
                className="w-full h-12 text-center border-2 outline-none border-slate-400 rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <button
                className="flex items-center justify-center w-full h-12 font-bold text-center text-white no-underline bg-red-500 rounded-xl"
                onClick={handleForgotPassword}
                disabled={isLoadingForgot}
              >
                {isLoadingForgot ? "Loading..." : "Get Email Reset Link"}
              </button>
              <div className="w-full">
                <Link to="/login" className="text-right underline">
                  Login
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Reset Password form */}
              <form
                onSubmit={handleResetPassword}
                className="w-[100%] grid gap-3"
              >
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 text-center border-2 outline-none border-slate-400 rounded-xl"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-12 text-center border-2 outline-none border-slate-400 rounded-xl"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center w-full h-12 font-bold text-center text-white bg-red-500 rounded-xl"
                >
                  {isLoadingReset ? "Loading..." : "Reset Password"}
                </button>
                {isLoadingReset && <Loader />}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
