// src/components/common/Form/ImageUpload.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImage } from '@fortawesome/free-solid-svg-icons';

// ImageUpload.jsx updates
const ImageUpload = ({
  id = 'image-upload',
  name = 'image',
  previewImage,
  required = false,
  handleFileChange,
  accept = 'image/*',
  uploadText = 'Upload Image',
  helpText = 'JPG, JPEG, PNG',
  containerClass = 'w-48 h-48',
  borderClass = 'border-4 border-dashed border-primary-300',
  hoverClass = 'hover:border-primary-500',
  iconSize = 'text-5xl',
  label = '',
  labelClass = '',
  error = false
}) => {
  return (
    <div className="flex flex-col items-center">
      {label && (
        <label className={`block text-sm font-medium ${error ? 'text-red-600' : 'text-gray-700'} ${labelClass}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <label htmlFor={id} className={`cursor-pointer mt-1 w-full flex flex-col items-center ${error ? 'border-red-500' : ''}`}>
        <div className={`rounded-lg flex items-center justify-center transition-colors ${containerClass} ${borderClass} ${hoverClass} ${error ? 'border-red-500' : ''}`}>
          {previewImage ? (
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-full rounded-lg object-cover"
                onError={(e) => {
                  console.error("Image failed to load", e);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className={`text-center p-4 ${error ? 'text-red-600' : 'text-primary-800'}`}>
              <FontAwesomeIcon icon={faFileImage} className={`${iconSize} mb-2`} />
              <p className="text-sm font-medium">{uploadText}</p>
              <span className="text-xs">{helpText}</span>
            </div>
          )}
        </div>
      </label>
      <input
        type="file"
        id={id}
        name={name}
        className="hidden"
        onChange={handleFileChange}
        accept={accept}
        required={required}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {typeof error === 'string' ? error : 'This field is required'}
        </p>
      )}
    </div>
  );
};

ImageUpload.propTypes = {
    error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  id: PropTypes.string,
  name: PropTypes.string,
  previewImage: PropTypes.string,
  required: PropTypes.bool,
  handleFileChange: PropTypes.func.isRequired,
  accept: PropTypes.string,
  uploadText: PropTypes.string,
  helpText: PropTypes.string,
  containerClass: PropTypes.string,
  borderClass: PropTypes.string,
  hoverClass: PropTypes.string,
  iconSize: PropTypes.string,
  label: PropTypes.string,
  labelClass: PropTypes.string
};

export default ImageUpload;