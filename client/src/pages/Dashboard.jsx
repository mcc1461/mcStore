"use client";

import { useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
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
  { name: "Team", href: "/team", icon: UsersIcon, current: false },
  { name: "Firms", href: "/firms", icon: FolderIcon, current: false },
  { name: "Brands", href: "/brands", icon: FolderIcon, current: false },
  { name: "Products", href: "/products", icon: FolderIcon, current: false },
  { name: "Purchases", href: "#", icon: DocumentDuplicateIcon, current: false },
  { name: "Sales", href: "#", icon: DocumentDuplicateIcon, current: false },
  { name: "Calendar", href: "#", icon: CalendarIcon, current: false },
  { name: "Reports", href: "#", icon: ChartPieIcon, current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user info from Redux
  const { userInfo } = useSelector((state) => state.auth);

  // Logout handler
  const logoutHandler = async () => {
    dispatch(logout());

    // 4) Remove tokens and user info from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");

    // 5) Redirect to login
    navigate("/login");
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
              <Dialog.Panel className="relative flex flex-1 w-full max-w-xs mr-16 bg-gray-900">
                <div className="absolute top-0 flex justify-center w-16 pt-5 left-full">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="-m-2.5 p-2.5"
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon
                      aria-hidden="true"
                      className="w-6 h-6 text-white"
                    />
                  </button>
                </div>

                {/* Sidebar content */}
                <div className="flex flex-col px-6 pb-4 overflow-y-auto bg-gray-900 grow gap-y-5 ring-1 ring-white/10">
                  <nav className="flex flex-col flex-1">
                    <ul role="list" className="flex flex-col flex-1 gap-y-7">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <a
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "bg-gray-800 text-white"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white",
                              "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                            )}
                          >
                            <item.icon
                              aria-hidden="true"
                              className="w-6 h-6 shrink-0"
                            />
                            {item.name}
                          </a>
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
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex flex-col px-6 pb-4 overflow-y-auto bg-gray-900 grow gap-y-5">
            <div className="flex items-center h-16 shrink-0">
              <img
                alt="Your Company"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                className="w-auto h-8"
              />
            </div>
            <nav className="flex flex-col flex-1">
              <ul role="list" className="flex flex-col flex-1 gap-y-7">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white",
                        "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                      )}
                    >
                      <item.icon
                        aria-hidden="true"
                        className="w-6 h-6 shrink-0"
                      />
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Main content area */}
        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex items-center h-16 px-4 bg-white border-b border-gray-200 shadow-sm shrink-0 gap-x-4 sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon aria-hidden="true" className="w-6 h-6" />
            </button>

            <div
              aria-hidden="true"
              className="w-px h-6 bg-gray-900/10 lg:hidden"
            />

            <div className="flex self-stretch flex-1 gap-x-4 lg:gap-x-6">
              <form action="#" method="GET" className="relative flex flex-1">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <MagnifyingGlassIcon
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-5 h-full text-gray-400 pointer-events-none"
                />
                <input
                  id="search-field"
                  name="search"
                  type="search"
                  placeholder="Search..."
                  className="block w-full h-full py-0 pl-8 pr-0 text-gray-900 border-0 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                />
              </form>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <button
                  type="button"
                  className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon aria-hidden="true" className="w-6 h-6" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative">
                  <Menu.Button className="-m-1.5 flex items-center p-1.5">
                    <span className="sr-only">Open user menu</span>
                    <img
                      alt="User"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                      className="w-8 h-8 rounded-full bg-gray-50"
                    />
                    <span className="hidden lg:flex lg:items-center">
                      <span className="ml-4 text-sm font-semibold leading-6 text-gray-900">
                        {userInfo ? userInfo.username : "Guest"}
                      </span>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="w-5 h-5 ml-2 text-gray-400"
                      />
                    </span>
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
                          <Link
                            to="/dashboard/profile"
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-3 py-1 text-sm leading-6 text-gray-900"
                            )}
                          >
                            Your profile
                          </Link>
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
          </div>

          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">{/* Your content */}</div>
          </main>
        </div>
      </div>
    </>
  );
}
