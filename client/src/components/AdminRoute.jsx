import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AdminRoute() {
  const { userInfo } = useSelector((state) => state.auth);

  // Must be logged in first
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  // Must have role === 'admin'
  if (userInfo.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the child route
  return <Outlet />;
}
