import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PatientDetailsModal = ({ patient, onClose, onEdit }) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-white/20 backdrop-blur-lg flex items-center justify-center px-4">
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Appointment Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 transition"
              aria-label="Close"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Appointment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <InfoRow label="Patient Name" value={patient.patientName} />
                  <InfoRow label="MR Number" value={patient.appointmentMRNO || 'N/A'} />
                  <InfoRow
                    label="Date"
                    value={new Date(patient.appointmentDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  />
                  <InfoRow label="Time" value={patient.appointmentTime} />
                </div>
                <div className="space-y-2">
                  <InfoRow label="Doctor" value={patient.appointmentDoctorName} />
                  <InfoRow label="Type" value={patient.appointmentType} />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p>
                      <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                        patient.appointmentStatus === 'confirm'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {patient.appointmentStatus}
                      </span>
                    </p>
                  </div>
                  <InfoRow label="Deleted" value={patient.deleted ? 'Yes' : 'No'} />
                </div>
              </div>
            </div>

            {patient.message && (
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 border border-gray-200">
                  {patient.message}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t bg-gray-50">
            <button
              className='px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition mr-2'
              onClick={() => {
                onEdit(patient); // ✅ Call parent handler with patient info
                onClose();
              }}
            >
              Edit
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                         rounded-lg hover:bg-gray-100 transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Reusable row
const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">{value}</p>
  </div>
);

export default PatientDetailsModal;
