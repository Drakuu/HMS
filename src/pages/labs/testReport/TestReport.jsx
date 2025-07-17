import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TestDetail from "./TestDetail";
import { fetchPatientTestAll } from "../../../features/patientTest/patientTestSlice";

const statusColors = {
  Completed: "bg-primary-600 text-white",
  Pending: "bg-gray-200 text-gray-700",
  Processing: "bg-yellow-300 text-gray-700",
};

const statusMap = {
  completed: "Completed",
  pending: "Pending",
  processing: "Processing",
  registered: "Pending",
  not_started: "Pending",
};

export const Item = ({
  _id,
  patient_name,
  test_name,
  date,
  status,
  amount,
  onClick,
}) => {
  const navigate = useNavigate();
  const mappedStatus = statusMap[status] || "Pending";

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-md shadow mb-3 hover:bg-gray-50 transition">
      <div onClick={onClick} className="flex-1 cursor-pointer">
        <p className="font-semibold">{patient_name}</p>
        <p className="text-sm text-gray-600">{test_name}</p>
        <p className="text-sm text-gray-400">{new Date(date).toLocaleString()}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className={`px-4 py-1 text-sm rounded-full ${statusColors[mappedStatus]}`}>
          {mappedStatus}
        </span>
        <p className="font-semibold">PKR {amount}</p>
        <button
          onClick={() => navigate(`/lab/update-report/${_id}`)}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          Update Report
        </button>
      </div>
    </div>
  );
};

const TestReport = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const dispatch = useDispatch();
  const allPatientTests = useSelector((state) => state.patientTest.allPatientTests);

  useEffect(() => {
    dispatch(fetchPatientTestAll());
  }, [dispatch]);

  const formatPatientTests = (tests) => {
    if (!tests || !tests.selectedTests) return [];

    return tests.selectedTests.map((test) => ({
      _id: tests._id,
      patient_name: tests.patient_Detail?.patient_Name || "N/A",
      test_name: test.testDetails?.testName || "N/A",
      date: test.testDate || tests.createdAt,
      status: test.testDetails?.reportStatus || "pending",
      amount: test.testDetails?.testPrice || 0,
      fullData: tests,
    }));
  };

  return (
    <div className="bg-white rounded-md shadow p-6">
      <h2 className="text-lg font-semibold mb-1">Test Reports</h2>
      <p className="text-sm text-gray-500 mb-4">All Test Reports And Their Status</p>

      {allPatientTests && allPatientTests.length > 0 ? (
        allPatientTests.map((patientTest) =>
          formatPatientTests(patientTest).map((report) => (
            <Item
              key={`${report._id}-${report.test_name}`}
              {...report}
              onClick={() => setSelectedReport(report)}
            />
          ))
        )
      ) : (
        <p className="text-gray-500">No test reports found</p>
      )}

      {selectedReport && (
        <TestDetail
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
};

export default TestReport;