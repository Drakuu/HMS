import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteOperation } from '../../../features/operationManagment/otSlice';
import { toast } from 'react-toastify';

const DeleteConfirmationModal = ({ mrno, patientName, onClose }) => {
  const dispatch = useDispatch();

  const handleDelete = async () => {
    try {
      await dispatch(deleteOperation(mrno)).unwrap();
      toast.success(`Operation for MR No: ${mrno} (${patientName}) deleted successfully`);
      onClose();
    } catch (error) {
      toast.error(`Failed to delete operation: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete the operation for MR No: <strong>{mrno}</strong> - {patientName}?
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
          >
            Delete Operation
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;