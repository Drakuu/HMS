// src/components/common/Form/FormHeader.jsx
import React from 'react';
import PropTypes from 'prop-types';

const FormHeader = ({ 
  title, 
  description, 
  bgColor = 'bg-primary-600', 
  textColor = 'text-white',
  lineColor = 'bg-primary-300',
  size = 'lg' // 'sm' | 'md' | 'lg'
}) => {
  const sizes = {
    sm: { heading: 'text-xl', line: 'h-8 w-1', spacing: 'px-4 py-4' },
    md: { heading: 'text-2xl', line: 'h-10 w-1', spacing: 'px-5 py-6' },
    lg: { heading: 'text-3xl', line: 'h-12 w-1', spacing: 'px-6 py-8' }
  };

  return (
    <div className={`${bgColor} rounded-t-md ${textColor} ${sizes[size].spacing} shadow-md`}>
      <div className="flex items-center">
        <div className={`${sizes[size].line} ${lineColor} mr-4 rounded-full`} />
        <div>
          <h1 className={`${sizes[size].heading} font-bold`}>{title}</h1>
          {description && <p className="text-primary-100 mt-1">{description}</p>}
        </div>
      </div>
    </div>
  );
};

FormHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  bgColor: PropTypes.string,
  textColor: PropTypes.string,
  lineColor: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

export default FormHeader;