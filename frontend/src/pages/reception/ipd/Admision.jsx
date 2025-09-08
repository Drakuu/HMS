import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllAdmittedPatients,
  deleteAdmission,
  dischargePatient,
  resetOperationStatus,
  selectFetchStatus,
  selectUpdateStatus,
  updatePatientAdmission
} from '../../../features/ipdPatient/IpdPatientSlice';
import { useNavigate } from 'react-router-dom';
import { getallDepartments } from '../../../features/department/DepartmentSlice';
import { getwardsbydepartmentId } from '../../../features/ward/Wardslice';

// Components
import HeaderSection from './getall/HeaderSection';
import WardTypeTabs from './getall/WardTypeTabs';
import PatientsTable from './getall/PatientsTable';
import EmptyState from './getall/EmptyState';
import SuccessModal from './getall/modals/SuccessModal';
import DeleteModal from './getall/modals/DeleteModal';
import EditModal from './getall/modals/EditModal';

const AdmittedPatients = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patientsList, errorMessage } = useSelector(state => state.ipdPatient);
  const { departments } = useSelector(state => state.department);
  const { wardsByDepartment } = useSelector(state => state.ward);
  const fetchStatus = useSelector(selectFetchStatus);
  const updateStatus = useSelector(selectUpdateStatus);
  
  // State management
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all-admitted');
  const [modals, setModals] = useState({
    delete: { show: false, patientId: null },
    edit: { show: false, patient: null },
    success: { show: false, message: '' }
  });
  const [editForm, setEditForm] = useState({
    departmentId: '',
    wardId: '',
    bedNumber: '',
    status: 'Admitted'
  });

  // Memoized derived data
  const wardTypes = useMemo(() => {
    if (!Array.isArray(patientsList)) return [];
    const types = patientsList
      .map(p => p.ward_Information?.ward_Type)
      .filter(type => type && typeof type === 'string');
    return [...new Set(types)];
  }, [patientsList]);

  // Get available beds for selected ward
  const availableBeds = useMemo(() => {
    if (!editForm.wardId || !Array.isArray(wardsByDepartment)) return [];
    
    const selectedWard = wardsByDepartment.find(ward => ward._id === editForm.wardId);
    if (!selectedWard || !selectedWard.beds) return [];
    
    return selectedWard.beds
      .filter(bed => bed && !bed.occupied)
      .map(bed => ({
        value: bed?.bedNumber?.toString()?.trim() || '',
        label: `Bed ${bed?.bedNumber || ''}`,
        className: 'text-green-600'
      }));
  }, [editForm.wardId, wardsByDepartment]);

  const filteredPatients = useMemo(() => {
    if (!Array.isArray(patientsList)) return [];

    const term = searchTerm.toLowerCase();

    return patientsList.filter(patient => {
      // Search filter applies to all tabs
      const matchesSearch = (
        (patient.patient_MRNo || '').toLowerCase().includes(term) ||
        (patient.patient_CNIC || '').toLowerCase().includes(term) ||
        (patient.patient_Name || '').toLowerCase().includes(term) ||
        (patient.ward_Information?.ward_Type || '').toLowerCase().includes(term) ||
        (patient.ward_Information?.ward_No || '').toLowerCase().includes(term) ||
        (patient.ward_Information?.bed_No || '').toLowerCase().includes(term) ||
        (patient.status?.toLowerCase() || '').includes(term)
      );
      
      // Date filtering
      let matchesDate = true;
      if (dateRange.start && dateRange.end) {
        try {
          const admissionDate = new Date(patient.admission_Details?.admission_Date);
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);

          if (isNaN(admissionDate.getTime())) return false;

          endDate.setHours(23, 59, 59);
          matchesDate = admissionDate >= startDate && admissionDate <= endDate;
        } catch (e) {
          console.error('Invalid date format', e);
          return false;
        }
      }

      // Tab-specific filtering
      if (activeTab === 'all-admitted') {
        return matchesSearch && matchesDate && patient.status?.toLowerCase() === 'admitted';
      } else if (activeTab === 'all-discharge') {
        return matchesSearch && matchesDate && patient.status?.toLowerCase() === 'discharged';
      } else {
        return matchesSearch && matchesDate &&
          patient.status?.toLowerCase() === 'admitted' &&
          (patient.ward_Information?.ward_Type || '').toLowerCase() === activeTab;
      }
    });
  }, [patientsList, searchTerm, activeTab, dateRange]);

  // Effects
  useEffect(() => {
    dispatch(getAllAdmittedPatients());
    dispatch(getallDepartments());
    return () => {
      dispatch(resetOperationStatus());
    };
  }, [dispatch]);

  useEffect(() => {
    if (updateStatus === 'succeeded') {
      setModals(prevModals => ({
        ...prevModals,
        edit: { show: false, patient: null },
        success: {
          show: true,
          message: editForm.status === 'Discharged'
            ? 'Patient discharged successfully!'
            : 'Patient updated successfully!'
        }
      }));

      dispatch(getAllAdmittedPatients());
    }
  }, [updateStatus, dispatch, modals, editForm.status]);

  // Handlers
  const handleEditClick = (patient) => {
    const department = departments.find(dept => 
      dept.name === patient.ward_Information?.ward_Type
    );
    
    setEditForm({
      departmentId: department?._id || '',
      wardId: patient.ward_Information?.ward_Id || '',
      bedNumber: patient.ward_Information?.bed_No || '',
      status: patient.status
    });
    
    setModals({ ...modals, edit: { show: true, patient } });
    
    // Load wards for the department if department is found
    if (department?._id) {
      dispatch(getwardsbydepartmentId(department._id));
    }
  };

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    setEditForm(prev => ({
      ...prev,
      departmentId,
      wardId: '',
      bedNumber: ''
    }));
    
    if (departmentId) {
      dispatch(getwardsbydepartmentId(departmentId));
    }
  };

  const handleWardChange = (e) => {
    const wardId = e.target.value;
    setEditForm(prev => ({
      ...prev,
      wardId,
      bedNumber: ''
    }));
  };

  const handleSaveEdit = () => {
    const { status } = editForm;
    const patient = modals.edit.patient;

    if (!patient?._id) {
      console.error('Patient ID is missing!');
      return;
    }

    if (status === 'Discharged') {
      const dischargePayload = {
        wardId: patient.ward_Information?.ward_Id,
        bedNumber: patient.ward_Information?.bed_No,
        patientMRNo: patient.patient_MRNo
      };
      dispatch(dischargePatient(dischargePayload));
    } else {
      const selectedDepartment = departments.find(dept => dept._id === editForm.departmentId);
      const selectedWard = wardsByDepartment.find(ward => ward._id === editForm.wardId);
      
      const payload = {
        id: patient._id,
        wardData: {
          status,
          departmentId: editForm.departmentId,
          wardId: editForm.wardId,
          ward_Type: selectedDepartment?.name || '',
          ward_No: selectedWard?.wardNumber || '',
          bed_No: editForm.bedNumber
        }
      };
      dispatch(updatePatientAdmission(payload));
    }
  };

  const handleDischargeToggle = (e) => {
    const isDischarged = e.target.checked;
    setEditForm(prev => ({
      ...prev,
      status: isDischarged ? 'Discharged' : 'Admitted',
      ...(isDischarged ? {
        departmentId: '',
        wardId: '',
        bedNumber: ''
      } : {})
    }));
  };

  const handleDeleteConfirm = () => {
    if (modals.delete.patientId) {
      dispatch(deleteAdmission(modals.delete.patientId));
      setModals({ ...modals, delete: { show: false, patientId: null } });
    }
  };

  const handleView = (mrno) => {
    navigate(`/receptionist/patient-details/${mrno}`);
  };

  const handleDateRangeChange = (type, value) => {
    setDateRange(prev => {
      const newRange = { ...prev, [type]: value };
      if (newRange.start && newRange.end) {
        const start = new Date(newRange.start);
        const end = new Date(newRange.end);
        if (start > end) {
          return { start: newRange.end, end: newRange.start };
        }
      }
      return newRange;
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setActiveTab('all-admitted');
  };

  return (
    <div className="">
      <HeaderSection
        patientsList={patientsList}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dateRange={dateRange}
        handleDateRangeChange={handleDateRangeChange}
      />

      <WardTypeTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wardTypes={wardTypes}
      />

      {/* Status Indicators */}
      {fetchStatus === 'pending' && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading patient data...</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center">
            <AiOutlineWarning className="h-5 w-5 text-red-500" />
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">
                {errorMessage || 'Failed to load patient data'}
              </p>
            </div>
          </div>
        </div>
      )}

      {dateRange.start && dateRange.end && filteredPatients?.length > 0 && (
        <div className="text-sm inline-block px-4 py-2 rounded-b-lg bg-primary-200 text-primary-700 mb-2">
          Showing patients admitted between {new Date(dateRange.start).toLocaleDateString()} and {new Date(dateRange.end).toLocaleDateString()}
        </div>
      )}

      {filteredPatients?.length > 0 ? (
        <PatientsTable
          filteredPatients={filteredPatients}
          handleView={handleView}
          handleEditClick={handleEditClick}
          setModals={setModals}
        />
      ) : (
        <EmptyState
          searchTerm={searchTerm}
          dateRange={dateRange}
          handleResetFilters={handleResetFilters}
        />
      )}

      {dateRange.start || dateRange.end ? (
        <div className="my-4">
          <button
            onClick={() => setDateRange({ start: '', end: '' })}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Reset Dates
          </button>
        </div>
      ) : null}

      {/* Modals */}
      <SuccessModal
        modals={modals}
        setModals={setModals}
      />

      <DeleteModal
        modals={modals}
        setModals={setModals}
        handleDeleteConfirm={handleDeleteConfirm}
      />

      <EditModal
        modals={modals}
        setModals={setModals}
        editForm={editForm}
        setEditForm={setEditForm}
        departments={departments}
        wardsByDepartment={wardsByDepartment}
        availableBeds={availableBeds}
        handleDepartmentChange={handleDepartmentChange}
        handleWardChange={handleWardChange}
        handleDischargeToggle={handleDischargeToggle}
        handleSaveEdit={handleSaveEdit}
        updateStatus={updateStatus}
      />
    </div>
  );
};

export default AdmittedPatients;