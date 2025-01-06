import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRegisterUserMutation } from "../slices/apiSlice";
import { setCredentials } from "../slices/authSlice";
import log from "../assets/log.png";
import Logo from "../components/Logo1";
import Loader from "../components/Loader";

function Register() {
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // New state variables
  const [role, setRole] = useState("user"); // Default role is 'user'
  const [roleCode, setRoleCode] = useState("");

  // States for showing/hiding passwords
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRoleCode, setShowRoleCode] = useState(false); // Toggle visibility of role code input

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  const [registerUser, { isLoading }] = useRegisterUserMutation();

  useEffect(() => {
    if (userInfo) {
      navigate("/dashboard/board");
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else {
      try {
        // Prepare registration data
        const registrationData = {
          firstName,
          lastName,
          username,
          email,
          password,
          role,
        };

        if (role === "admin" || role === "staff") {
          if (!roleCode) {
            toast.error(`Please enter the ${role} code.`);
            return;
          }
          registrationData.roleCode = roleCode;
        }

        const res = await registerUser(registrationData).unwrap();

        // Store the token in localStorage
        localStorage.setItem("token", res.token);

        // Store user info
        localStorage.setItem("userInfo", JSON.stringify(res.user));

        // Update Redux store with user info
        dispatch(setCredentials(res.user));

        navigate("/dashboard/board");
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <img src={log} alt="Log" className="h-[auto] w-[30%]" />
      <div className="h-[90%] w-[70%] flex flex-col items-center justify-between">
        <div className="w-[60%] mt-10">
          <div className="flex items-center justify-between w-[100%]">
            <Logo className="" />
            <p className="text-3xl font-bold">Sign Up</p>
          </div>
        </div>

        <form
          className="flex flex-col items-center w-full gap-2"
          style={{ minHeight: "400px" }} // Fixed minHeight to prevent shifting
          onSubmit={submitHandler}
        >
          <input
            type="text"
            name="firstname"
            placeholder="Firstname"
            className="w-[60%] h-[35px] outline-none border-2 border-slate-400 text-center rounded-xl"
            value={firstName}
            onChange={(e) => setFirstname(e.target.value)}
            autoComplete="given-name"
          />
          <input
            type="text"
            name="lastname"
            placeholder="Lastname"
            className="w-[60%] h-[35px] outline-none border-2 border-slate-400 text-center rounded-xl"
            value={lastName}
            onChange={(e) => setLastname(e.target.value)}
            autoComplete="family-name"
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-[60%] h-[35px] outline-none border-2 border-slate-400 text-center rounded-xl"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-[60%] h-[35px] outline-none border-2 border-slate-400 text-center rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          {/* Password Input */}
          <div className="relative w-[60%] h-[35px]">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full h-full text-center border-2 outline-none border-slate-400 rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <div
              className="absolute right-4 top-[50%] transform -translate-y-[50%] cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
              style={{ fontSize: "1.5em" }}
            >
              {showPassword ? "👁️" : "🙈"}
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="relative w-[60%] h-[35px]">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full h-full text-center border-2 outline-none border-slate-400 rounded-xl"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <div
              className="absolute right-4 top-[50%] transform -translate-y-[50%] cursor-pointer"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ fontSize: "1.5em" }}
            >
              {showConfirmPassword ? "👁️" : "🙈"}
            </div>
          </div>

          {/* Role Selection */}
          <div className="w-[60%] flex flex-col mt-4">
            <p className="mb-2 text-xl font-bold">Register as:</p>
            <div className="flex justify-around">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === "user"}
                  onChange={(e) => setRole(e.target.value)}
                />
                <span className="ml-2">User</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="staff"
                  checked={role === "staff"}
                  onChange={(e) => setRole(e.target.value)}
                />
                <span className="ml-2">Staff</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === "admin"}
                  onChange={(e) => setRole(e.target.value)}
                />
                <span className="ml-2">Admin</span>
              </label>
            </div>
          </div>

          {/* Conditionally render the role code input field */}
          <div
            className="relative w-[60%] h-[35px]"
            style={{
              visibility:
                role === "admin" || role === "staff" ? "visible" : "hidden",
            }} // Space is allocated but kept hidden
          >
            <input
              type={showRoleCode ? "text" : "password"}
              name="roleCode"
              placeholder={`Enter ${role} code`}
              className="w-full h-full text-center border-2 outline-none border-slate-400 rounded-xl"
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
            />
            <div
              className="absolute right-4 top-[50%] transform -translate-y-[50%] cursor-pointer"
              onClick={() => setShowRoleCode(!showRoleCode)}
              style={{ fontSize: "1.5em" }}
            >
              {showRoleCode ? "🙈" : "👁️"}
            </div>
          </div>

          {isLoading && <Loader />}

          <button
            type="submit"
            className="w-[60%] bg-red-500 h-[35px] text-white flex justify-center items-center font-bold rounded-xl mt-4"
          >
            Sign Up
          </button>
        </form>

        <p className="text-xl font-bold">
          Already have an account?{" "}
          <Link to="/login" className="text-red-500 no-underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
