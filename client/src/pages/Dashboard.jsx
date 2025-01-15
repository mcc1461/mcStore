"use client";

import { useState, useEffect } from "react";
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
import defaultUser from "../assets/default-profile.png";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon, current: true },
  { name: "Team", href: "/dashboard/team", icon: UsersIcon, current: false },
  { name: "Firms", href: "/firms", icon: FolderIcon, current: false },
  {
    name: "Brands",
    href: "/brands",
    icon: FolderIcon,
    current: false,
  },
  {
    name: "Products",
    href: "/products",
    icon: FolderIcon,
    current: false,
  },
  {
    name: "Purchases",
    href: "/purchases",
    icon: DocumentDuplicateIcon,
    current: false,
  },
  {
    name: "Sales",
    href: "/sales",
    icon: DocumentDuplicateIcon,
    current: false,
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: CalendarIcon,
    current: false,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: ChartPieIcon,
    current: false,
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get basic user info from Redux.
  const { userInfo } = useSelector((state) => state.auth);

  // We'll fetch the full profile data from the API so we can use the updated image.
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (userInfo) {
      const fetchProfile = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token missing.");
          }
          const { data } = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/api/users/${userInfo._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // Assuming the API returns the updated user profile in data.data
          setProfileData(data.data);
        } catch (err) {
          console.error("Error fetching profile in Dashboard:", err);
          // Optionally, you might want to toast an error or do additional error handling here.
        }
      };
      fetchProfile();
    }
  }, [userInfo]);

  const logoutHandler = async () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const navigateToProfile = () => {
    if (userInfo) {
      navigate("/dashboard/profile");
    } else {
      alert("You must be logged in to access the profile page.");
      navigate("/login");
    }
  };

  // Use the fetched profileData to compute the image URL.
  // If profileData.image exists and starts with "/uploads/", prefix with the API URL.
  // Otherwise, if a valid image URL exists, use it. If not, fall back to the default image.
  const imageUrl = profileData?.image?.startsWith("/uploads/")
    ? `${import.meta.env.VITE_APP_API_URL}${profileData.image}`
    : profileData?.image || defaultUser;

  return (
    <>
      <div>
        {/* Sidebar overlay for mobile */}
        <Transition show={sidebarOpen} as={Dialog} onClose={setSidebarOpen}>
          <Dialog.Overlay className="fixed inset-0 bg-gray-900/80" />
          <div className="fixed inset-0 flex">
            <Transition.Child
              enter="transition ease-out duration-300"
              enterFrom="-translate-x-full opacity-0"
              enterTo="translate-x-0 opacity-100"
              leave="transition ease-in duration-200"
              leaveFrom="translate-x-0 opacity-100"
              leaveTo="-translate-x-full opacity-0"
            >
              <Dialog.Panel className="relative flex flex-1 w-full max-w-xs bg-gray-900">
                <div className="absolute top-0 right-0 p-2">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="rounded-md focus:outline-none"
                  >
                    <XMarkIcon className="w-6 h-6 text-white" />
                  </button>
                </div>
                <div className="flex flex-col h-full px-6 pt-5 pb-4 bg-gray-900">
                  <nav>
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Transition>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:bg-gray-900">
          <div className="flex items-center h-16 px-6 text-white">
            <img src={logo} alt="Logo" className="w-auto h-8 rounded-full" />
            <h2 className="ml-2 text-xl font-bold">Musco Store</h2>
          </div>
          <nav className="flex-1 px-6 py-4 space-y-4 bg-gray-900">
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

        {/* Top navigation bar */}
        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex items-center h-16 px-6 bg-white border-b">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Bars3Icon className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center ml-auto space-x-4">
              <button type="button" className="text-gray-400">
                <BellIcon className="w-6 h-6" />
              </button>
              <Menu as="div" className="relative">
                <Menu.Button>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl italic font-bold">Hello</h3>
                    <span className="hidden text-xl italic font-bold text-red-800 lg:block">
                      {userInfo?.username || "Guest"}
                    </span>
                    <div className="flex flex-col items-center">
                      <img
                        src={imageUrl}
                        alt="Profile"
                        className="object-cover w-16 h-16 rounded-full shadow-lg"
                        onError={(e) => {
                          // If the image fails to load, set it to the default image.
                          e.currentTarget.src = defaultUser;
                        }}
                      />
                    </div>
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                  </div>
                </Menu.Button>
                <Transition
                  as={Menu.Items}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={navigateToProfile}
                          className={classNames(
                            active ? "bg-gray-100" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900"
                          )}
                        >
                          Manage Profile
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logoutHandler}
                          className={classNames(
                            active ? "bg-gray-100" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900 underline"
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
          </div>

          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
