import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function AdminNavbar() {
  const [openMenu, setOpenMenu] = useState(null);

  const handleToggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className="bg-gradient-to-r from-primary-400 via-sky-300 to-primary-500 shadow-md rounded-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-start">
        {/* Navbar */}
        <nav className="flex space-x-6">
          {/* Doctor Menu */}
          <div className="relative">
            <button
              onClick={() => handleToggleMenu("doctor")}
              className="flex items-center text-white hover:text-gray-200 font-medium transition duration-300 ease-in-out"
            >
              Doctor
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {openMenu === "doctor" && (
              <div className="absolute mt-2 bg-white border rounded-xl shadow-xl w-48">
                <a
                  href="/doctor/panel"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 transition duration-200 ease-in-out rounded-t-xl"
                >
                  Doctor Panel
                </a>
                <a
                  href="/doctor/add"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 transition duration-200 ease-in-out rounded-b-xl"
                >
                  Add New Doctor
                </a>
              </div>
            )}
          </div>

          {/* Patient Menu */}
          <div className="relative">
            <button
              onClick={() => handleToggleMenu("patient")}
              className="flex items-center text-white hover:text-gray-200 font-medium transition duration-300 ease-in-out"
            >
              Patient
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {openMenu === "patient" && (
              <div className="absolute mt-2 bg-white border rounded-xl shadow-xl w-48">
                <a
                  href="/adminpaitient"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 transition duration-200 ease-in-out rounded-t-xl"
                >
                  Patient Overview
                </a>
                <a
                  href="/patient/add"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 transition duration-200 ease-in-out rounded-b-xl"
                >
                  Add New Patient
                </a>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
