import React from 'react';
import { FiHome, FiBriefcase } from 'react-icons/fi';

const EditModal = ({
  modals,
  setModals,
  editForm,
  setEditForm,
  departments,
  wardsByDepartment,
  availableBeds,
  handleDepartmentChange,
  handleWardChange,
  handleDischargeToggle,
  handleSaveEdit,
  updateStatus
}) => {
  if (!modals.edit.show) return null;

  const wardOptions = wardsByDepartment?.length > 0
    ? wardsByDepartment.map((ward) => ({
        value: ward._id,
        label: `${ward.name || 'Ward'} (${ward.wardNumber || 'No Number'}) - ${
          ward.beds?.filter(b => b && !b.occupied)?.length || 0
        }/${ward.beds?.length || 0} available`
      }))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Update Patient Status</h2>

        <div className="space-y-4">
          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiHome className="inline mr-1" /> Department
            </label>
            <select
              name="departmentId"
              value={editForm.departmentId}
              onChange={handleDepartmentChange}
              className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              disabled={editForm.status === 'Discharged'}
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
          
{/* Admission type */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Admission Type
  </label>
  <div className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50">
    {modals.edit.patient?.admission_Details?.admission_Type || 'Not specified'}
  </div>
</div>

          {/* Ward */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiHome className="inline mr-1" /> Ward
            </label>
            <select
              name="wardId"
              value={editForm.wardId}
              onChange={handleWardChange}
              className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              disabled={!editForm.departmentId || editForm.status === 'Discharged'}
            >
              <option value="">Select Ward</option>
              {wardOptions.map(ward => (
                <option key={ward.value} value={ward.value}>{ward.label}</option>
              ))}
            </select>
          </div>

          {/* Bed Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiBriefcase className="inline mr-1" /> Bed Number
            </label>
            <select
              name="bedNumber"
              value={editForm.bedNumber}
              onChange={(e) => setEditForm({ ...editForm, bedNumber: e.target.value })}
              className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              disabled={!editForm.wardId || editForm.status === 'Discharged' || availableBeds.length === 0}
            >
              <option value="">Select Bed</option>
              {availableBeds.length > 0 ? (
                availableBeds.map(bed => (
                  <option key={bed.value} value={bed.value}>{bed.label}</option>
                ))
              ) : (
                <option value="" disabled>No available beds</option>
              )}
            </select>
            {availableBeds.length === 0 && editForm.wardId && (
              <p className="text-sm text-red-600 mt-1">No available beds in this ward</p>
            )}
          </div>

          {/* Discharge Checkbox */}
          <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
            <input
              type="checkbox"
              id="dischargeCheckbox"
              checked={editForm.status === 'Discharged'}
              onChange={handleDischargeToggle}
              className="h-5 w-5 text-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="dischargeCheckbox" className="text-sm font-medium text-gray-700">
              Discharge Patient
            </label>
          </div>

          {editForm.status === 'Discharged' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> Discharging the patient will clear ward and bed information.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setModals(prev => ({ ...prev, edit: { show: false, patient: null } }))}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEdit}
            disabled={updateStatus === 'pending' || (editForm.status === 'Admitted' && (!editForm.departmentId || !editForm.wardId || !editForm.bedNumber))}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {updateStatus === 'pending' ? 'Saving...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;