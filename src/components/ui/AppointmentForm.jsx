import React, { useState } from 'react';
import { FaCalendarAlt, FaUser, FaIdCard, FaNotesMedical, FaStethoscope, FaClock } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AppointmentForm = ({ formData, setFormData, handleInputChange, handleSubmit, setShowAddForm, editMode }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  
  const setCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    setFormData({
      ...formData,
      appointmentTime: currentTime
    });
  };

  const handleDateChange = (date) => {
    if (date) {
      const isoString = date.toISOString().slice(0, 10);
      setFormData({
        ...formData,
        appointmentDate: isoString
      });
    }
    setShowCalendar(false);
  };

  const handleTodayClick = () => {
    const today = new Date().toISOString().slice(0, 10);
    setFormData({
      ...formData,
      appointmentDate: today
    });
    setShowCalendar(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <FaCalendarAlt className="mr-3 text-primary-600" />
          {editMode ? 'Edit Appointment' : 'New Appointment'}
        </h2>
        <button 
          onClick={() => setShowAddForm(false)} 
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <FiX size={24} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Name */}
          <div className="space-y-1">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FaUser className="mr-2 text-primary-500" />
              Patient Name
            </label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="Full name"
              required
            />
          </div>
          
          {/* CNIC */}
          {/* CNIC */}
          <div className="space-y-1">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FaIdCard className="mr-2 text-primary-500" />
              CNIC (without dashes)
            </label>
            <input
              type="text"
              name="appointmentPatientCNIC"  // Changed from 'cnic' to match backend
              value={formData.appointmentPatientCNIC}
              onChange={handleInputChange}
              pattern="[0-9]{13}"
              maxLength="13"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="1234512345678"
              required
            />
          </div>
          
          {/* Appointment Date */}
          <div className="space-y-1 relative">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FaCalendarAlt className="mr-2 text-primary-500" />
              Appointment Date
            </label>
            <div className="relative">
              <input
                type="text"
                name="appointmentDate"
                value={formData.appointmentDate}
                onClick={() => setShowCalendar(!showCalendar)}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer"
                required
                readOnly
              />
              {showCalendar && (
                <div className="absolute z-10 mt-1 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                  <DatePicker
                    inline
                    selected={formData.appointmentDate ? new Date(formData.appointmentDate) : null}
                    onChange={handleDateChange}
                    dateFormat="yyyy-MM-dd"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    scrollableYearDropdown
                    yearDropdownItemNumber={20}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleTodayClick}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Today
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Appointment Time */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FaClock className="mr-2 text-primary-500" />
                Appointment Time
              </label>
              <button
                type="button"
                onClick={setCurrentTime}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
              >
                Set to Now
              </button>
            </div>
            <input
              type="time"
              name="appointmentTime"
              value={formData.appointmentTime}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              required
            />
          </div>
          
          {/* Doctor */}
          <div className="space-y-1">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FaStethoscope className="mr-2 text-primary-500" />
              Doctor
            </label>
            <select
              name="appointmentDoctorName"
              value={formData.appointmentDoctorName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              required
            >
              <option value="">Select Doctor</option>
              <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
              <option value="Dr. Michael Chen">Dr. Michael Chen</option>
              <option value="Dr. Emily Wilson">Dr. Emily Wilson</option>
            </select>
          </div>
          
          {/* Appointment Type */}
          <div className="space-y-1">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FaNotesMedical className="mr-2 text-primary-500" />
              Appointment Type
            </label>
            <select
              name="appointmentType"
              value={formData.appointmentType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              required
            >
              <option value="">Select Type</option>
              <option value="General Checkup">General Checkup</option>
              <option value="Follow up">Follow up</option>
              <option value="Consultation">Consultation</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
          
          {/* Status */}
          <div className="space-y-1">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Status
            </label>
            <select
              name="appointmentStatus"
              value={formData.appointmentStatus}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              required
            >
              <option value="pending">Pending</option>
              <option value="confirm">Confirmed</option>
            </select>
          </div>
          
          {/* Notes */}
          <div className="md:col-span-2 space-y-1">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Additional Notes
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="Any special requirements or notes"
              rows="3"
            />
          </div>
          
          {/* Submit Button */}
          <div className="md:col-span-2 pt-4">
            <button 
              type="submit" 
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {editMode ? 'Update Appointment' : 'Schedule Appointment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;