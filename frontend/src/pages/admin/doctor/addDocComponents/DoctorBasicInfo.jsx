import React from 'react';
import { InputField } from '../../../../components/common/FormFields';
import { FormGrid, FormSection } from '../../../../components/common/FormSection';

const DoctorBasicInfo = ({
   formData,
   handleChange,
   handleEmailChange,
   handlePhoneChange,
   handleCNICChange,
   fieldErrors,
   departments,
   doctorTypes,
   isEditMode
}) => {
   const basicInfoFields = [
      {
         label: "Full Name",
         name: "doctor_Name",
         icon: "user",
         placeholder: "Enter Doctor Name",
         value: formData.doctor_Name,
         onChange: handleChange,
         required: true,
         error: fieldErrors.doctor_Name
      },
      {
         label: "Email Address",
         name: "doctor_Email",
         icon: "envelope",
         placeholder: "Enter Doctor Email (optional)",
         type: "email",
         value: formData.doctor_Email,
         onChange: handleEmailChange,
         className: fieldErrors.doctor_Email ? "border-red-500" : "",
         error: fieldErrors.doctor_Email,
         required: false
      },
      {
         label: "Password",
         name: "doctor_password",
         icon: "lock",
         placeholder: "Enter password",
         type: "password",
         value: formData.doctor_password,
         onChange: handleChange,
         required: !isEditMode,
         error: fieldErrors.doctor_password
      },
      {
         label: "Contact Number",
         name: "doctor_Contact",
         icon: "phone",
         placeholder: "03XX-XXXXXXX",
         type: "tel",
         value: formData.doctor_Contact,
         onChange: handlePhoneChange,
         maxLength: 12,
         required: true,
         error: fieldErrors.doctor_Contact
      },
      {
         label: "CNIC Number",
         name: "doctor_CNIC",
         icon: "idCard",
         placeholder: "XXXXX-XXXXXXX-X",
         value: formData.doctor_CNIC,
         onChange: handleCNICChange,
         maxLength: 15,
         required: true,
         error: fieldErrors.doctor_CNIC
      },
      {
         label: "Address",
         name: "doctor_Address",
         icon: "mapMarkerAlt",
         placeholder: "Enter Address",
         value: formData.doctor_Address,
         onChange: handleChange,
         required: false,
         error: fieldErrors.doctor_Address
      },
      {
         label: "Department",
         name: "doctor_Department",
         icon: "stethoscope",
         type: "select",
         options: departments.map(dept => dept.name),
         value: formData.doctor_Department,
         onChange: handleChange,
         required: false,
         error: fieldErrors.doctor_Department
      },
      {
         label: "Doctor Type",
         name: "doctor_Type",
         icon: "tableList",
         type: "select",
         options: doctorTypes,
         value: formData.doctor_Type,
         onChange: handleChange,
         required: false,
         error: fieldErrors.doctor_Type
      },
      {
         label: "Specialization",
         name: "doctor_Specialization",
         icon: "userDoctor",
         placeholder: "Enter Specialization",
         value: formData.doctor_Specialization,
         onChange: handleChange,
         required: false,
         error: fieldErrors.doctor_Specialization
      },
      {
         label: "License Number",
         name: "doctor_LicenseNumber",
         icon: "fileSignature",
         placeholder: "Enter License Number",
         value: formData.doctor_LicenseNumber,
         onChange: handleChange,
         required: false,
         error: fieldErrors.doctor_LicenseNumber
      },
      {
         label: "Consultation Fee",
         name: "doctor_Fee",
         icon: "moneyBillWave",
         placeholder: "Enter Fee",
         type: "number",
         value: formData.doctor_Fee,
         onChange: handleChange,
         required: false
      }
   ];

   // Extract required fields for validation
   const requiredFields = {};
   basicInfoFields.forEach(field => {
      if (field.required) {
         const fieldNames = {
            doctor_Name: "Doctor name",
            doctor_Contact: "Contact number",
            doctor_CNIC: "CNIC",
            doctor_Address: "Address",
            doctor_Department: "Department",
            doctor_Type: "Doctor type",
            doctor_Specialization: "Specialization",
            doctor_LicenseNumber: "License number",
            doctor_password: "Password"
         };
         requiredFields[field.name] = fieldNames[field.name];
      }
   });

   return (
      <FormSection title="Basic Information">
         <FormGrid cols={{ base: 1, md: 2 }} gap={6}>
            {basicInfoFields.map((field, index) => (
               <InputField key={index} {...field} />
            ))}
         </FormGrid>
      </FormSection>
   );
};

// Export the component and a function to get required fields
export default DoctorBasicInfo;
export const getBasicInfoRequiredFields = (isEditMode) => {
   return {
      doctor_Name: "Doctor name",
      doctor_Contact: "Contact number",
      doctor_CNIC: "CNIC",
      ...(isEditMode ? {} : { doctor_password: "Password" })
   };
};