import React from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../slices/authSlice"; // <-- import your logout action

export default function Dasheader() {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Axios-based logout handler
  const logoutHandler = async () => {
    // Clear Redux auth state
    dispatch(logout());

    // Remove tokens and user info from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");

    // Redirect to login
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between w-[80vw] h-[10vh] bg-white rounded-md shadow-lg px-5 text-black">
      <p className="text-xl font-bold">
        Hello,{" "}
        {userInfo ? (
          <Link to="/dashboard/profile" className="text-red-500 no-underline">
            {userInfo.username}
          </Link>
        ) : (
          "Guest"
        )}
      </p>
      <button
        className="bg-red-500 hover:bg-red-600 text-white font-semibold text-center p-2 no-underline rounded-[50px] w-[100px] transition ease-in-out delay-150 hover:-translate-1 hover:scale-110"
        onClick={logoutHandler}
      >
        Log Out
      </button>
    </div>
  );
}
