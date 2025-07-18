// pages/staff/StaffManagement.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  createStaff, 
  updateStaff, 
  getAllStaff, 
} from '../../../../features/staff/staffSlice';
import { getallDepartments } from '../../../../features/department/departmentSlice';
import StaffForm from './StaffForm';
import DataTable from '../../../../components/common/DataTable';

const StaffManagement = () => {
  const dispatch = useDispatch();
  const { staffList, isLoading } = useSelector((state) => state.staff);
  const { departments } = useSelector((state) => state.department);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const initialFormData = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    designation: '',
    department: '',
    staffType: '',
    qualification: '',
    gender: '',
    cnic: '',
    city: '',
    shift: '',
    doctorDetails: {},
    nurseDetails: {},
    cleaningStaffDetails: {},
    adminDetails: {},
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    dispatch(getAllStaff());
    dispatch(getallDepartments());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (field, subfield, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subfield]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await dispatch(updateStaff({ id: editingId, staffData: formData }));
        toast.success('Staff updated successfully');
      } else {
        await dispatch(createStaff(formData));
        toast.success('Staff created successfully');
      }
      resetForm();
      dispatch(getAllStaff());
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleEdit = (id) => {
    const staffToEdit = staffList.find(staff => staff._id === id);
    if (staffToEdit) {
      setFormData({
        ...staffToEdit,
        // Ensure all nested objects exist
        doctorDetails: staffToEdit.doctorDetails || {},
        nurseDetails: staffToEdit.nurseDetails || {},
        cleaningStaffDetails: staffToEdit.cleaningStaffDetails || {},
        adminDetails: staffToEdit.adminDetails || {}
      });
      setEditingId(id);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await dispatch(deleteStaff(id));
        toast.success('Staff deleted successfully');
        dispatch(getAllStaff());
      } catch (error) {
        toast.error(error.message || 'Failed to delete staff');
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const filteredStaff = staffList.filter(staff => 
    `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.phone.includes(searchTerm) ||
    (staff.email && staff.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { field: 'firstName', header: 'First Name' },
    { field: 'lastName', header: 'Last Name' },
    { field: 'phone', header: 'Phone' },
    { field: 'email', header: 'Email' },
    { field: 'department', header: 'Department' },
    { field: 'staffType', header: 'Staff Type' },
    { 
      field: 'actions', 
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => handleEdit(row._id)}
            className="text-primary-600 hover:text-primary-800"
          >
            Edit
          </button>
          <button 
            onClick={() => handleDelete(row._id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Add New Staff
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search staff..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h2>
          <form onSubmit={handleSubmit}>
            <StaffForm 
              formData={formData}
              handleChange={handleChange}
              handleNestedChange={handleNestedChange}
              departments={departments}
            />
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : editingId ? 'Update Staff' : 'Add Staff'}
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        data={filteredStaff}
        columns={columns}
        loading={isLoading}
        emptyMessage="No staff members found"
      />
    </div>
  );
};

export default StaffManagement;