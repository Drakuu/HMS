import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomCalendar = ({ selectedDate, setSelectedDate }) => {
  const handleTodayClick = () => {
    const today = new Date().toISOString().slice(0, 10);
    setSelectedDate(today);
  };

  return (
    <div>
      <DatePicker
        inline
        selected={selectedDate ? new Date(selectedDate) : null}
        onChange={(date) => {
          if (date) {
            const isoString = date.toISOString().slice(0, 10);
            setSelectedDate(isoString);
          } else {
            setSelectedDate(null);
          }
        }}
        dateFormat="yyyy-MM-dd"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        scrollableYearDropdown
        yearDropdownItemNumber={20}
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={handleTodayClick}
          className="bg-primary-500 text-white px-3 py-1 rounded text-sm hover:bg-primary-600"
        >
          Today
        </button>
      </div>
    </div>
  );
};

export default CustomCalendar;
