import React, { useState } from "react";
import testReports from "./data";
import TestDetail from "./TestDetail";


const statusColors = {
  Completed: "bg-primary-600 text-white",
  Pending: "bg-gray-200 text-gray-700",
  Processing: "bg-yellow-300 text-gray-700",
};

export const Item = ({ patient_name, test_name, date, status, amount, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex justify-between items-center bg-white p-4 rounded-md shadow mb-3 cursor-pointer hover:bg-gray-50 transition"
    >
      <div>
        <p className="font-semibold">{patient_name}</p>
        <p className="text-sm text-gray-600">{test_name}</p>
        <p className="text-sm text-gray-400">{date}</p>
      </div>
      <div className="flex items-center gap-4">
        <span
          className={`px-4 py-1 text-sm rounded-full ${statusColors[status]}`}
        >
          {status}
        </span>
        <p className="font-semibold">PKR {amount}</p>
      </div>
    </div>
  );
};

const TestReport = () => {
  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <div>
      <div className="bg-white rounded-md shadow p-6">
        <h2 className="text-lg font-semibold mb-1">Test Reports</h2>
        <p className="text-sm text-gray-500 mb-4">All Test Reports And Their Status</p>
        
        {testReports.map((report) => (
          <Item
            key={report.id}
            {...report}
            onClick={() => setSelectedReport(report)}
          />
        ))}
      </div>

      {selectedReport && (
        <TestDetail report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </div>
  );
};

export default TestReport;
