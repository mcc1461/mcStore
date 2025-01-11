"use client";

import { useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../slices/authSlice";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon, current: true },
  { name: "Team", href: "/dashboard/team", icon: UsersIcon, current: false },
  { name: "Firms", href: "/dashboard/firms", icon: FolderIcon, current: false },
  {
    name: "Brands",
    href: "/dashboard/brands",
    icon: FolderIcon,
    current: false,
  },
  {
    name: "Products",
    href: "/dashboard/products",
    icon: FolderIcon,
    current: false,
  },
  {
    name: "Purchases",
    href: "/dashboard/purchases",
    icon: DocumentDuplicateIcon,
    current: false,
  },
  {
    name: "Sales",
    href: "/dashboard/sales",
    icon: DocumentDuplicateIcon,
    current: false,
  },
  {
    name: "Calendar",
    href: "/dashboard/calendar",
    icon: CalendarIcon,
    current: false,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
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

  const { userInfo } = useSelector((state) => state.auth);

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
            <img
              src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
              alt="Your Logo"
              className="h-8 w-auto"
            />
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
                    <img
                      src={
                        userInfo?.image?.startsWith("/uploads/")
                          ? `${import.meta.env.VITE_APP_API_URL}${userInfo.image}`
                          : "/default-profile.png"
                      }
                      alt="User Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="hidden text-gray-900 lg:block">
                      {userInfo?.username || "Guest"}
                    </span>
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
