import React from "react";

const Header = () => {
  const time = new Date().toLocaleTimeString();
  return (
    <div className="bg-primary-600 rounded-md text-white px-6 py-8 shadow-md">
      <div className="flex justify-between items-center max-w-9xl mx-auto"></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-12 w-1 bg-primary-300 mr-4 rounded-full"></div>
          <div className="flex justify-between">
            <div>
              <h1 className="text-3xl font-bold">Test Report</h1>
              <p className="text-primary-100 mt-1">
                Track, Collect, And Manage all reports
              </p>
            </div>
          </div>
        </div>
        <div className="flex">
          <div className="text-sm ">
            <h1 className="text-xl font-semibold">{time}</h1>
            <span className="text-primary-100">Live Updates</span>
          </div>
          <div className="h-12 w-1 bg-primary-300 ml-4 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Header;
