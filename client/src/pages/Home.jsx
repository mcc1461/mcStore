import React from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import store from "../assets/Musco_Store.jpg";

function Header() {
  return (
    <div className="flex flex-col min-h-screen text-white bg-gradient-to-b from-violet-500 to-purple-700">
      {/* Top navigation */}
      <nav className="flex items-center justify-between px-8 py-12 md:px-20 lg:px-32">
        {/* Logo and brand name */}
        <div className="flex items-center space-x-2">
          <Logo />
        </div>

        {/* Register/Login */}
        <div className="flex items-center space-x-3">
          <Link
            to="/register"
            className="px-4 py-2 text-lg font-semibold transition-transform bg-blue-700 rounded-lg hover:-translate-y-1 hover:scale-105 hover:bg-blue-900"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 text-lg font-semibold transition-transform bg-green-500 rounded-lg hover:-translate-y-1 hover:scale-105 hover:bg-green-700"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center flex-1 px-8 md:px-20 lg:px-32">
        {/* Hero Image */}
        <div className="w-full max-w-4xl mt-8 mb-12">
          <img
            src={store}
            alt="MusCo-Store"
            className="w-full h-auto shadow-xl rounded-2xl"
          />
        </div>

        {/* Headline & Key Points */}
        <section className="w-full max-w-4xl space-y-8 text-center">
          <h1 className="text-4xl font-black leading-tight md:text-5xl">
            Take Control of <br /> Your Sales Potential
          </h1>
          <p className="text-xl font-light">
            This powerful <strong>web app</strong> centralizes your entire store
            management—giving you instant inventory insights, streamlined
            customer engagement, and data-driven decision-making at your
            fingertips.
          </p>
          {/* Benefits List */}
          <ul className="pb-10 space-y-4 text-lg leading-relaxed text-left">
            <li>
              <strong>➤ Track &amp; Organize:</strong> Monitor stock levels and
              avoid costly oversights.
            </li>
            <li>
              <strong>➤ Automate &amp; Save Time:</strong> Let MusCo-Store
              handle routine tasks.
            </li>
            <li>
              <strong>➤ Engage Customers:</strong> Build loyal relationships
              with integrated sales tracking.
            </li>
            <li>
              <strong>➤ Data-Driven Insights:</strong> Make confident decisions
              with real-time dashboards.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default Header;
