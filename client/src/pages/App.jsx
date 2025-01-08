import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../components/Home";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Board from "./Board";
import Products from "./Products";
import Issues from "./Issues";
import Settings from "./Settings";
import Profile from "./Profile";
import Updateprofile from "./Updateprofile";
import Addproducts from "./Addproducts";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Editproduct from "./Editproduct";
import PrivateRoute from "../components/privateRoute";
import Deleteproducts from "./Deleteproducts";
import FirmList from "../utils/FirmList";
import BrandList from "../utils/BrandList";
import ProductList from "../utils/ProductList";
import ErrorBoundary from "../components/ErrorBoundary";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/firms" element={<FirmList />} />
      <Route path="/brands" element={<BrandList />} />
      <Route path="/products" element={<ProductList />} />

      <Route
        path="/dashboard"
        element={
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        }
      >
        <Route path="board" element={<Board />} />
        {/*Private Routes*/}
        <Route path="" element={<PrivateRoute />}>
          <Route path="products/:id" element={<Products />} />
          <Route path="editproduct/:id" element={<Editproduct />} />
          <Route path="addproducts" element={<Addproducts />} />
          <Route path="deleteproduct/:id" element={<Deleteproducts />} />
          <Route path="profile" element={<Profile />} />
          <Route path="update" element={<Updateprofile />} />
        </Route>
        <Route path="issues" element={<Issues />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
