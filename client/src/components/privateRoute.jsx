//PrivateRoute.jsx
export default function PrivateRoute() {
  const { userInfo } = useSelector((state) => state.auth);

  // If not logged in, navigate to /login
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the child route (Outlet)
  return <Outlet />;
}
