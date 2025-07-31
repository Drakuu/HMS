import React, { useEffect } from "react";
import { FormSection, FormGrid } from "../../../components/common/FormSection";
import { InputField } from "../../../components/common/FormFields";
import { useDispatch, useSelector } from "react-redux";
import { getallDepartments } from "../../../features/department/departmentSlice";
import { getwardsbydepartmentId } from "../../../features/ward/Wardslice";

const AdmissionInfoSection = ({ formData, handleChange, isSSPForm }) => {
  const dispatch = useDispatch();
  const { departments, isLoading: deptLoading } = useSelector((state) => state.department);
  const { wardsByDepartment, isLoading: wardLoading } = useSelector((state) => state.ward);
  const selectedWard = wardsByDepartment.find(ward => ward._id === formData.wardId);

  // console.log("All Departments:", departments);
  console.log("Wards by Department:", wardsByDepartment);

  // Fetch all departments on component mount
  useEffect(() => {
    dispatch(getallDepartments());
  }, [dispatch]);

  useEffect(() => {
    // Reset ward selection when department changes
    if (formData.departmentId) {
      dispatch(getwardsbydepartmentId(formData.departmentId));
    }
  }, [formData.departmentId, dispatch]);

  // Get available beds for selected ward (already filtered to only available beds)
  // Update the availableBeds calculation with proper null checks
  const availableBeds = selectedWard?.beds?.length > 0
    ? selectedWard.beds
      .filter(bed => bed && !bed.occupied)
      .map(bed => ({
        value: bed?.bedNumber?.toString()?.trim() || '',
        label: `Bed ${bed?.bedNumber || ''}`,
        className: 'text-green-600'
      }))
    : [];

  // Update the ward options with proper null checks
  const wardOptions = wardsByDepartment?.length > 0
    ? wardsByDepartment.map((ward, index) => ({
      value: ward?._id || `ward-${index}`,
      label: `${ward?.name || ''} (${ward?.department_Name || ''}) - ${ward?.beds?.filter(b => b && !b.occupied)?.length || 0
        }/${ward?.beds?.length || 0} available`
    }))
    : [];

  const fieldConfig = [
    {
      name: "admissionDate",
      label: "Admission Date",
      type: "date",
      icon: "calendar",
      required: true,
    },
    {
      name: "admissionType",
      label: "Admission Type",
      type: "select",
      icon: "health",
      options: ["SSP", "Private"],
      required: true,
      disabled: true,
      value: isSSPForm ? "SSP" : "Private",
    },
    {
      name: "doctor",
      label: "Doctor",
      type: "text",
      icon: "userMd",
      placeholder: "Enter Doctor Name",
      required: true,
    },
    {
      name: "departmentId",
      label: "Department",
      type: "select",
      icon: "hospital",
      options: departments.map((dept) => ({
        value: dept._id,
        label: dept.name,
      })),
      required: true,
      placeholder: "Select Department",
      isLoading: deptLoading
    },
    {
      name: "wardId",
      label: "Ward",
      type: "select",
      icon: "home",
      options: wardOptions,
      required: true,
      disabled: !formData.departmentId || wardLoading,
      placeholder: formData.departmentId ? "Select Ward" : "Please select department first",
      isLoading: wardLoading
    },
    {
      name: "bedNumber",
      label: "Bed Number",
      type: "select",
      icon: "bed",
      options: availableBeds.length > 0
        ? availableBeds
        : [{
          value: "",
          key: "no-beds-option", // Explicit key
          label: formData.wardId ? "No available beds" : "Select ward first",
          disabled: true
        }],
      required: true,
      disabled: !formData.wardId || availableBeds.length === 0,
      placeholder: formData.wardId
        ? availableBeds.length > 0
          ? "Select Bed"
          : "No available beds"
        : "Please select ward first",
    },
    {
      name: "admissionFee",
      label: "Admission Fee",
      type: "number",
      icon: "dollar",
      placeholder: "Enter Admission Fee",
      required: true,
    },
    {
      name: "perDayCharges",
      label: "Per Day Charges",
      type: "number",
      icon: "dollar",
      placeholder: "Enter per day charges",
      min: "0",
    },
    {
      name: "perDayChargesStatus",
      label: "Per Day Charges Status",
      type: "select",
      icon: "dollar",
      options: ["Unpaid", "Partial", "Paid"],
      value: formData.perDayChargesStatus || "Unpaid",
    },
    {
      name: "perDayChargesStartDate",
      label: "Per Day Charges Start Date",
      type: "date",
      icon: "calendar",
      value: formData.perDayChargesStartDate || new Date().toISOString().split('T')[0],
    },
    {
      name: "discount",
      label: "Discount",
      type: "number",
      icon: "discount",
      placeholder: "Enter Discount",
      min: "0",
      max: formData.admissionFee || 0,
    },
    {
      name: "totalFee",
      label: "Total Fee",
      type: "text",
      icon: "dollar",
      value: formData.totalFee ? `Rs. ${formData.totalFee}` : "Rs. 0",
      readOnly: true,
      className: "bg-gray-50 font-semibold",
    },
    {
      name: "paymentStatus",
      label: "Payment Status",
      type: "select",
      icon: "dollar",
      options: ["Unpaid", "Partial", "Paid"],
      value: formData.paymentStatus || "Unpaid",
    },
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
            disabled={field.disabled}
            isLoading={field.isLoading}
          />
        ))}
      </FormGrid>
    </FormSection>
  );
};

export default AdmissionInfoSection;