// src/components/DashboardLayout.jsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <nav className="p-4 bg-gray-800">
        <div className="container flex mx-auto space-x-4">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              isActive
                ? "text-white px-3 py-2 rounded-md text-sm font-medium"
                : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="profile"
            className={({ isActive }) =>
              isActive
                ? "text-white px-3 py-2 rounded-md text-sm font-medium"
                : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            }
          >
            Profile
          </NavLink>
          <NavLink
            to="board"
            className={({ isActive }) =>
              isActive
                ? "text-white px-3 py-2 rounded-md text-sm font-medium"
                : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            }
          >
            Board
          </NavLink>
          <NavLink
            to="issues"
            className={({ isActive }) =>
              isActive
                ? "text-white px-3 py-2 rounded-md text-sm font-medium"
                : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            }
          >
            Issues
          </NavLink>
          <NavLink
            to="settings"
            className={({ isActive }) =>
              isActive
                ? "text-white px-3 py-2 rounded-md text-sm font-medium"
                : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            }
          >
            Settings
          </NavLink>
          <NavLink
            to="update"
            className={({ isActive }) =>
              isActive
                ? "text-white px-3 py-2 rounded-md text-sm font-medium"
                : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            }
          >
            Update Profile
          </NavLink>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 bg-gray-100">
        <Outlet /> {/* Renders the matched child route */}
      </main>
    </div>
  );
};

export default DashboardLayout;
