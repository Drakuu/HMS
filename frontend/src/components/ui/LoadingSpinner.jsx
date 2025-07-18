// src/components/ui/LoadingSpinner.js
import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ fullPage = false, size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-[6px]'
  };
  
  const colorClasses = {
    blue: 'border-t-primary-500 border-b-primary-500 border-l-transparent border-r-transparent',
    gray: 'border-t-gray-500 border-b-gray-500 border-l-transparent border-r-transparent',
    white: 'border-t-white border-b-white border-l-transparent border-r-transparent',
    primary: 'border-t-primary-500 border-b-primary-500 border-l-transparent border-r-transparent'
  };

  return (
    <div 
      className={`flex justify-center items-center ${fullPage ? 'min-h-screen' : 'py-8 w-full'}`}
      aria-label="Loading"
      role="status"
    >
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
      ></div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  fullPage: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.oneOf(['blue', 'gray', 'white', 'primary'])
};

export default LoadingSpinner;