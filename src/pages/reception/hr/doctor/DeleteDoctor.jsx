import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const DeleteConfirmationModal = ({ doctor, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center my-40 justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center mb-4">
          <FaExclamationTriangle className="text-yellow-500 text-2xl mr-3" />
          <h3 className="text-lg font-semibold">Confirm Deletion</h3>
        </div>
        <p className="mb-4">
          Are you sure you want to delete Dr. {doctor?.doctor_Name}? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;