// src/components/common/Form/FormContainer.jsx
import React from 'react';
import PropTypes from 'prop-types';

const FormContainer = ({ 
  children, 
  shadow = 'shadow-md',
  rounded = 'rounded-xl',
  bg = 'bg-white',
  className = ''
}) => (
  <div className={`${bg} ${rounded} ${shadow} overflow-hidden ${className}`}>
    {children}
  </div>
);

FormContainer.propTypes = {
  children: PropTypes.node.isRequired,
  shadow: PropTypes.string,
  rounded: PropTypes.string,
  bg: PropTypes.string,
  className: PropTypes.string
};

export default FormContainer;