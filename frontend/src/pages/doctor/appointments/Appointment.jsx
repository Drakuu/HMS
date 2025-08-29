import React, { useState } from 'react';
import { FaCalendarAlt, FaSearch, FaFilter, FaUserMd, FaClock, FaPlus } from 'react-icons/fa';
import { MdPendingActions, MdCheckCircle, MdCancel } from 'react-icons/md';

const Appointment = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample appointment data
  const appointments = [
    {
      id: 1,
      patientName: 'Ali Khan',
      doctorName: 'Dr. Sarah Ahmed',
      date: '2023-06-15',
      time: '10:00 AM',
      status: 'confirmed',
      reason: 'Routine Checkup'
    },
    {
      id: 2,
      patientName: 'Fatima Noor',
      doctorName: 'Dr. Rias Khan',
      date: '2023-06-16',
      time: '02:30 PM',
      status: 'pending',
      reason: 'Follow-up Visit'
    },
    {
      id: 3,
      patientName: 'Ahmed Raza',
      doctorName: 'Dr. Sarah Ahmed',
      date: '2023-06-17',
      time: '11:15 AM',
      status: 'cancelled',
      reason: 'Consultation'
    },
  ];

  // Filter appointments based on tab and search term
  const filteredAppointments = appointments.filter(appointment => {
    const matchesTab = 
      (activeTab === 'upcoming' && appointment.status !== 'cancelled') ||
      (activeTab === 'pending' && appointment.status === 'pending') ||
      (activeTab === 'completed' && appointment.status === 'confirmed') ||
      (activeTab === 'cancelled' && appointment.status === 'cancelled');
    
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirmed':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
          <MdCheckCircle className="mr-1" /> Confirmed
        </span>;
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
          <MdPendingActions className="mr-1" /> Pending
        </span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center">
          <MdCancel className="mr-1" /> Cancelled
        </span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Unknown</span>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold flex items-center">
            <FaCalendarAlt className="mr-2 text-primary-600" />
            Appointment Management
          </h1>
          <p className="text-gray-600">View and manage patient appointments</p>
        </div>
        
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center">
          <FaPlus className="mr-2" />
          New Appointment
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search appointments..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="text-gray-400" />
            </div>
            <select
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Doctors</option>
              <option value="dr_sarah">Dr. Sarah Ahmed</option>
              <option value="dr_rias">Dr. Rias Khan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'upcoming' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'pending' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'completed' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'cancelled' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Cancelled
          </button>
        </nav>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredAppointments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map(appointment => (
              <div key={appointment.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-3 md:mb-0">
                    <div className="flex items-center">
                      <div className="bg-primary-100 p-2 rounded-full mr-3">
                        <FaUserMd className="text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                        <p className="text-sm text-gray-500">{appointment.doctorName}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end">
                    <div className="flex items-center mb-2">
                      <FaCalendarAlt className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">
                        {new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">{appointment.time}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-sm text-gray-600">Reason: {appointment.reason}</span>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    {getStatusBadge(appointment.status)}
                  </div>
                </div>
                
                <div className="mt-3 flex space-x-2">
                  <button className="text-sm text-primary-600 hover:text-primary-800 px-3 py-1 border border-primary-300 rounded-md">
                    View Details
                  </button>
                  {appointment.status === 'pending' && (
                    <>
                      <button className="text-sm text-green-600 hover:text-green-800 px-3 py-1 border border-green-300 rounded-md">
                        Confirm
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-300 rounded-md">
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <FaCalendarAlt className="mx-auto text-4xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try a different search term' : 'There are no appointments in this category'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointment;