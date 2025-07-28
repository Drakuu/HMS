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
    
    const [hours, minutes] = timeValue.split(':').map(Number);
    let period = 'AM';
    let displayHours = hours;
    
    if (hours >= 12) {
      period = 'PM';
      if (hours > 12) displayHours = hours - 12;
    }
    if (hours === 0) displayHours = 12;
    
    const formattedTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    onChange(formattedTime);
  };

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
      <div className={`
        react-time-picker__wrapper
        border border-gray-300 rounded-md
        focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500
        ${disabled ? 'bg-gray-100' : 'bg-white'}
        w-full
      `}>
        <TimePicker
          value={parseTimeForPicker(value)}
          onChange={handleTimeChange}
          disableClock={true}
          clearIcon={null}
          format="h:mm a"
          disabled={disabled}
          className={`
            w-full
            [&_.react-time-picker__inputGroup]:py-2
            [&_.react-time-picker__inputGroup__input]:bg-transparent
            [&_.react-time-picker__inputGroup__input]:text-gray-900
            [&_.react-time-picker__inputGroup__input]:focus:outline-none
            [&_.react-time-picker__button]:text-gray-500
            [&_.react-time-picker__button]:hover:text-gray-700
            ${disabled ? 'text-gray-500' : 'text-gray-900'}
          `}
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