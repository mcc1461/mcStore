import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";
import Products from "./pages/Products";
import Issues from "./pages/Issues";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Addproducts from "./pages/Addproducts";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Editproduct from "./pages/Editproduct";
import PrivateRoute from "./components/PrivateRoute";
import Deleteproducts from "./pages/Deleteproducts";
import FirmList from "./utils/FirmList";
import BrandList from "./utils/BrandList";
import ProductList from "./utils/ProductList";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./components/NotFound";
import DashboardLayout from "./components/DashboardLayout"; // Import the layout component
import { hydrateFromStorage } from "./slices/authSlice"; // Import hydrate action

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Hydrate Redux state from localStorage on app initialization
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/firms" element={<FirmList />} />
      <Route path="/brands" element={<BrandList />} />
      <Route path="/products" element={<ProductList />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ErrorBoundary>
            <PrivateRoute />
          </ErrorBoundary>
        }
      >
        <Route element={<DashboardLayout />}>
          {/* Default Route: Dashboard */}
          <Route index element={<Dashboard />} />

          {/* Nested Routes */}
          <Route path="board" element={<Board />} />
          <Route path="profile" element={<Profile />} />
          <Route path="issues" element={<Issues />} />
          <Route path="settings" element={<Settings />} />
          <Route path="update" element={<EditProfile />} />
          {/* Products Nested Routes */}
          <Route path="products">
            <Route index element={<Products />} />
            <Route path=":id" element={<Products />} />
            <Route path="editproduct/:id" element={<Editproduct />} />
            <Route path="addproducts" element={<Addproducts />} />
            <Route path="deleteproduct/:id" element={<Deleteproducts />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
