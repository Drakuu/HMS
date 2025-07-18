import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TestDetail from "./TestDetail";
import { fetchPatientTestAll } from "../../../features/patientTest/patientTestSlice";

const statusColors = {
  completed: "bg-green-600 text-white",
  pending: "bg-gray-200 text-gray-700",
  processing: "bg-yellow-300 text-gray-700",
  registered: "bg-blue-200 text-blue-800",
  not_started: "bg-gray-400 text-gray-700",
};

const statusMap = {
  completed: "Completed",
  pending: "Pending",
  processing: "Processing",
  registered: "Registered",
  not_started: "Not Started",
};

const paymentStatusMap = {
  paid: "Paid",
  pending: "Unpaid",
  partial: "Partial",
};

export const Item = ({
  _id,
  patient_name,
  test_name,
  date,
  status,
  amount,
  payment_status,
  onClick,
}) => {
  const navigate = useNavigate();
  const mappedStatus = statusMap[status] || status;
  const mappedPaymentStatus = paymentStatusMap[payment_status] || payment_status;

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-md shadow mb-3 hover:bg-gray-50 transition">
      <div onClick={onClick} className="flex-1 cursor-pointer">
        <p className="font-semibold">{patient_name}</p>
        <p className="text-sm text-gray-600">{test_name}</p>
        <p className="text-sm text-gray-400">{new Date(date).toLocaleString()}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className={`px-4 py-1 text-sm rounded-full ${statusColors[status] || statusColors.pending}`}>
          {mappedStatus}
        </span>
        <span className={`px-2 py-1 text-sm rounded-full ${
          mappedPaymentStatus === "Paid" 
            ? "bg-green-100 text-green-800" 
            : mappedPaymentStatus === "Partial" 
              ? "bg-yellow-100 text-yellow-800" 
              : "bg-red-100 text-red-800"
        }`}>
          {mappedPaymentStatus}
        </span>
        <p className="font-semibold">PKR {amount}</p>
        <button
          onClick={() => navigate(`/lab/update-report/${_id}`)}
          className="bg-[#009689] hover:text-black text-white px-3 py-1 rounded text-sm "
        >
          Update Report
        </button>
      </div>
    </div>
  );
};

const TestReport = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    paymentStatus: "all",
    testStatus: "all",
    testNameOrCode: "",
    dateRange: "all",
  });
  
  const dispatch = useDispatch();
  const allPatientTests = useSelector((state) => state.patientTest.allPatientTests);

  useEffect(() => {
    dispatch(fetchPatientTestAll());
  }, [dispatch]);

  // Function to get the current status from statusHistory
  const getCurrentStatus = (statusHistory) => {
    if (!statusHistory || statusHistory.length === 0) return "registered";
    
    // Sort by changedAt in descending order to get the most recent status
    const sortedHistory = [...statusHistory].sort((a, b) => 
      new Date(b.changedAt) - new Date(a.changedAt)
    );
    
    return sortedHistory[0].status;
  };

  const formatPatientTests = (tests) => {
    if (!tests || !tests.selectedTests) return [];

    return tests.selectedTests.map((test) => {
      const currentStatus = getCurrentStatus(test.statusHistory);
      
      return {
        _id: tests._id,
        patient_name: tests.patient_Detail?.patient_Name || "N/A",
        test_name: test.testDetails?.testName || "N/A",
        test_code: test.testDetails?.testCode || "N/A",
        date: test.testDate || tests.createdAt,
        status: currentStatus,
        payment_status: tests.paymentStatus || "pending",
        amount: test.testDetails?.testPrice || 0,
        fullData: tests,
        statusHistory: test.statusHistory || [],
      };
    });
  };

  const filteredReports = () => {
    if (!allPatientTests || allPatientTests.length === 0) return [];

    const allReports = allPatientTests.flatMap(patientTest => 
      formatPatientTests(patientTest)
    );

    return allReports.filter(report => {
      // Search filter (patient name or MRNo)
      const matchesSearch = 
        filters.search === "" ||
        report.patient_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.fullData.patient_Detail?.patient_MRNo?.toLowerCase().includes(filters.search.toLowerCase());

      // Payment status filter
      const matchesPaymentStatus = 
        filters.paymentStatus === "all" ||
        report.payment_status === filters.paymentStatus;

      // Test status filter
      const matchesTestStatus = 
        filters.testStatus === "all" ||
        report.status === filters.testStatus;

      // Test name or code filter
      const matchesTestNameOrCode = 
        filters.testNameOrCode === "" ||
        report.test_name.toLowerCase().includes(filters.testNameOrCode.toLowerCase()) ||
        report.test_code.toLowerCase().includes(filters.testNameOrCode.toLowerCase());

      // Date range filter
      const now = new Date();
      const reportDate = new Date(report.date);
      let matchesDateRange = true;
      
      if (filters.dateRange === "today") {
        matchesDateRange = reportDate.toDateString() === now.toDateString();
      } else if (filters.dateRange === "thisWeek") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        matchesDateRange = reportDate >= oneWeekAgo;
      } else if (filters.dateRange === "thisMonth") {
        matchesDateRange = reportDate.getMonth() === now.getMonth() && 
                         reportDate.getFullYear() === now.getFullYear();
      }

      return matchesSearch && matchesPaymentStatus && matchesTestStatus && matchesTestNameOrCode && matchesDateRange;
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-md shadow p-6">
      <h2 className="text-lg font-semibold mb-1">Test Reports</h2>
      <p className="text-sm text-gray-500 mb-4">All Test Reports And Their Status</p>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search (Name/MRNo)</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by name or MRNo"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
          <select
            name="paymentStatus"
            value={filters.paymentStatus}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Unpaid</option>
            <option value="partial">Partial</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Test Status</label>
          <select
            name="testStatus"
            value={filters.testStatus}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="registered">Registered</option>
            <option value="not_started">Not Started</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Test Name/Code</label>
          <input
            type="text"
            name="testNameOrCode"
            value={filters.testNameOrCode}
            onChange={handleFilterChange}
            placeholder="Search by test name or code"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select
            name="dateRange"
            value={filters.dateRange}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredReports().length} reports
      </div>

      {/* Reports List */}
      {filteredReports().length > 0 ? (
        filteredReports().map((report) => (
          <Item
            key={`${report._id}-${report.test_name}`}
            {...report}
            onClick={() => setSelectedReport(report)}
          />
        ))
      ) : (
        <p className="text-gray-500">No test reports match your filters</p>
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