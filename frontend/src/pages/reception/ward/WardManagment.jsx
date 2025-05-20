import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getallDepartments } from '../../../features/department/DepartmentSlice';
import { getAllStaff } from '../../../features/staff/staffslice';
import { createWard, clearWardState, getAllWards, updateWardById } from '../../../features/ward/Wardslice';
import WardModal from './WardModal';
import BedManagementModal from './BedManagementModal';

const WardManagement = () => {
  const dispatch = useDispatch();
  const { departments } = useSelector((state) => state.department);
  const { staffList } = useSelector((state) => state.staff);
  const {
    wardList,
    loading: isCreatingWard,
    error: createError,
    successMessage,
    fetchLoading: isLoadingWards,
    fetchError: loadError
  } = useSelector((state) => state.ward);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBedModalOpen, setIsBedModalOpen] = useState(false);
  const [selectedWard, setSelectedWard] = useState(null);
  const [isCreatingNewWard, setIsCreatingNewWard] = useState(true);
  const [wardDetails, setWardDetails] = useState({
    name: '',
    department_Name: '',
    wardNumber: null,
    bedCount: null,
    rooms: [],
    nurses: []
  });
  const [departmentNurses, setDepartmentNurses] = useState([]);

  useEffect(() => {
    dispatch(getAllWards());
    dispatch(getallDepartments());
    dispatch(getAllStaff());
  }, [dispatch]);

  useEffect(() => {
    if (wardDetails.department_Name) {
      const nurses = staffList.filter(staff => 
        staff.department === wardDetails.department_Name && 
        staff.staffType === 'Nurse'
      );
      setDepartmentNurses(nurses);
    } else {
      setDepartmentNurses([]);
    }
  }, [wardDetails.department_Name, staffList]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWardDetails(prev => ({ 
      ...prev, 
      [name]: name === 'wardNumber' || name === 'bedCount' 
        ? (value === '' ? null : Number(value))
        : value 
    }));
  };

  const handleRoomChange = (rooms) => {
    setWardDetails(prev => ({ ...prev, rooms }));
  };

  const handleAddWard = () => {
    if (!wardDetails.wardNumber) {
      alert('Ward Number is required');
      return;
    }

    const wardData = {
      ...wardDetails,
      department_name: wardDetails.department_Name,
      bedCount: wardDetails.bedCount || 0
    };

    dispatch(createWard(wardData))
      .unwrap()
      .then(() => {
        setIsModalOpen(false);
        resetWardDetails();
        dispatch(getAllWards());
      })
      .catch(error => {
        console.error('Failed to create ward:', error);
        alert(error?.message || 'Failed to create ward. Please try again.');
      });
  };

  const handleUpdateWard = () => {
    if (!wardDetails._id) {
      console.error("Ward ID is missing");
      return;
    }
  
    const { _id, ...updateData } = wardDetails;
    dispatch(updateWardById({ id: _id, wardData: updateData }))
      .unwrap()
      .then(() => {
        setIsModalOpen(false);
        resetWardDetails();
        dispatch(getAllWards());
      })
      .catch(error => {
        console.error('Failed to update ward:', error);
        alert(error?.message || 'Failed to update ward. Please try again.');
      });
  };

  const resetWardDetails = () => {
    setWardDetails({
      name: '',
      department_Name: '',
      wardNumber: null,
      bedCount: null,
      rooms: [],
      nurses: []
    });
  };

  const handleAddNewWard = () => {
    setIsCreatingNewWard(true);
    resetWardDetails();
    setIsModalOpen(true);
  };

  const handleEditWard = (ward) => {
    setIsCreatingNewWard(false);
    setWardDetails({
      ...ward,
      rooms: ward.rooms || [],
      nurses: ward.nurses || []
    });
    setIsModalOpen(true);
  };

  const handleViewBeds = (ward) => {
    setSelectedWard(ward);
    setIsBedModalOpen(true);
  };

  const calculateBedsStatus = (ward) => {
    if (!ward.beds) return { totalBeds: 0, availableBeds: 0, occupiedBeds: 0 };
    
    const totalBeds = ward.beds.length;
    const occupiedBeds = ward.beds.filter(bed => bed.isOccupied).length;
    const availableBeds = totalBeds - occupiedBeds;
    
    return { totalBeds, availableBeds, occupiedBeds };
  };

  useEffect(() => {
    if (successMessage || createError || loadError) {
      const timer = setTimeout(() => dispatch(clearWardState()), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, createError, loadError, dispatch]);

  return (
    <div >
      <div className="max-w-9xl mx-auto">
        <div className="flex justify-between items-center text-white mb-8 bg-primary-600 p-4 rounded-lg shadow-md">
          <div>
            <h1 className="text-3xl font-bold">Ward Management</h1>
            <p className="">Manage hospital wards and their configurations</p>
          </div>
          <button
            onClick={handleAddNewWard}
            className="bg-white hover:bg-gray-200 text-primary-700  py-2 px-6 rounded-lg shadow-md transition flex items-center"
            disabled={isLoadingWards || isCreatingWard}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Ward
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-primary-100 text-primary-700 rounded-lg border border-primary-200">
            {successMessage}
          </div>
        )}
        {createError && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {createError}
          </div>
        )}
        {loadError && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {loadError}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bed Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wardList && wardList.length > 0 ? (
                  wardList.map((ward) => {
                    const { totalBeds, availableBeds, occupiedBeds } = calculateBedsStatus(ward);
                    return (
                      <tr key={ward._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ward.department_Name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ward.wardNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ward.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-4">
                              <span className="text-xs font-medium text-gray-500">Total:</span>
                              <span className="ml-1 text-sm font-medium">{totalBeds}</span>
                            </div>
                            <div className="mr-4">
                              <span className="text-xs font-medium text-primary-500">Available:</span>
                              <span className="ml-1 text-sm font-medium">{availableBeds}</span>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-red-500">Occupied:</span>
                              <span className="ml-1 text-sm font-medium">{occupiedBeds}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewBeds(ward)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              View Beds
                            </button>
                            <button
                              onClick={() => handleEditWard(ward)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      {isLoadingWards ? 'Loading wards...' : 'No wards found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <WardModal
          onClose={() => !isCreatingWard && setIsModalOpen(false)}
          onAddWard={handleAddWard}
          onUpdateWard={handleUpdateWard}
          wardDetails={wardDetails}
          onInputChange={handleInputChange}
          departments={departments}
          departmentNurses={departmentNurses}
          isCreating={isCreatingNewWard}
          isProcessing={isCreatingWard}
          onRoomChange={handleRoomChange}
        />
      )}

      {isBedModalOpen && selectedWard && (
        <BedManagementModal 
          ward={selectedWard} 
          onClose={() => setIsBedModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default WardManagement;