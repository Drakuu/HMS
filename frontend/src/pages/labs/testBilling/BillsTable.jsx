import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FaFileInvoiceDollar,
  FaUser,
  FaFlask,
  FaMoneyBillWave,
  FaClipboardCheck,
  FaEllipsisV,
  FaTimes,
  FaChartBar,
} from "react-icons/fa";
import { processRefund ,getAllTestBills} from "../../../features/labBill/LabBillSlice";

const BillingTable = ({ bills }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [currentBill, setCurrentBill] = useState(null);
  const [refundData, setRefundData] = useState({
    refundAmount: "",
    refundReason: "",
  });
  const dispatch = useDispatch();
console.log("The bills are ", bills);
  // Group bills by patient MR Number
  const groupedBills = bills.reduce((acc, bill) => {
    const mrNo = bill.patientDetails?.patient_MRNo;
    if (!acc[mrNo]) {
      acc[mrNo] = {
        ...bill,
        tests: [{ name: bill.testDetails?.name, code: bill.testDetails?.code, price: bill.testDetails?.price }],
        totalAmount: bill.billingInfo?.finalAmount || 0,
        patientTestIds: [bill.patientTestId._id],
        refundedAmount: bill.billingInfo.Refunded?.reduce((sum, r) => sum + (r.refundAmount || 0), 0) || 0,
      };
    } else {
      acc[mrNo].tests.push({ name: bill.testDetails?.name, code: bill.testDetails?.code, price: bill.testDetails?.price });
      acc[mrNo].totalAmount += bill.billingInfo?.finalAmount || 0;
      acc[mrNo].patientTestIds.push(bill.patientTestId._id);
      acc[mrNo].refundedAmount += bill.billingInfo.Refunded?.reduce((sum, r) => sum + (r.refundAmount || 0), 0) || 0;
    }
    return acc;
  }, {});

  const groupedBillsArray = Object.values(groupedBills);

  // Calculate statistics
  const totalBills = groupedBillsArray.length;
  const totalAmount = groupedBillsArray.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
  const totalRefunded = groupedBillsArray.reduce((sum, bill) => sum + (bill.refundedAmount || 0), 0);
  const pendingBills = groupedBillsArray.filter(bill => bill.billingInfo?.paymentStatus === "pending").length;
  const paidBills = groupedBillsArray.filter(bill => bill.billingInfo?.paymentStatus === "paid").length;

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const openRefundForm = (bill) => {
    setCurrentBill(bill);
    setShowRefundForm(true);
    setActiveDropdown(null);
    setRefundData({
      refundAmount: bill.totalAmount - bill.refundedAmount,
      refundReason: "",
    });
  };

  const closeRefundForm = () => {
    setShowRefundForm(false);
    setCurrentBill(null);
    setRefundData({
      refundAmount: "",
      refundReason: "",
    });
  };

  const handleRefundChange = (e) => {
    const { name, value } = e.target;
    setRefundData((prev) => ({
      ...prev,
      [name]: name === "refundAmount" ? value : value,
    }));
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();

    if (!refundData.refundAmount || !refundData.refundReason) {
      alert("Please fill all fields");
      return;
    }

    const amount = Number(refundData.refundAmount);
    const refundableAmount = currentBill.totalAmount - currentBill.refundedAmount;
    if (amount <= 0 || amount > refundableAmount) {
      alert(`Refund amount must be between 0 and ${refundableAmount}`);
      return;
    }

    try {
      await dispatch(
        processRefund({
          patientId: currentBill.patientTestId._id,
          refundData: {
            refundAmount: amount,
            refundReason: refundData.refundReason,
          },
        })
      ).unwrap();
      
      closeRefundForm();
      alert("Refund processed successfully!");
      dispatch(getAllTestBills({ page: 1, limit: 10 }));

    } catch (err) {
      alert(`Refund failed: ${err.message || "Unknown error"}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
      {/* Statistics Section */}
      <div className="bg-primary-100 p-4 border-b border-primary-200">
        <div className="flex items-center mb-3">
          <FaChartBar className="text-primary-700 text-xl mr-2" />
          <h3 className="text-lg font-bold text-primary-700">Billing Statistics</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-md shadow-sm border border-primary-200">
            <p className="text-sm text-gray-600">Total Patients</p>
            <p className="text-lg font-bold text-primary-900">{totalBills}</p>
          </div>
          <div className="bg-white p-3 rounded-md shadow-sm border border-primary-200">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-lg font-bold text-primary-900">Rs. {totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white p-3 rounded-md shadow-sm border border-primary-200">
            <p className="text-sm text-gray-600">Total Refunded</p>
            <p className="text-lg font-bold text-primary-900">Rs. {totalRefunded.toLocaleString()}</p>
          </div>
          <div className="bg-white p-3 rounded-md shadow-sm border border-primary-200">
            <p className="text-sm text-gray-600">Pending/Paid</p>
            <p className="text-lg font-bold text-primary-900">{pendingBills}/{paidBills}</p>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-primary-600 p-4 flex items-center">
        <FaFileInvoiceDollar className="text-white text-2xl mr-3" />
        <h2 className="text-xl font-bold text-white">Test Billing Records</h2>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary-50">
            <tr>
              <th className="p-4 text-left text-primary-700 font-medium">
                <div className="flex items-center">
                  <FaUser className="mr-2" /> MR Number
                </div>
              </th>
              <th className="p-4 text-left text-primary-700 font-medium">
                Patient
              </th>
              <th className="p-4 text-left text-primary-700 font-medium">
                <div className="flex items-center">
                  <FaFlask className="mr-2" /> Tests
                </div>
              </th>
              <th className="p-4 text-left text-primary-700 font-medium">
                <div className="flex items-center">
                  <FaMoneyBillWave className="mr-2" /> Amount
                </div>
              </th>
              <th className="p-4 text-left text-primary-700 font-medium">
                Refunds
              </th>
              <th className="p-4 text-left text-primary-700 font-medium">
                <div className="flex items-center">
                  <FaClipboardCheck className="mr-2" /> Status
                </div>
              </th>
              <th className="p-4 text-left text-primary-700 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {groupedBillsArray.map((bill, index) => {
              const refundedAmount = bill.billingInfo.Refunded?.reduce(
                (total, r) => total + (r.refundAmount || 0),
                0
              ) || 0;
              const refundableAmount = bill.billingInfo.finalAmount - refundedAmount;
              return (
                <tr
                  key={`${bill.patientDetails?.patient_MRNo}-${index}`}
                  className="hover:bg-primary-50 transition-colors"
                >
                  {/* MR Number */}
                  <td className="p-4 font-medium text-primary-900">
                    {bill.patientDetails?.patient_MRNo}
                  </td>

                  {/* Patient Info */}
                  <td className="p-4">
                    <div>
                      <p className="font-medium">
                        {bill.patientDetails?.patient_Name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {bill.patientDetails?.patient_ContactNo}
                      </p>
                      <p className="text-sm text-gray-500">
                        CNIC: {bill.patientDetails?.patient_CNIC}
                      </p>
                    </div>
                  </td>

                  {/* Test Details */}
                  <td className="p-4">
                    <div>
                      {bill.tests.map((test, i) => (
                        <div key={i} className="mb-1">
                          <p className="font-medium">{test.name}</p>
                          <p className="text-sm text-gray-500">
                            Code: {test.code} | Price: Rs. {test.price.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="p-4 font-medium text-primary-900">
                    <p>Final: Rs. {bill.totalAmount.toLocaleString()}</p>
                    {bill.billingInfo?.discount > 0 && (
                      <p className="text-xs text-gray-500 line-through">
                        Original: Rs. {bill.billingInfo?.totalAmount.toLocaleString()}
                      </p>
                    )}
                    {bill.billingInfo?.discount > 0 && (
                      <p className="text-xs text-gray-500">
                        Discount: Rs. {bill.billingInfo?.discount.toLocaleString()}
                      </p>
                    )}
                  </td>

                  {/* Refunds */}
                  <td className="p-4">
                    <p>Refunded: Rs. {refundedAmount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      Refundable: Rs. {refundableAmount.toLocaleString()}
                    </p>
                    {bill.billingInfo.Refunded?.length > 0 && (
                      <div className="text-sm text-gray-500">
                        {bill.billingInfo.Refunded.map((refund, i) => (
                          <p key={i}>
                            Rs. {refund.refundAmount} ({refund.refundReason})
                          </p>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        bill.billingInfo?.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : bill.billingInfo?.paymentStatus === "partial"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {bill.billingInfo?.paymentStatus}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 relative">
                    <button
                      onClick={() =>
                        toggleDropdown(bill.patientDetails?.patient_MRNo)
                      }
                      className="p-2 text-gray-500 hover:text-primary-700 hover:bg-primary-50 rounded-full"
                    >
                      <FaEllipsisV />
                    </button>

                    {activeDropdown === bill.patientDetails?.patient_MRNo && (
                      <div className="absolute right-10 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
  <div className="py-1">
    {bill.patientTestIds.map((id, i) => (
      <Link
        key={i}
        to={`/lab/bills/${id}`}
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-900"
        onClick={() => setActiveDropdown(null)}
      >
        View Test {i + 1} Details
      </Link>
    ))}
    {bill.billingInfo?.paymentStatus !== "paid" && refundableAmount > 0 && (
      <button
        onClick={() => openRefundForm(bill)}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-900"
      >
        Refund Payment
      </button>
    )}
  </div>
</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="bg-primary-50 p-4 border-t border-primary-100">
        <div className="flex justify-between items-center">
          <div className="text-sm text-primary-700">
            Showing{" "}
            <span className="font-medium">{groupedBillsArray.length}</span>{" "}
            patients
          </div>
          <div className="flex space-x-2">
            <span className="text-sm text-primary-700">
              Total:{" "}
              <span className="font-medium">
                Rs. {totalAmount.toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Refund Form Modal */}
      {showRefundForm && currentBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Process Refund</h3>
              <button
                onClick={closeRefundForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-4">
              <p className="font-medium">
                Patient: {currentBill.patientDetails?.patient_Name}
              </p>
              <p>MR Number: {currentBill.patientDetails?.patient_MRNo}</p>
              <p className="mt-2">
                Total Amount: Rs. {currentBill.totalAmount.toLocaleString()}
              </p>
              <p>
                Refundable Amount: Rs. {(currentBill.totalAmount - currentBill.refundedAmount).toLocaleString()}
              </p>
            </div>

            <form onSubmit={handleRefundSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="refundAmount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Refund Amount (Rs.)
                </label>
                <input
                  type="number"
                  id="refundAmount"
                  name="refundAmount"
                  value={refundData.refundAmount}
                  onChange={handleRefundChange}
                  min="0"
                  max={currentBill.totalAmount - currentBill.refundedAmount}
                  step="1"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max: Rs. {(currentBill.totalAmount - currentBill.refundedAmount).toLocaleString()}
                </p>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="refundReason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reason for Refund
                </label>
                <textarea
                  id="refundReason"
                  name="refundReason"
                  value={refundData.refundReason}
                  onChange={handleRefundChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeRefundForm}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Process Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingTable;