import React, { useState } from "react";
import { LogOut, Menu, } from "lucide-react";
import logo from "../../assets/images/logo1.png";
import { Link, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import AnimatedHeading from "./AnimationHeading"
export default function ReceptionNavbar({ toggleSidebar }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };
  const textVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 }
  };


  return (
    <div className="bg-primary-400 border border-primary-200 shadow-lg">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Mobile menu button and logo */}
        <div className="flex items-center">
          <button
            className="lg:hidden mr-3 text-white focus:outline-none"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/receptiondashboard" className="group">
            <img
              className="w-12 h-auto transition-transform group-hover:scale-105"
              src={logo}
              alt="Hospital Logo"
            />
          </Link>
        </div>
        <div className=" hidden md:block ">
          {/* Animated heading with heartbeat symbols */}
          <div className="hidden md:block">
            <AnimatedHeading />
          </div>

        </div>
        {/* Logout Button */}
        <div>
          <button
            className="flex items-center bg-red-600 hover:bg-red-700 px-3 sm:px-4 py-2 rounded-lg text-white font-medium transition-colors shadow hover:shadow-md"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 backdrop-blur-lg bg-white/20 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-medium mb-4">Confirm Logout</h3>
              <p className="mb-6">Are you sure you want to logout?</p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}