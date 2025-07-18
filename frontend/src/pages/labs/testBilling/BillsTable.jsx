import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFileInvoiceDollar,
  FaUser,
  FaFlask,
  FaMoneyBillWave,
  FaClipboardCheck,
  FaEye
} from 'react-icons/fa';

const BillingTable = ({ bills }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
              <th className="p-4 text-left text-primary-700 font-medium">Patient</th>
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
                <div className="flex items-center">
                  <FaClipboardCheck className="mr-2" /> Status
                </div>
              </th>
              <th className="p-4 text-left text-primary-700 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bills.map(bill => (
              <tr key={bill._id} className="hover:bg-primary-50 transition-colors">
                {/* MR Number */}
                <td className="p-4 font-medium text-primary-900">
                  {bill.patientDetails?.patient_MRNo}
                </td>
                
                {/* Patient Info */}
                <td className="p-4">
                  <div>
                    <p className="font-medium">{bill.patientDetails?.patient_Name}</p>
                    <p className="text-sm text-gray-500">
                      {bill.patientDetails?.patient_ContactNo}
                    </p>
                  </div>
                </td>
                
                {/* Test Details */}
                <td className="p-4">
                  <p className="font-medium">
                    {bill.testDetails?.name || 'Multiple tests'}
                  </p>
                </td>
                
                {/* Amount */}
                <td className="p-4 font-medium text-primary-900">
                  Rs. {bill.billingInfo?.finalAmount}
                  {bill.billingInfo?.discount > 0 && (
                    <p className="text-xs text-gray-500 line-through">
                      Rs. {bill.billingInfo?.totalAmount}
                    </p>
                  )}
                </td>
                
                {/* Status */}
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    bill.billingInfo?.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {bill.billingInfo?.paymentStatus}
                  </span>
                </td>
                
                {/* Actions */}
                <td className="p-4">
                  <Link 
                    to={`/lab/bills/${bill.patientTestId._id}`}
                    className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors"
                  >
                    <FaEye className="mr-1" /> View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="bg-primary-50 p-4 border-t border-primary-100">
        <div className="flex justify-between items-center">
          <div className="text-sm text-primary-700">
            Showing <span className="font-medium">{bills.length}</span> records
          </div>
          <div className="flex space-x-2">
            <span className="text-sm text-primary-700">
              Total: <span className="font-medium">
                Rs. {bills.reduce((sum, bill) => sum + (bill.billingInfo?.finalAmount || 0), 0)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingTable;