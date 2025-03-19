import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png"; // Adjust the path if needed

function Logo() {
  return (
    <Link to="/login" className="text-white no-underline">
      <div className="flex flex-col items-center justify-center py-4 sm:py-6">
        <div className="flex items-center justify-center w-20 h-20 text-center transition-colors duration-300 border-4 border-white rounded-full  sm:w-24 sm:h-24 hover:text-red-500 hover:bg-white">
          <div className="text-red-500 transition-colors duration-300 hover:text-white">
            <img
              src={logo}
              alt="Logo"
              className="h-12 rounded-full sm:h-14 md:h-16"
            />
          </div>
        </div>
        <p className="mt-2 text-xl font-semibold transition-colors duration-300  sm:text-2xl md:text-3xl hover:text-slate-200">
          MusCo-Store
        </p>
      </div>
    </Link>
  );
}

export default Logo;
