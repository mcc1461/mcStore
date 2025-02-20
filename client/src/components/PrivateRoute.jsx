// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
// ADD THIS IMPORT
import { useSelector } from "react-redux";

export default function PrivateRoute() {
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo) {
    // Not logged in -> redirect
    return <Navigate to="/login" replace />;
  }
  // Otherwise -> render the child route
  return <Outlet />;
}
