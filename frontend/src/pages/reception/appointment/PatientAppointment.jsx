import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAppointments,
  createAppointment,
  deleteAppointment,
  updateAppointment,
  selectActiveAppointments,
  selectDeletedAppointments
} from '../../../features/appointments/appointmentSlice';
import { FaCalendarAlt, FaPlus, FaTrash, FaEdit, FaFilePdf, FaFilter } from 'react-icons/fa';
import { FiSearch, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { toast } from 'react-toastify';
import AppointmentForm from '../../../components/ui/AppointmentForm';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import Calendar from '../../../components/ui/Calendar';
import PatientDetailsModal from '../../../components/ui/AppointmentPatientDetailsModal';
import FilterList from '../../../components/ui/FilterList';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const PatientAppointment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const appointments = useSelector(selectActiveAppointments);
  const status = useSelector((state) => state.appointments.status);
  const error = useSelector((state) => state.appointments.error);
  const jwtLoginToken = localStorage.getItem('jwtLoginToken');
  const deletedAppointments = useSelector(selectDeletedAppointments);

  // State for filters and pagination
  const [filters, setFilters] = useState({
    status: 'all',
    searchQuery: '',
    date: '',
    doctor: 'all',
    type: 'all',
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Form and modal states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    patientName: '',
    appointmentPatientCNIC: '',  // Added this field
    appointmentDate: '',
    appointmentTime: '',
    appointmentDoctorName: 'Dr. Sarah Johnson',
    appointmentType: 'General Checkup',
    appointmentStatus: '',
    message: '',
  });

  // Get unique doctors and types for filters
  const doctors = [...new Set(appointments.map(a => a.appointmentDoctorName))];
  const appointmentTypes = [...new Set(appointments.map(a => a.appointmentType))];

  // Fetch appointments on mount
  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, entriesPerPage]);

  const clearFormValues = useCallback(() => {
    setFormData({
      patientName: '',
      appointmentDate: '',
      appointmentTime: '',
      appointmentDoctorName: 'Dr. Sarah Johnson',
      appointmentType: 'General Checkup',
      appointmentStatus: '',
      message: '',
    });
    setEditMode(false);
    setEditingId(null);
  }, []);

  const resetForm = useCallback(() => {
    clearFormValues();
    setShowAddForm(false);
  }, [clearFormValues]);

  // Filter appointments based on all active filters
  const filteredAppointments = useCallback(() => {
    return appointments.filter((appointment) => {
      const matchesStatus = filters.status === 'all' || appointment.appointmentStatus === filters.status;
      const matchesDoctor = filters.doctor === 'all' || appointment.appointmentDoctorName === filters.doctor;
      const matchesType = filters.type === 'all' || appointment.appointmentType === filters.type;
      const matchesSearch =
        appointment.patientName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        appointment.appointmentDoctorName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        appointment.appointmentType.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        appointment.appointmentMRNO?.toLowerCase().includes(filters.searchQuery.toLowerCase());
      const matchesDate =
        !filters.date || new Date(appointment.appointmentDate).toISOString().slice(0, 10) === filters.date;

      return matchesStatus && matchesSearch && matchesDate && matchesDoctor && matchesType;
    });
  }, [appointments, filters]);

  // Pagination calculations
  const totalItems = filteredAppointments().length;
  const totalPages = Math.ceil(totalItems / entriesPerPage);
  const paginatedAppointments = filteredAppointments().slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await dispatch(deleteAppointment(appointmentId));
        toast.success('Appointment deleted successfully!');
      } catch (error) {
        toast.error(error.message || 'Error deleting appointment!');
      }
    }
  };

  const handleRowClick = (appointment) => {
    setSelectedPatient(appointment);
    setShowPatientModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newAppointment = {
      ...formData,
      appointmentStatus: formData.appointmentStatus || 'pending',
    };

    try {
      if (editMode && editingId) {
        await dispatch(updateAppointment({
          appointmentId: editingId,
          updatedData: newAppointment
        }));
        toast.success('Appointment updated successfully!');
      } else {
        await dispatch(createAppointment({
          appointmentData: newAppointment,
          jwtLoginToken
        }));
        toast.success('Appointment created successfully!');
      }
      resetForm();
    } catch (error) {
      toast.error(error.message || 'Error saving appointment!');
    }
  };

  const generatePDF = (appointment) => {
    const doc = new jsPDF();
    doc.setFontSize(18).setFont("helvetica", "bold").text("Appointment Details", 60, 20);
    doc.setFontSize(12).setFont("helvetica", "normal");
    doc.text(`Patient Name: ${appointment.patientName}`, 10, 40);
    doc.text(`MR NO: ${appointment.appointmentMRNO || 'N/A'}`, 10, 50);
    doc.text(`Date: ${appointment.appointmentDate}`, 10, 60);
    doc.text(`Time: ${appointment.appointmentTime}`, 10, 70);
    doc.text(`Doctor: ${appointment.appointmentDoctorName}`, 10, 80);
    doc.text(`Appointment Type: ${appointment.appointmentType}`, 10, 90);
    doc.text(`Status: ${appointment.appointmentStatus}`, 10, 100);
    doc.text(`Message: ${appointment.message || 'N/A'}`, 10, 110);
    doc.save(`${appointment.patientName}-appointment.pdf`);
  };

  const handleEdit = (appointment) => {
    setFormData({ ...appointment });
    setEditingId(appointment._id);
    setEditMode(true);
    setShowAddForm(true);
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      searchQuery: '',
      date: '',
      doctor: 'all',
      type: 'all',
    });
  };

  const handleDateSelect = (date) => {
    updateFilter('date', date);
    setShowDatePicker(false);
  };

  if (status === 'loading') return <LoadingSpinner fullPage />;

  if (status === 'failed') {
    toast.error(error);
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg max-w-md mx-auto mt-8">
        Error loading appointments. Please try again.
      </div>
    );
  }
  return (
    <div className="flex flex-col ">
      {/* Header Section */}
      <div className="px-4 md:px-6 pt-4 bg-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-primary-100 mr-4">
              <FaCalendarAlt className="text-primary-600 text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
              <p className="text-sm text-gray-500">
                {totalItems} {totalItems === 1 ? 'appointment' : 'appointments'} found
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              clearFormValues();
              setShowAddForm(true);
            }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg flex items-center 
                      shadow-md hover:shadow-lg transition-all duration-200"
          >
            <FaPlus className="mr-2" />
            Add Appointment
          </button>
        </div>

        {/* Modals */}
        {showAddForm && (
          <div className="fixed inset-0 bg-white/20 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <AppointmentForm
              formData={formData}
              setFormData={setFormData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              setShowAddForm={resetForm}
              editMode={editMode}
            />
          </div>
        )}

        {showPatientModal && (
          <PatientDetailsModal
            patient={selectedPatient}
            onClose={() => setShowPatientModal(false)}
            onEdit={handleEdit}
          />
        )}

        {/* Filters Section */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Main Filters Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Status Filters */}
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'confirm'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateFilter('status', status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.status === status
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
                <button
                  onClick={() => navigate('/receptionist/appointment/patient-appointment/deleted')}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 
                            text-sm font-medium flex items-center gap-2"
                >
                  <span>Deleted</span>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                    {deletedAppointments.length}
                  </span>
                </button>
              </div>

              {/* Search and Date Filters */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  {filters.date ? (
                    <div className="flex items-center bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg">
                      <span>{filters.date}</span>
                      <button
                        onClick={() => updateFilter('date', '')}
                        className="ml-2 text-primary-700 hover:text-primary-900"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="flex items-center bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-700"
                    >
                      <FaCalendarAlt className="mr-2 text-gray-500" />
                      <span>Select Date</span>
                    </button>
                  )}
                  {showDatePicker && (
                    <div className="absolute top-12 left-0 z-30 bg-white shadow-lg rounded-lg p-2 border border-gray-200">
                      <Calendar
                        selectedDate={filters.date}
                        setSelectedDate={handleDateSelect}
                      />
                    </div>
                  )}
                </div>

                <div className="relative flex-1 min-w-[200px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={filters.searchQuery}
                    onChange={(e) => updateFilter('searchQuery', e.target.value)}
                    className="pl-10 pr-4 py-1.5 w-full border border-gray-300 rounded-lg shadow-sm 
                              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                              text-sm"
                  />
                </div>

                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                >
                  <FaFilter size={14} />
                  <span>More Filters</span>
                  {showAdvancedFilters ? <FiChevronUp /> : <FiChevronDown />}
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="relative pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                    <select
                      value={filters.doctor}
                      onChange={(e) => updateFilter('doctor', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Doctors</option>
                      {doctors.map(doctor => (
                        <option key={doctor} value={doctor}>{doctor}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => updateFilter('type', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Types</option>
                      {appointmentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Table Area */}
      <div className="flex-1 overflow-hidden px-4 md:px-6 bg-gray-50 mb-16">
        <div className="bg-white rounded-xl shadow-sm h-full flex flex-col">
          <div className="overflow-y-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {['MR NO', 'Patient', 'CNIC', 'Date', 'Time', 'Doctor', 'Type', 'Status', 'Actions'].map((head) => (
                    <th
                      key={head}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedAppointments.length > 0 ? (
                  paginatedAppointments.map((appointment) => (
                    <tr
                      key={appointment._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(appointment)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.appointmentMRNO || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.appointmentPatientCNIC || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.appointmentTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.appointmentDoctorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                          {appointment.appointmentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {openStatusDropdownId === appointment._id ? (
                          <select
                            value={appointment.appointmentStatus}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              setOpenStatusDropdownId(null);
                              try {
                                await dispatch(updateAppointment({
                                  appointmentId: appointment._id,
                                  updatedData: { ...appointment, appointmentStatus: newStatus }
                                }));
                                toast.success('Status updated!');
                              } catch (err) {
                                toast.error(err.message || 'Failed to update status.');
                              }
                            }}
                            className="text-sm px-2 py-1 rounded bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            onBlur={() => setOpenStatusDropdownId(null)}
                            autoFocus
                          >
                            <option value="confirm">Confirm</option>
                            <option value="pending">Pending</option>
                          </select>
                        ) : (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenStatusDropdownId(appointment._id);
                            }}
                            className={`px-2.5 py-1 text-xs rounded-full font-medium cursor-pointer ${appointment.appointmentStatus === 'confirm'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                              }`}
                          >
                            {appointment.appointmentStatus}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(appointment);
                            }}
                            className="text-primary-600 hover:text-primary-900"
                            title="Edit"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              generatePDF(appointment);
                            }}
                            className="text-gray-600 hover:text-gray-900"
                            title="Download PDF"
                          >
                            <FaFilePdf className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAppointment(appointment._id);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FaCalendarAlt className="h-12 w-12 mb-4" />
                        <p className="text-lg font-medium">No appointments found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                        <button
                          onClick={resetFilters}
                          className="mt-2 px-4 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm hover:bg-primary-200"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fixed Pagination Footer */}
      <div className="fixed w-full bottom-0 z-10 bg-white border-t border-gray-200 shadow-sm ">
        <div className="sm:px-3 py-4">
          <FilterList
            entriesPerPage={entriesPerPage}
            setEntriesPerPage={setEntriesPerPage}
            entriesPerPageOptions={[5, 10, 20, 50]}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalItems={totalItems}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientAppointment;