import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getBillDetails, resetCurrentBill } from '../../../features/labBill/LabBillSlice';
import { 
  FaFileInvoiceDollar,
  FaUser,
  FaFlask,
  FaMoneyBillWave,
  FaClipboardCheck,
  FaCalendarAlt,
  FaPrint,
  FaArrowLeft,
  FaNotesMedical
} from 'react-icons/fa';

const BillDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bill, status, error } = useSelector(state => state.labBill.currentBill);

  useEffect(() => {
    dispatch(getBillDetails(id));
    
    return () => {
      dispatch(resetCurrentBill());
    };
  }, [dispatch, id]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error || 'Failed to load bill details'}</p>
            <button 
              onClick={() => navigate(-1)}
              className="mt-2 px-4 py-2 bg-gray-200 rounded text-sm"
            >
              <FaArrowLeft className="inline mr-1" /> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">No bill data found</div>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary-600 text-white rounded"
        >
          <FaArrowLeft className="inline mr-1" /> Back to Bills
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header Section */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-primary-600 hover:text-primary-800"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <div className="bg-primary-100 p-3 rounded-full mr-4">
          <FaFileInvoiceDollar className="text-primary-600 text-2xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Bill Details</h1>
          <p className="text-primary-600">Token #: {bill.billingSummary?.tokenNumber || 'N/A'}</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        {/* Patient and Billing Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Patient Info */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <FaUser className="mr-2 text-primary-600" />
              Patient Information
            </h3>
            <div className="space-y-3">
              <DetailItem label="Name" value={bill.patient?.patient_Name} />
              <DetailItem label="MR Number" value={bill.patient?.patient_MRNo} />
              <DetailItem label="Contact" value={bill.patient?.patient_ContactNo} />
              <DetailItem label="Gender" value={bill.patient?.patient_Gender} />
              <DetailItem label="Age" value={bill.patient?.patient_Age} />
              <DetailItem label="Referred By" value={bill.patient?.referredBy} />
            </div>
          </div>

          {/* Billing Info */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <FaMoneyBillWave className="mr-2 text-primary-600" />
              Billing Information
            </h3>
            <div className="space-y-3">
              <DetailItem label="Total Amount" value={`Rs. ${bill.billingSummary?.totalAmount || '0'}`} />
              <DetailItem label="Discount" value={`Rs. ${bill.billingSummary?.discount || '0'}`} />
              <DetailItem label="Final Amount" value={`Rs. ${bill.billingSummary?.finalAmount || '0'}`} />
              <DetailItem label="Payment Status" value={
                <span className={`px-2 py-1 rounded-full text-xs ${
                  bill.billingSummary?.paymentStatus === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {bill.billingSummary?.paymentStatus || 'pending'}
                </span>
              } />
              <DetailItem label="Date" value={
                bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : 'N/A'
              } />
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <FaFlask className="mr-2 text-primary-600" />
            Test Results
          </h3>
          
          {bill.testResults?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="p-3 text-left">Test Name</th>
                    <th className="p-3 text-left">Code</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bill.testResults.map((test, index) => (
                    <tr key={index} className="hover:bg-primary-50">
                      <td className="p-3">{test.testDetails?.name || 'N/A'}</td>
                      <td className="p-3">{test.testDetails?.code || 'N/A'}</td>
                      <td className="p-3 text-right">Rs. {test.testDetails?.price || '0'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          test.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {test.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800">
              No test results found for this bill
            </div>
          )}
        </div>

        {/* Lab Notes */}
        {bill.billingSummary?.labNotes && (
          <div className="p-6 border-t border-gray-100">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <FaNotesMedical className="mr-2 text-primary-600" />
              Lab Notes
            </h3>
            <div className="bg-primary-50 p-4 rounded-lg">
              {bill.billingSummary.labNotes}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            <FaArrowLeft className="inline mr-1" /> Back
          </button>
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded">
            <FaPrint className="inline mr-1" /> Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Detail Item Component
const DetailItem = ({ label, value, icon }) => (
  <div className="flex items-start">
    {icon && <span className="mr-2 text-primary-500 mt-1">{icon}</span>}
    <div className="flex-1">
      <p className="font-medium text-gray-700">{label}</p>
      <p className="text-gray-900">{value || 'N/A'}</p>
    </div>
  </div>
);

export default BillDetail;