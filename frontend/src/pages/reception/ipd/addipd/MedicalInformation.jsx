// components/MedicalInformation.js
import React from 'react';
import { TextAreaField } from "../../../../components/common/FormFields";

const MedicalInformation = ({ formData, handleChange }) => {
   return (
      <div className="mb-8">
         <div className="flex items-center mb-6">
            <div className="h-10 w-1 bg-primary-600 mr-3 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-800">
               Medical Information
            </h2>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextAreaField
               name="diagnosis"
               label="Diagnosis"
               type="textarea"
               value={formData.diagnosis}
               onChange={handleChange}
               placeholder="Enter Diagnosis"
               fullWidth
               rows={3}
               required
            />
         </div>
      </div>
   );
};

export default MedicalInformation;