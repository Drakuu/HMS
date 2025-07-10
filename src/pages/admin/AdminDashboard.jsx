import React from "react";

const Dashboard = () => {
  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Top Metrics */}
        {[
          { title: "Total Invoice", value: "1,287", change: "+2.14%" },
          { title: "Total Patients", value: "965", change: "+3.78%" },
          { title: "Appointments", value: "128", change: "-1.56%" },
          { title: "Bedroom", value: "315", change: "+1.64%" },
        ].map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 shadow-lg flex flex-col items-start"
          >
            <h3 className="text-gray-600 font-medium">{metric.title}</h3>
            <div className="text-2xl font-bold mt-1">{metric.value}</div>
            <span
              className={`text-sm mt-2 font-semibold ${
                metric.change.includes("-")
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {metric.change}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        {/* Patient Overview Chart */}
        <div className="bg-white rounded-lg shadow-lg p-4 col-span-2">
          <h2 className="text-lg font-bold border-b pb-2 mb-4">Patient Overview</h2>
          <div className="text-center">[Insert Patient Overview Chart]</div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-bold border-b pb-2 mb-4">Revenue</h2>
          <div className="text-center">[Insert Revenue Chart]</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        {/* Doctors' Schedule */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-bold border-b pb-2 mb-4">Doctors' Schedule</h2>
          {["Dr. Petra Winsburry", "Dr. Ameena Karim", "Dr. Olivia Martinez"].map(
            (doctor, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center border-b py-2"
              >
                <div>{doctor}</div>
                <button className="bg-primary-500 text-white px-3 py-1 rounded text-sm">
                  View
                </button>
              </div>
            )
          )}
        </div>

        {/* Report Section */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-bold border-b pb-2 mb-4">Reports</h2>
          {["Room Cleaning", "Medication Restock", "HVAC Issue"].map(
            (report, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center border-b py-2"
              >
                <div>{report}</div>
                <span className="text-sm text-gray-500">{`${idx + 1}m ago`}</span>
              </div>
            )
          )}
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-bold border-b pb-2 mb-4">Calendar</h2>
          <div className="text-center">[Insert Calendar Component]</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
