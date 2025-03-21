// src/App.jsx
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";
import Products from "./pages/Products";
import Overview from "./pages/Overview";
import Profile from "./pages/Profile";
import EditProfileModal from "./pages/EditProfileModal";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CategoriesList from "./utils/categoryList";
import FirmList from "./utils/FirmList";
import BrandList from "./utils/BrandList";
import ProductList from "./utils/ProductList";

import AdminRoute from "./components/AdminRoute";
import PrivateRoute from "./components/PrivateRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./components/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import AdminPanel from "./pages/AdminPanel";
import PurchasesList from "./utils/PurchasesList";
import SellsList from "./utils/SellsList";
import Team from "./pages/Team";

import { hydrateFromStorage } from "./slices/authSlice"; // Redux action

function App() {
  const dispatch = useDispatch();

  // On mount, hydrate Redux from localStorage
  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <Routes>
        {/* --------------------- Public Routes --------------------- */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/categories" element={<CategoriesList />} />
        <Route path="/brands" element={<BrandList />} />
        <Route path="/firms" element={<FirmList />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/purchases" element={<PurchasesList />} />
        <Route path="/sells" element={<SellsList />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/board" element={<Board />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/team" element={<Team />} />

        {/* --------------------- Private (Auth) Routes --------------------- */}
        {/* Wrap them in <PrivateRoute> so user must be logged in */}
        <Route
          element={
            <ErrorBoundary>
              <PrivateRoute />
            </ErrorBoundary>
          }
        >
          {/* Our main /dashboard path uses <DashboardLayout> as wrapper */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />

            {/* Nested routes inside /dashboard */}
            <Route path="profile" element={<Profile />} />
            <Route path="update" element={<EditProfileModal />} />
            <Route path="board" element={<Board />} />
            <Route path="overview" element={<Overview />} />

            {/* Example nested 'products' route */}
            <Route path="products">
              <Route index element={<Products />} />
              <Route path=":id" element={<Products />} />
            </Route>
          </Route>
        </Route>

        {/* --------------------- Admin-Only Routes --------------------- */}
        {/* For example: /admin-panel is only for admins */}
        <Route element={<AdminRoute />}>
          <Route path="/admin-panel" element={<AdminPanel />} />
        </Route>

        {/* --------------------- Fallback Route --------------------- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
