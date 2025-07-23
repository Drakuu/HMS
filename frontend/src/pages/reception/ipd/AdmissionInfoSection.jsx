import React from "react";
import { FormSection, FormGrid } from "../../../components/common/FormSection";
import { InputField } from "../../../components/common/FormFields";

const AdmissionInfoSection = ({ formData, handleChange }) => {
  const fieldConfig = [
    {      name: "admissionDate", label: "Admission Date", type: "date", icon: "calendar", required: true
    },
    {
      name: "admissionType", label: "Admission Type", type: "select", icon: "health", options: ["SSP", "Private"],
      required: true
    },
    {      name: "doctor", label: "Doctor", type: "text", icon: "userMd", placeholder: "Enter Doctor Name",
      required: true
    },
    {      name: "wardNumber", label: "Ward Number", type: "text", icon: "home", placeholder: "Enter Ward Number", required: true
    },
    {      name: "wardType", label: "Ward Type", type: "select", icon: "team", options: ["General", "Private", "ICU", "Emergency", "Other"], required: true
    },
    {      name: "bedNumber", label: "Bed Number", type: "text", icon: "home", placeholder: "Enter Bed Number", required: true
    },
    {      name: "admissionFee", label: "Admission Fee", type: "number", icon: "dollar", placeholder: "Enter Admission Fee", required: true
    },
    {      name: "discount", label: "Discount", type: "number", icon: "discount", placeholder: "Enter Discount", min: "0",
      max: formData.admissionFee || 0
    },
    {      name: "totalFee", label: "Total Fee", type: "text", icon: "dollar", value: formData.totalFee ? `Rs. ${formData.totalFee}` : "Rs. 0", readOnly: true,
      className: "bg-gray-50 font-semibold"
    },
    {      name: "paymentStatus", label: "Payment Status", type: "select", icon: "dollar", options: ["Unpaid", "Partial", "Paid"], value: formData.paymentStatus || "Unpaid"
    }
  ];

  return (
    <FormSection title="Admission Information">
      <FormGrid>
        {fieldConfig.map((field) => (
          <InputField
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type}
            value={field.value || formData[field.name]}
            onChange={handleChange}
            icon={field.icon}
            placeholder={field.placeholder}
            required={field.required}
            options={field.options}
            min={field.min}
            max={field.max}
            readOnly={field.readOnly}
            className={field.className}
          />
        ))}
        {formData.wardType === "Other" && (
          <InputField
            name="customWardType"
            label="Specify Ward Type"
            type="text"
            value={formData.customWardType || ""}
            onChange={handleChange}
            placeholder="Please specify ward type"
            fullWidth
          />
        )}
      </FormGrid>
    </FormSection>
  );
};

export default AdmissionInfoSection;