import React from 'react';

const WardModal = ({
    onClose,
    onAddWard,
    onUpdateWard,
    wardDetails,
    onInputChange,
    departments,
    departmentNurses,
    isCreating,
    isProcessing
}) => {
    return (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-lg flex justify-center items-center z-50">
            <div className="bg-white border border-gray-400 rounded-xl p-8 shadow-lg w-[800px] max-h-[90vh] overflow-y-auto transform transition-all">
                <h2 className="text-2xl font-bold mb-4 text-center text-primary-800">
                    {isCreating ? 'Add New Ward' : 'Edit Ward'}
                </h2>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Department Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Department Name</label>
                        <select
                            name="department_Name"
                            value={wardDetails.department_Name}
                            onChange={onInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                            disabled={isProcessing}
                        >
                            <option value="">Select Department</option>
                            {departments?.map((dept) => (
                                <option key={dept._id} value={dept.name}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Ward Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Ward Name</label>
                        <input
                            type="text"
                            name="name"
                            value={wardDetails.name}
                            onChange={onInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                            disabled={isProcessing}
                        />
                    </div>

                    {/* Ward Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Ward Number*</label>
                        <input
                            type="number"
                            name="wardNumber"
                            value={wardDetails.wardNumber || ''}
                            onChange={onInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                            disabled={isProcessing}
                            required
                        />
                        {!wardDetails.wardNumber && (
                            <p className="mt-1 text-sm text-red-600">Ward number is required</p>
                        )}
                    </div>

                    {/* Bed Count */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Total Bed Count</label>
                        <input
                            type="number"
                            name="bedCount"
                            value={wardDetails.bedCount || ''}
                            onChange={onInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                            disabled={isProcessing}
                        />
                    </div>
                </div>

                {/* Ward-Level Nurse Assignment */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Ward-Level Nurses</label>
                    <div className="space-y-3">
                        {wardDetails.nurses?.map((nurse, index) => (
                            <div key={index} className="grid grid-cols-3 gap-4 items-center">
                                <select
                                    value={nurse.nurse}
                                    onChange={(e) => {
                                        const updatedNurses = [...wardDetails.nurses];
                                        updatedNurses[index].nurse = e.target.value;
                                        onInputChange({ target: { name: 'nurses', value: updatedNurses } });
                                    }}
                                    className="p-2 border border-gray-300 rounded-md shadow-sm"
                                    disabled={isProcessing}
                                >
                                    <option value="">Select Nurse</option>
                                    {departmentNurses?.map((n) => (
                                        <option key={n._id} value={n._id}>
                                            {`${n.firstName} ${n.lastName}`}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Role"
                                    value={nurse.role}
                                    onChange={(e) => {
                                        const updatedNurses = [...wardDetails.nurses];
                                        updatedNurses[index].role = e.target.value;
                                        onInputChange({ target: { name: 'nurses', value: updatedNurses } });
                                    }}
                                    className="p-2 border border-gray-300 rounded-md shadow-sm"
                                    disabled={isProcessing}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const updatedNurses = [...wardDetails.nurses];
                                        updatedNurses.splice(index, 1);
                                        onInputChange({ target: { name: 'nurses', value: updatedNurses } });
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                    disabled={isProcessing}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                const updatedNurses = [...(wardDetails.nurses || []), { nurse: '', role: '' }];
                                onInputChange({ target: { name: 'nurses', value: updatedNurses } });
                            }}
                            className="text-primary-500 border p-1 rounded-md hover:text-primary-700 text-sm flex items-center"
                            disabled={isProcessing}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Ward Nurse
                        </button>
                    </div>
                </div>

                <div className="flex justify-between border-t pt-3 border-primary-600 mt-6">
                    <button
                        onClick={onClose}
                        className="bg-white hover:bg-gray-400 border border-gray-400 text-gray-800 py-2 px-6 rounded-md transition flex items-center"
                        disabled={isProcessing}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                    </button>
                    {isCreating ? (
                        <button
                            onClick={onAddWard}
                            className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-6 rounded-md transition flex items-center disabled:opacity-50"
                            disabled={isProcessing || !wardDetails.wardNumber}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {isProcessing ? 'Creating...' : 'Add Ward'}
                        </button>
                    ) : (
                        <button
                            onClick={onUpdateWard}
                            className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-6 rounded-md transition flex items-center disabled:opacity-50"
                            disabled={isProcessing || !wardDetails.wardNumber}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {isProcessing ? 'Updating...' : 'Update Ward'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WardModal;