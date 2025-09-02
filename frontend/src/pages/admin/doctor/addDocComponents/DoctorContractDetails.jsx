import React from 'react';
import { InputField } from '../../../../components/common/FormFields';
import { FormGrid, FormSection } from '../../../../components/common/FormSection';
import FileUpload from '../../../../components/Upload/FileUpload';

const DoctorContractDetails = ({
   formData,
   handleChange,
   handlePercentageChange,
   fieldErrors,
   agreementPreview,
   handleFileChange,
   isEditMode
}) => {
   const contractFields = [
      {
         label: "Doctor Percentage",
         name: "contract_doctor_Percentage",
         icon: "percentage",
         placeholder: "Enter Doctor Percentage",
         type: "number",
         onChange: handlePercentageChange,
         min: 0,
         max: 100,
         step: "0.01",
         value: formData.doctor_Contract.doctor_Percentage,
         required: false
      },
      {
         label: "Hospital Percentage",
         name: "contract_hospital_Percentage",
         icon: "percentage",
         placeholder: "Enter Hospital Percentage",
         type: "number",
         onChange: handlePercentageChange,
         min: 0,
         max: 100,
         step: "0.01",
         value: formData.doctor_Contract.hospital_Percentage,
         required: false
      },
      {
         label: "Contract Time",
         name: "contract_contract_Time",
         icon: "clock",
         required: false,
         placeholder: "Enter Contract Time",
         value: formData.doctor_Contract.contract_Time,
         onChange: handleChange
      },
      {
         label: "Joining Date",
         name: "contract_doctor_JoiningDate",
         icon: "calendarAlt",
         placeholder: "Enter Joining Date",
         type: "date",
         value: formData.doctor_Contract.doctor_JoiningDate,
         onChange: handleChange,
         error: fieldErrors["contract_doctor_JoiningDate"],
         required: false
      }
   ];

   return (
      <FormSection title="Contract Details">
         <FormGrid cols={{ base: 1, md: 2 }} gap={6}>
            {contractFields.map((field, index) => (
               <InputField key={index} {...field} />
            ))}
            <FileUpload
               previewText={agreementPreview}
               handleFileChange={handleFileChange}
               label="Doctor Agreement"
               required={false}
               helpText="PDF, DOC, DOCX (max 10MB)"
               name="doctor_Agreement"
               accept=".pdf,.doc,.docx"
            />
         </FormGrid>
      </FormSection>
   );
};

// Export function to get required contract fields
export const getContractRequiredFields = () => {
   return {
      // "contract_doctor_JoiningDate": "Joining date"
   };
};

export default DoctorContractDetails;