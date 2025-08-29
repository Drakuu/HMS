import React from 'react';
import PropTypes from 'prop-types';

const QualificationsList = ({ 
  items = [], 
  onRemove, 
  containerClass = 'space-y-2',
  itemClass = 'flex items-center justify-between py-2 px-4 rounded-md',
  itemBorder = 'border border-primary-500 border-t-primary-200',
  itemBg = 'bg-gray-50',
  textClass = 'text-gray-800 underline italic font-medium',
  buttonClass = 'px-2 py-1 rounded-md focus:outline-none',
  buttonBg = 'bg-red-500 hover:bg-red-600',
  buttonText = 'text-white',
  buttonTextContent = 'Remove',
  emptyMessage = 'No qualifications added yet',
  emptyMessageClass = 'text-gray-500 italic text-center py-4'
}) => (
  <div className={containerClass}>
    {items.length > 0 ? (
      items.map((item, index) => (
        <div 
          key={index} 
          className={`${itemClass} ${itemBorder} ${itemBg}`}
        >
          <span className={textClass}>{item}</span>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className={`${buttonClass} ${buttonBg} ${buttonText}`}
          >
            {buttonTextContent}
          </button>
        </div>
      ))
    ) : (
      <div className={emptyMessageClass}>{emptyMessage}</div>
    )}
  </div>
);

QualificationsList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string),
  onRemove: PropTypes.func.isRequired,
  containerClass: PropTypes.string,
  itemClass: PropTypes.string,
  itemBorder: PropTypes.string,
  itemBg: PropTypes.string,
  textClass: PropTypes.string,
  buttonClass: PropTypes.string,
  buttonBg: PropTypes.string,
  buttonText: PropTypes.string,
  buttonTextContent: PropTypes.string,
  emptyMessage: PropTypes.string,
  emptyMessageClass: PropTypes.string
};

QualificationsList.defaultProps = {
  items: [],
  buttonTextContent: 'Remove',
  emptyMessage: 'No qualifications added yet'
};

export default QualificationsList;