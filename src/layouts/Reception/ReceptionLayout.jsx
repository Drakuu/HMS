import React, { useState } from "react";
import ReceptionNavbar from "./ReceptionNavbar";
import ReceptionSidebar from "./ReceptionSidebar";

const ReceptionLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-primary-50">
      {/* Sidebar */}
      <div className={`fixed lg:relative z-30 h-full ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <ReceptionSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-lg bg-white/15 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ReceptionNavbar toggleSidebar={toggleSidebar} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-primary-50 p-2  md:p-4 xl:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ReceptionLayout;