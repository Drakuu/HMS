import React from 'react';
import PropTypes from 'prop-types';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

const TimePickerField = ({ 
  name,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = 'Select time',
  className = ''
}) => {
  const handleTimeChange = (timeValue) => {
    if (!timeValue) {
      onChange('');
      return;
    }
    
    // The timeValue comes as a string in "HH:mm" format from react-time-picker
    // We need to convert it to our desired "h:mm AM/PM" format
    const [hours, minutes] = timeValue.split(':').map(Number);
    let period = 'AM';
    let displayHours = hours;
    
    if (hours >= 12) {
      period = 'PM';
      if (hours > 12) displayHours = hours - 12;
    }
    if (hours === 0) displayHours = 12; // Handle midnight
    
    const formattedTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    onChange(formattedTime);
  };

  // Convert our stored "h:mm AM/PM" format to "HH:mm" for the TimePicker
  const parseTimeForPicker = (timeStr) => {
    if (!timeStr) return null;
    
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="react-time-picker__wrapper">
        <TimePicker
          value={parseTimeForPicker(value)}
          onChange={handleTimeChange}
          disableClock={true}
          clearIcon={null}
          format="h:mm a"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

TimePickerField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

export default TimePickerField;