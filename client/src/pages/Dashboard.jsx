import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  ChevronDownIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { logout } from "../slices/authSlice";

import logo from "../assets/logo.png";
import logo2 from "../assets/logo2.png";
import defaultUser from "../assets/default-profile.png";

// Utility function to combine class names
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Navigation items (side menu)
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon, current: true },
  { name: "Team", href: "/team", icon: UsersIcon, current: false },
  { name: "Categories", href: "/categories", icon: FolderIcon, current: false },
  { name: "Firms", href: "/firms", icon: FolderIcon, current: false },
  { name: "Brands", href: "/brands", icon: FolderIcon, current: false },
  { name: "Products", href: "/products", icon: FolderIcon, current: false },
  {
    name: "Purchases",
    href: "/purchases",
    icon: DocumentDuplicateIcon,
    current: false,
  },
  {
    name: "Sells",
    href: "/sells",
    icon: DocumentDuplicateIcon,
    current: false,
  },
  {
    name: "Board",
    href: "/dashboard/board",
    icon: CalendarIcon,
    current: false,
  },
  { name: "Overview", href: "/overview", icon: ChartPieIcon, current: false },
];

// Function to capitalize the first letter of a string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function Dashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux user info from auth slice
  const { userInfo } = useSelector((state) => state.auth);

  // State to hold full profile data fetched from the API
  const [profileData, setProfileData] = useState(null);

  // Define API base URL (from Vite env in production; fallback to your public domain)
  const API_URL = import.meta.env.VITE_APP_API_URL;

  // Fetch full profile data when component mounts and userInfo is available
  useEffect(() => {
    if (userInfo) {
      const fetchProfile = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("Authentication token missing.");
          const { data } = await axios.get(
            `${API_URL}/api/users/${userInfo._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setProfileData(data.data);
        } catch (err) {
          console.error("Error fetching profile in Dashboard:", err);
        }
      };
      fetchProfile();
    }
  }, [userInfo, API_URL]);

  // Logout function
  const logoutHandler = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  // Navigate to the profile page if logged in
  const navigateToProfile = () => {
    if (userInfo) {
      navigate("/dashboard/profile");
    } else {
      alert("You must be logged in to access the profile page.");
      navigate("/login");
    }
  };

  const imageUrl = profileData?.image || defaultUser;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* FIXED TOP BAR */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center h-16 px-4 bg-white border-b shadow-sm">
        {/* MOBILE HAMBURGER */}
        <button
          type="button"
          className="mr-4 text-gray-500 lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Logo/Title */}
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="w-auto h-8 mr-2 rounded-full" />
          <h2 className="text-xl font-bold text-blue-600">Musco Store</h2>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* RIGHT SIDE: Notifications, Profile Dropdown */}
        <div className="flex items-center ml-4 space-x-4">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <BellIcon className="w-6 h-6" />
          </button>

          {/* USER DROPDOWN */}
          <Menu as="div" className="relative">
            <Menu.Button>
              <div className="flex items-center space-x-3">
                <h3 className="text-base italic font-bold">
                  Hello{" "}
                  <span className="text-blue-800">
                    {userInfo ? capitalize(userInfo.username) : " "}
                  </span>
                </h3>
                <img
                  src={imageUrl}
                  alt="Profile"
                  className="object-cover rounded-full h-9 w-9"
                  onError={(e) => {
                    e.currentTarget.src = defaultUser;
                  }}
                />
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 w-32 py-2 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black/5 focus:outline-none">
                {(userInfo?.role === "admin" ||
                  userInfo?.role === "staff" ||
                  userInfo?.role === "user") && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={navigateToProfile}
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block w-full px-3 py-1 text-left text-sm text-gray-700"
                        )}
                      >
                        Manage Profile
                      </button>
                    )}
                  </Menu.Item>
                )}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logoutHandler}
                      className={classNames(
                        active ? "bg-gray-100" : "",
                        "block w-full px-3 py-1 text-left text-sm text-gray-700 underline"
                      )}
                    >
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex pt-16">
        {/* DESKTOP SIDEBAR */}
        <div className="hidden lg:block">
          <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-gray-900 overflow-y-auto">
            <nav className="px-4 py-4">
              <ul className="space-y-4">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={classNames(
                        item.current
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white",
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium"
                      )}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* MOBILE SIDEBAR */}
        <Transition.Root show={mobileMenuOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 lg:hidden"
            onClose={setMobileMenuOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>
            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in duration-200 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex flex-col flex-1 w-full max-w-xs bg-gray-900">
                  <div className="flex items-center h-16 px-4">
                    <button
                      type="button"
                      className="ml-auto text-gray-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                  <nav className="flex-1 px-2 pb-4 mt-2 overflow-y-auto">
                    <ul className="space-y-2">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            className={classNames(
                              item.current
                                ? "bg-gray-800 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <item.icon className="flex-shrink-0 w-5 h-5 mr-3" />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* MAIN CONTENT */}
        <div className="flex-1 ml-0 lg:ml-64">
          <main className="min-h-screen p-4 bg-gray-100">
            <div className="flex items-center">
              <img
                src={logo2}
                alt="Logo"
                className="w-auto m-auto rounded-full h-96"
              />
            </div>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
