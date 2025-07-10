// src/components/common/FormSection.js
import React from 'react';

export const FormSection = ({ title, children }) => (
  <div className="mb-8">
    <div className="flex items-center mb-6">
      <div className="h-10 w-1 bg-primary-600 mr-3 rounded-full"></div>
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    </div>
    {children}
  </div>
);

export const FormGrid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {children}
  </div>
);