import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAppointments,
  selectDeletedAppointments,
  restoreAppointment
} from '../../features/appointments/appointmentSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiTrash2, FiArchive } from 'react-icons/fi';

const DeletedAppointmentsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const deletedAppointments = useSelector(selectDeletedAppointments);
  const status = useSelector((state) => state.appointments.status);
  const error = useSelector((state) => state.appointments.error);

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const handleRestoreAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to restore this appointment?')) {
      try {
        await dispatch(restoreAppointment(appointmentId));
        toast.success('Appointment restored successfully!');
      } catch (error) {
        toast.error('Error restoring appointment!');
      }
    }
  };

  if (status === 'failed') {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg max-w-md mx-auto mt-8">
        Error: {error || 'Could not fetch appointments.'}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-primary-600 hover:text-primary-800 mb-4 transition-colors hover:underline"
          >
            <FiArrowLeft className="mr-2" />
            Back to Appointments
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <FiArchive className="text-red-600 text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Deleted Appointments</h1>
                <p className="text-sm text-gray-500">
                  {deletedAppointments.length} {deletedAppointments.length === 1 ? 'record' : 'records'} in trash
                </p>
              </div>
            </div>

            <button
              onClick={() => dispatch(fetchAppointments())}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm 
                text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['MR NO', 'Patient', 'Date', 'Doctor', 'Type', 'Status', 'Actions'].map((head) => (
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
                {deletedAppointments.length > 0 ? (
                  deletedAppointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.appointmentMRNO || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                        <div className="text-sm text-gray-500">{appointment.appointmentTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
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
                        <span
                          className={`px-2.5 py-1 text-xs rounded-full font-medium ${appointment.appointmentStatus === 'confirm'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                          {appointment.appointmentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleRestoreAppointment(appointment._id)}
                            className="text-green-600 hover:text-green-800 flex items-center"
                            title="Restore"
                          >
                            <FiRefreshCw className="mr-1" />
                            Restore
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FiTrash2 className="h-12 w-12 mb-4" />
                        <p className="text-lg font-medium">No deleted appointments found</p>
                        <p className="text-sm mt-1">Deleted appointments will appear here</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletedAppointmentsPage;
