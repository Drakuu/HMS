// src/components/common/Buttons.js
import React from 'react';

export const ButtonGroup = ({ children, className = '' }) => (
  <div className={`flex space-x-4 ${className}`}>
    {children}
  </div>
);

// Enhanced Button component
export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'danger', etc.
  size = 'medium', // 'small', 'medium', 'large'
  icon: Icon,
  isSubmitting = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-md shadow-sm font-medium focus:outline-none focus:ring-1 focus:scale-90 focus:scale-90 focus:ring-offset-2 flex items-center';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 border-primary-600',
    secondary: 'bg-white border text-gray-700 hover:bg-gray-50 focus:ring-gray-500 border-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-red-600',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 border-green-600',
  };
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base',
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isSubmitting}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    >
      {Icon && <Icon className="mr-2" />}
      {children}
    </button>
  );
};