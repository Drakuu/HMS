// components/staff/StaffForm.js
import React from 'react';
import { FormSection, FormGrid } from '../../../../components/common/FormSection';
import { InputField, RadioGroup, MultiSelectField, TextAreaField } from '../../../../components/common/FormFields';

const StaffForm = ({ formData, handleChange, handleNestedChange, departments }) => {
  const staffTypes = ["Doctor", "Nurse", "Lab Technician", "Receptionist", "Cleaning Staff", "Administrative"];
  const cities = ["Lahore", "Karachi", "Islamabad"];
  const shifts = ['Morning', 'Evening', 'Night', 'Rotational'];

  return (
    <>
      <FormSection title="Personal Information">
        <FormGrid>
          <InputField
            name="firstName"
            label="First Name"
            icon="user"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <InputField
            name="lastName"
            label="Last Name"
            icon="user"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <InputField
            name="phone"
            label="Phone Number"
            icon="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <InputField
            name="email"
            label="Email"
            icon="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            name="cnic"
            label="CNIC"
            icon="idCard"
            value={formData.cnic}
            onChange={handleChange}
          />
          <RadioGroup
            name="gender"
            label="Gender"
            value={formData.gender}
            onChange={handleChange}
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' }
            ]}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Professional Information">
        <FormGrid>
          <InputField
            name="designation"
            label="Designation"
            icon="work"
            value={formData.designation}
            onChange={handleChange}
          />
          <InputField
            type="select"
            name="department"
            label="Department"
            icon="team"
            value={formData.department}
            onChange={handleChange}
            options={departments.map(dept => dept.name)}
            required
          />
          <InputField
            type="select"
            name="staffType"
            label="Staff Type"
            icon="userMd"
            value={formData.staffType}
            onChange={handleChange}
            options={staffTypes}
            required
          />
          <InputField
            type="select"
            name="city"
            label="City"
            icon="mapMarker"
            value={formData.city}
            onChange={handleChange}
            options={cities}
          />
          <InputField
            name="qualification"
            label="Qualification"
            icon="graduation"
            value={formData.qualification}
            onChange={handleChange}
          />
          <InputField
            type="select"
            name="shift"
            label="Shift"
            icon="clock"
            value={formData.shift}
            onChange={handleChange}
            options={shifts}
          />
        </FormGrid>
      </FormSection>

      {/* Conditional Fields Based on Staff Type */}
      {formData.staffType === 'Doctor' && (
        <FormSection title="Doctor Details">
          <FormGrid>
            <InputField
              name="specialization"
              label="Specialization"
              icon="health"
              value={formData.doctorDetails?.specialization || ''}
              onChange={(e) => handleNestedChange('doctorDetails', 'specialization', e.target.value)}
              required
            />
            <InputField
              name="licenseNumber"
              label="License Number"
              icon="idCard"
              value={formData.doctorDetails?.licenseNumber || ''}
              onChange={(e) => handleNestedChange('doctorDetails', 'licenseNumber', e.target.value)}
              required
            />
            {/* Add more doctor-specific fields */}
          </FormGrid>
        </FormSection>
      )}

      {/* Similar sections for other staff types */}
    </>
  );
};

export default StaffForm;