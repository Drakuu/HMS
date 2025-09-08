import React from 'react';

const DeleteModal = ({ modals, setModals, handleDeleteConfirm }) => {
  if (!modals.delete.show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg bg-white/20">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full z-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Confirm Deletion</h2>
        <p className="text-gray-600 mb-4">Are you sure you want to delete this patient record?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setModals(prev => ({ ...prev, delete: { show: false, patientId: null } }))}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;