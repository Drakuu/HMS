import React from 'react';

const BedManagementModal = ({ ward, onClose }) => {
  if (!ward || !ward.beds) return null;

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-lg flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg w-[800px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Bed Management - {ward.name} (Ward {ward.wardNumber})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <div className="flex space-x-2 underline underline-offset-2 italic mb-2">
            <span className="font-medium">Total Beds:</span>
            <span>{ward.beds.length}</span>
          </div>
          <div className="flex underline underline-offset-2 italic mb-2">
            <span className="font-medium">Available Beds:</span>
            <span>{ward.beds.filter(bed => !bed.isOccupied).length}</span>
          </div>
          <div className="flex underline underline-offset-2 italic mb-2">
            <span className="font-medium">Occupied Beds:</span>
            <span>{ward.beds.filter(bed => bed.isOccupied).length}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-700 mb-3">Bed Details</h3>
          <div className="grid grid-cols-3 gap-4">
            {ward.beds.map((bed, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${bed.isOccupied ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
              >
                <div className="font-medium">Bed #{bed.bedNumber}</div>
                <div className="text-sm">
                  Status: {bed.isOccupied ? 'Occupied' : 'Available'}
                </div>
                {bed.isOccupied && bed.patient && (
                  <div className="text-xs mt-1">
                    Patient: {bed.patient.name || 'Unknown'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-6 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BedManagementModal;