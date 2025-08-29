// src/components/common/Form/FileUpload.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';

const FileUpload = ({
  id = 'file-upload',
  name = 'file',
  previewText,
  isEditMode = false,
  required = false,
  handleFileChange,
  accept = '.pdf,.doc,.docx',
  uploadText = 'Upload File',
  helpText = 'PDF, DOC, DOCX',
  icon = faFileAlt,
  label = 'File',
  containerClass = '',
  borderClass = 'border-2 border-dashed border-primary-300',
  hoverClass = 'hover:border-primary-500',
  iconSize = 'text-3xl'
}) => (
  <div className={`space-y-1 ${containerClass}`}>
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <label htmlFor={id} className="cursor-pointer">
      <div className={`rounded-md p-4 text-center transition-colors ${borderClass} ${hoverClass}`}>
        {previewText ? (
          <div className="text-primary-800">
            <FontAwesomeIcon icon={icon} className={`${iconSize} mb-2`} />
            <p className="text-sm font-medium">
              {isEditMode ? "Current: " : ""}
              {previewText}
            </p>
            {isEditMode && (
              <p className="text-xs text-gray-500 mt-1">Click to upload new file</p>
            )}
          </div>
        ) : (
          <div className="text-primary-800">
            <FontAwesomeIcon icon={icon} className={`${iconSize} mb-2`} />
            <p className="text-sm font-medium">{uploadText}</p>
            <p className="text-xs text-gray-500">{helpText}</p>
          </div>
        )}
      </div>
    </label>
    <input
      type="file"
      id={id}
      name={name}
      onChange={handleFileChange}
      className="hidden"
      accept={accept}
      required={required}
    />
  </div>
);

FileUpload.propTypes = {
   error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  id: PropTypes.string,
  name: PropTypes.string,
  previewText: PropTypes.string,
  isEditMode: PropTypes.bool,
  required: PropTypes.bool,
  handleFileChange: PropTypes.func.isRequired,
  accept: PropTypes.string,
  uploadText: PropTypes.string,
  helpText: PropTypes.string,
  icon: PropTypes.object,
  label: PropTypes.string,
  containerClass: PropTypes.string,
  borderClass: PropTypes.string,
  hoverClass: PropTypes.string,
  iconSize: PropTypes.string
};

export default FileUpload;