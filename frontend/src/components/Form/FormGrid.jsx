// src/components/common/Form/FormGrid.jsx
import React from 'react';
import PropTypes from 'prop-types';

const FormGrid = ({ 
  children, 
  cols = { base: 1, md: 2 }, 
  gap = 6,
  className = ''
}) => (
  <div 
    className={`grid grid-cols-${cols.base} md:grid-cols-${cols.md} gap-${gap} ${className}`}
  >
    {children}
  </div>
);

FormGrid.propTypes = {
  children: PropTypes.node.isRequired,
  cols: PropTypes.shape({
    base: PropTypes.number,
    md: PropTypes.number
  }),
  gap: PropTypes.number,
  className: PropTypes.string
};

export default FormGrid;