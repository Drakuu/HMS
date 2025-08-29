import React from 'react';
import PropTypes from 'prop-types';
import { FaCalendarAlt } from 'react-icons/fa';

// DatePickerField.jsx
const DatePickerField = ({ 
  name,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = 'Select date',
  className = ''
}) => {
  const handleChange = (e) => {
    const dateValue = e.target.value;
    // Pass the raw date string (YYYY-MM-DD) to the parent
    onChange(dateValue);
  };

  // Format the date for display (YYYY-MM-DD)
  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    
    try {
      // If it's already in YYYY-MM-DD format, return as-is
      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
      }
      
      // Handle Date objects or other formats
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Date formatting error:', e);
      return '';
    }
  };

  const formattedValue = formatDate(value);

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="date"
          name={name}
          value={formattedValue}
          onChange={handleChange}
          className={`w-full p-2 pl-10 border rounded-md ${disabled ? 'bg-gray-100' : 'bg-white'}`}
          placeholder={placeholder}
          disabled={disabled}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FaCalendarAlt className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

DatePickerField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
    PropTypes.number // timestamp
  ]),
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

export default DatePickerField;