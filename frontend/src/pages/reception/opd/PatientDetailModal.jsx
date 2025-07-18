import React from "react";

const PatientDetailModal = ({ patient, loading, onClose }) => {
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/20 backdrop-blur-lg z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-primary-600 text-white p-4 rounded-t-lg sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Patient Details</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl font-thin focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          <div className="flex items-center mt-2">
            <span className="bg-white text-primary-600 px-2 py-1 rounded-md text-sm font-bold">
              MR#: {patient.patient_MRNo || 'N/A'}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Patient Basic Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailItem label="Full Name" value={patient.patient_Name} />
              <DetailItem label="Gender" value={patient.patient_Gender} />
              <DetailItem label="Age" value={patient.patient_Age} />
              <DetailItem label="Date of Birth" value={patient.patient_DateOfBirth} />
              <DetailItem label="CNIC" value={patient.patient_CNIC} />
              <DetailItem label="Contact" value={patient.patient_ContactNo} />
            </div>
          </div>

          {/* Guardian Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailItem label="Name" value={patient.patient_Guardian?.guardian_Name} />
              <DetailItem label="Relation" value={patient.patient_Guardian?.guardian_Relation} />
              <DetailItem label="Contact" value={patient.patient_Guardian?.guardian_Contact} />
            </div>
          </div>

          {/* Address */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Address
            </h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700">{patient.patient_Address || 'Not provided'}</p>
            </div>
          </div>

          {/* Hospital Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Hospital Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailItem label="Consulting Doctor" value={patient.patient_HospitalInformation?.doctor_Name} />
              <DetailItem label="Department" value={patient.patient_HospitalInformation?.doctor_Department} />
              <DetailItem label="Specialization" value={patient.patient_HospitalInformation?.doctor_Specialization} />
              <DetailItem label="Token #" value={patient.patient_HospitalInformation?.token} />
              <DetailItem label="Fee" value={`Rs. ${patient.patient_HospitalInformation?.total_Fee}`} />
              <DetailItem label="Payment Status" value={
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${patient.patient_HospitalInformation?.amount_Status === 'Pending'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
                  }`}>
                  {patient.patient_HospitalInformation?.amount_Status || 'Paid'}
                </span>
              } />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable component for detail items
const DetailItem = ({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded-md">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-gray-800 font-medium mt-1">{value || 'N/A'}</p>
  </div>
);

export default PatientDetailModal;