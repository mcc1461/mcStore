import React from "react";
import { Link } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";
import Logo from "../components/Logo";
import store from "../assets/Musco_Store.jpg";

function Header() {
  return (
    <div className="flex flex-col min-h-screen pt-10 text-white bg-violet-400">
      {/* Top navigation bar */}
      <nav className="flex items-center justify-between px-12 py-4">
        {/* Left side: Logo + "MusCo-Store" */}
        <div className="flex flex-col items-center">
          <Logo />
        </div>

        {/* Right side: Register/Login */}
        <div className="flex items-center space-x-5 text-xl font-semibold">
          <Link
            to="/register"
            className="px-3 py-1 transition ease-in-out delay-150 bg-blue-700 rounded-md hover:-translate-y-1 hover:scale-105 hover:bg-blue-900"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="px-3 py-1 transition ease-in-out delay-150 bg-green-500 rounded-md hover:-translate-y-1 hover:scale-105 hover:bg-green-700"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="flex flex-col items-center flex-1 px-8 md:px-16">
        {/* Image */}
        <div className="w-full max-w-5xl mt-6 mb-10">
          <img
            src={store}
            alt="Store illustration"
            className="w-full h-auto shadow-lg rounded-2xl"
          />
        </div>

        {/* Headline & Benefits */}
        <section className="w-full max-w-5xl space-y-10 text-center">
          {/* Bold, attention-grabbing headline */}
          <h1 className="flex flex-col text-5xl font-black tracking-tight">
            <span>Unleash Your Sales Potential</span>
            <span>with MusCo-Store</span>
          </h1>

          {/* Engaging subheading that strikes a confident tone */}
          <p className="text-2xl italic leading-relaxed">
            Empower your business with real-time insights, seamless automation,
            and razor-sharp analytics
          </p>

          {/* Distinctive bullet points with clearer calls to action */}
          <ul className="text-xl space-y-7 ">
            <li className="flex items-start gap-3">
              <strong>➤ Track & Organize:</strong> Instantly catalog product
              availability and monitor stock levels—no more costly oversights.
            </li>
            <li className="flex items-start gap-3">
              <strong>➤ Automate & Save Time:</strong> Focus on selling, while
              MusCo-Store handles routine tasks in the background.
            </li>
            <li className="flex items-start gap-3">
              <strong>➤ Engage Customers:</strong> Seamlessly track sales
              journeys and interactions to nurture loyal relationships.
            </li>
            <li className="flex items-start gap-3">
              <strong>➤ Data-Driven Insights:</strong> Harness real-time
              dashboards for smart, profitable decisions.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default Header;
