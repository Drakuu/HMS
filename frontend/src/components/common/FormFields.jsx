// src/components/common/FormFields.js
import React, { useState, useRef, useEffect } from 'react';
import {
  AiOutlineUser,
  AiOutlineHome,
  AiOutlineIdcard,
  AiOutlineTeam,
  AiOutlineMan,
  AiOutlineCalendar,
  AiOutlineFieldNumber,
  AiOutlineDollar,
} from "react-icons/ai";
import { FaHeartbeat, FaRing, FaGraduationCap, FaUserMd, FaUserNurse, FaCalendar, FaClock, FaMoneyBillWave, FaNotesMedical, FaUser, FaIdCard, FaSearch, } from "react-icons/fa";
import { GiHealthNormal } from "react-icons/gi";
import { MdWork, MdDiscount } from "react-icons/md";

// Map icon names to actual components
const iconComponents = {
  user: AiOutlineUser,
  home: AiOutlineHome,
  idCard: AiOutlineIdcard,
  team: AiOutlineTeam,
  man: AiOutlineMan,
  calendar: AiOutlineCalendar,
  number: AiOutlineFieldNumber,
  dollar: AiOutlineDollar,
  heartbeat: FaHeartbeat,
  ring: FaRing,
  graduation: FaGraduationCap,
  health: GiHealthNormal,
  work: MdWork,
  discount: MdDiscount,
  userMd: FaUserMd
};

export const InputField = ({
  prefix,
  name,
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  readOnly = false,
  disabled = false,
  max,
  className = "",
  options = [],
  fullWidth = false,
  helperText = "",
}) => {
  const IconComponent = iconComponents[icon];
  const hasPrefix = Boolean(prefix);
  const hasIcon = Boolean(IconComponent);

  // Calculate padding based on what elements are present
  const getInputPadding = () => {
    if (hasPrefix && hasIcon) return 'pl-24'; // Both prefix and icon
    if (hasPrefix) return 'pl-20'; // Only prefix
    if (hasIcon) return 'pl-10'; // Only icon
    return 'pl-3'; // Neither
  };

  if (type === "select") {
    return (
      <div className={`space-y-1 ${fullWidth ? 'md:col-span-2' : ''}`}>
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          {hasPrefix && (
            <span className="absolute left-0 top-0 bottom-0 pl-3 flex items-center text-gray-500 text-sm bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
              {prefix}
            </span>
          )}
          {IconComponent && (
            <div className={`absolute inset-y-0 flex items-center pointer-events-none ${hasPrefix ? 'left-20' : 'left-0 pl-3'
              }`}>
              <IconComponent className="text-primary-600" />
            </div>
          )}
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={`block w-full ${getInputPadding()} pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${hasPrefix ? 'rounded-l-none' : ''
              } ${className}`}
            disabled={disabled}
            required={required}
          >
            <option value="">Select {label}</option>
            // In FormFields.js, update the select options rendering:
            {options.map((option, index) => {
              // Handle both simple strings and object options
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              const optionKey = optionValue || `option-${index}`; // Fallback to index if no value

              return (
                <option key={optionKey} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        </div>
        {helperText && (
          <p className="mt-1 text-xs text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${fullWidth ? 'md:col-span-2' : ''}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex rounded-md shadow-sm">
        {hasPrefix && (
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            {prefix}
          </span>
        )}
        <div className="relative flex-1">
          {IconComponent && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconComponent className="text-primary-600" />
            </div>
          )}
          <input
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            max={max}
            disabled={disabled}
            className={`block w-full ${hasPrefix ? 'rounded-l-none' : ''} ${IconComponent ? 'pl-10' : 'pl-3'
              } pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${className}`}
            placeholder={placeholder}
            required={required}
            readOnly={readOnly}
          />
        </div>
      </div>
      {helperText && (
        <p className="mt-1 text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export const RadioGroup = ({
  name,
  label,
  options,
  value,
  onChange,
  className = ""
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-4">
        {options.map(option => (
          <label key={option.value} className="flex items-center gap-2">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="w-6 h-6 text-primary-600 checked-primary-400 border-gray-300"
            />
            <span className="text-sm text-gray-700 flex items-center">
              {option.icon && <option.icon className="mr-1" />}
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export const MultiSelectField = ({
  name,
  label,
  value = [],
  onChange,
  options,
  placeholder = "Select options",
  required = false,
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const safeValue = Array.isArray(value) ? value : [];

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue) => {
    const newValue = safeValue.includes(optionValue)
      ? safeValue.filter(v => v !== optionValue)
      : [...safeValue, optionValue];

    onChange({
      target: {
        name,
        value: newValue
      }
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative space-y-1 ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Custom dropdown trigger */}
      <div
        onClick={handleToggle}
        className={`flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer ${disabled ? 'bg-gray-100' : 'bg-white hover:border-gray-400'
          }`}
      >
        <span className="truncate">
          {safeValue.length > 0
            ? `${safeValue.length} selected`
            : placeholder}
        </span>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''
            }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 border border-gray-300 max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`px-4 py-2 cursor-pointer hover:bg-primary-50 ${safeValue.includes(option.value) ? 'bg-primary-100' : ''
                }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  readOnly
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded mr-2"
                />
                <span>{option.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected items display below the dropdown */}
      {safeValue.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {safeValue.map((val) => {
            const option = options.find(opt => opt.value === val);
            return (
              <span
                key={val}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                {option?.label || val}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({
                      target: {
                        name,
                        value: value.filter(v => v !== val)
                      }
                    });
                  }}
                  className="ml-1.5 inline-flex text-primary-400 hover:text-primary-600"
                >
                  <span className="sr-only">Remove</span>
                  <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                  </svg>
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

// In FormFields.js
export const TextAreaField = ({
  name,
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
  helperText,
  rows = 3,
  className = ""
}) => {
  const textareaRef = useRef(null);
  const handleInput = (e) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // reset height
      textarea.style.height = textarea.scrollHeight + 'px'; // set to scrollHeight
    }
    onChange(e); // pass event up
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={handleInput}
        rows={rows}
        ref={textareaRef}
        className="w-full px-3 py-2 resize-none max-h-96 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        placeholder={placeholder}
        required={required}
      />
      {helperText && (
        <p className="mt-1 text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

// Add to FormFields.js
export const Checkbox = ({
  name,
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
  helperText = ""
}) => {
  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor={name} className="text-sm font-medium text-gray-700 cursor-pointer">
          {label}
        </label>
        {helperText && (
          <p className="mt-1 text-xs text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    </div>
  );
};