import React, { useState } from 'react';
import { FaCalendarAlt, FaRedo } from 'react-icons/fa';

const DateRangePicker = ({
  initialStartDate = new Date(),
  initialEndDate = new Date(),
  onDateRangeChange,
  showQuickOptions = true,
  className = '',
}) => {
  // Format for date inputs (YYYY-MM-DD)
  const formatForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize state with Date objects
  const [dateRange, setDateRange] = useState({
    start: new Date(initialStartDate),
    end: new Date(initialEndDate)
  });

  // Handle date changes
  const handleDateChange = (type, value) => {
    const newDate = value ? new Date(value) : new Date();
    const newRange = {
      ...dateRange,
      [type]: newDate
    };

    // Ensure end date is not before start date
    if (type === 'start' && newDate > dateRange.end) {
      newRange.end = newDate;
    } else if (type === 'end' && newDate < dateRange.start) {
      newRange.start = newDate;
    }

    setDateRange(newRange);
    onDateRangeChange?.(newRange);
  };

  // Quick selection handlers
  const quickSelect = (range) => {
    const today = new Date();
    let start, end;

    switch (range) {
      case 'today':
        start = end = today;
        break;
      case 'week':
        start = new Date(today);
        start.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        end = new Date(today);
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today);
        break;
      default:
        start = end = today;
    }

    const newRange = {
      start: start,
      end: end
    };

    setDateRange(newRange);
    onDateRangeChange?.(newRange);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Start Date */}
        <div className="relative bg-white text-gray-700 rounded-md flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaCalendarAlt className="text-gray-400" />
          </div>
          <input
            type="date"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={formatForInput(dateRange.start)}
            onChange={(e) => handleDateChange('start', e.target.value)}
            max={formatForInput(dateRange.end)}
          />
        </div>

        {/* End Date */}
        <div className="relative bg-white text-gray-700 rounded-md flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaCalendarAlt className="text-gray-400" />
          </div>
          <input
            type="date"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={formatForInput(dateRange.end)}
            onChange={(e) => handleDateChange('end', e.target.value)}
            min={formatForInput(dateRange.start)}
          />
        </div>

        {/* Reset Button */}
        <button
          onClick={() => quickSelect('today')}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-1"
          title="Reset to today"
        >
          <FaRedo className="text-gray-500" />
        </button>
      </div>

      {/* Quick Options */}
      {showQuickOptions && (
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => quickSelect('today')}
            className="text-xs px-2 py-1 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Today
          </button>
          <button
            onClick={() => quickSelect('week')}
            className="text-xs px-2 py-1 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            This Week
          </button>
          <button
            onClick={() => quickSelect('month')}
            className="text-xs px-2 py-1 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            This Month
          </button>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;