import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createDoctor, resetDoctorState, updateDoctorById, fetchDoctorById } from '../../../features/doctor/doctorSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { faGraduationCap, } from "@fortawesome/free-solid-svg-icons";
import { getallDepartments } from "../../../features/department/DepartmentSlice";
import { InputField } from '../../../components/common/FormFields';
import { FormGrid } from '../../../components/common/FormSection';
// import { FormHeader, SectionHeader, ImageUpload, QualificationsList, AgreementUpload, } from "./subcmp";
import {
  FormContainer,
  FormHeader,
  FormSection,
  FileUpload,
  ImageUpload,
  QualificationsList
} from '../../../components/indexCmp';
import { getRoleRoute } from "../../../utils/getRoleRoute";

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const DoctorForm = ({ mode = 'create' }) => {
  const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { doctorId } = useParams();
  const { currentDoctor, status, error } = useSelector(state => state.doctor);
  const { departments } = useSelector(state => state.department);
  const { doctors } = useSelector(state => state.doctor);
  // Initialize form state
  const initialFormState = {
    doctor_Name: '',
    doctor_Email: '',
    doctor_Contact: '',
    doctor_Address: '',
    doctor_Department: '',
    doctor_CNIC: '',
    doctor_Type: '',
    doctor_Specialization: '',
    doctor_Qualifications: [],
    doctor_LicenseNumber: '',
    doctor_Fee: 0,
    doctor_password: '',
    doctor_Contract: {
      doctor_Percentage: 0,
      hospital_Percentage: 0,
      contract_Time: '',
      doctor_JoiningDate: '',
    }
  };

  const [previewImage, setPreviewImage] = useState(null);
  const [agreementPreview, setAgreementPreview] = useState(null);
  const [qualificationInput, setQualificationInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [agreementFile, setAgreementFile] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isEditMode, setIsEditMode] = useState(mode === 'edit');
  const [emailError, setEmailError] = useState(false);

  const handleEmailChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, doctor_Email: value }));
    setEmailError(false);

    if (value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      validateEmail(value);
    }
  };

  useEffect(() => {
    if (isEditMode && doctorId) {
      dispatch(fetchDoctorById(doctorId));
    }
    dispatch(getallDepartments());
  }, [dispatch, doctorId, isEditMode]);

  useEffect(() => {
    if (isEditMode && currentDoctor) {
      setFormData({
        doctor_Name: currentDoctor.user.user_Name || '',
        doctor_Email: currentDoctor.user.user_Email || '',
        doctor_Password: currentDoctor.user.user_Password || '',
        doctor_Contact: currentDoctor.user.user_Contact || '',
        doctor_Address: currentDoctor.user.user_Address || '',
        doctor_Department: currentDoctor.doctor_Department || '',
        doctor_CNIC: currentDoctor.user.user_CNIC || '',
        doctor_Type: currentDoctor.doctor_Type || '',
        doctor_Specialization: currentDoctor.doctor_Specialization || '',
        doctor_Qualifications: currentDoctor.doctor_Qualifications || [],
        doctor_LicenseNumber: currentDoctor.doctor_LicenseNumber || '',
        doctor_Fee: currentDoctor.doctor_Fee || 0,
        doctor_Contract: currentDoctor.doctor_Contract || {
          doctor_Percentage: 0,
          hospital_Percentage: 0,
          contract_Time: '',
          doctor_JoiningDate: '',
        }
      });

      if (currentDoctor.doctor_Image?.filePath) {
        setPreviewImage(
          currentDoctor.doctor_Image?.filePath
            ? `${API_URL}${currentDoctor.doctor_Image.filePath}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentDoctor.doctor_Name || "D")}&background=random`
        )
      }
      if (currentDoctor.doctor_Contract?.doctor_Agreement?.filePath) {
        setAgreementFile(null);
        // Extract filename from path or use a generic label
        const fileName = currentDoctor.doctor_Contract.doctor_Agreement.filePath.split('/').pop() || "Existing Agreement";
        setAgreementPreview(fileName);
      }
      setImageFile(null);
    }

  }, [currentDoctor, isEditMode]);

  // Reset all local state
  const resetLocalForm = () => {
    setFormData(initialFormState);
    setPreviewImage(null);
    setAgreementPreview(null);
    setImageFile(null);
    setAgreementFile(null);
    setQualificationInput("");
  };

  useEffect(() => {
    return () => {
      dispatch(resetDoctorState());
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(getallDepartments());
  }, [dispatch]);

  const handleAddQualification = () => {
    if (qualificationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        doctor_Qualifications: [...prev.doctor_Qualifications, qualificationInput]
      }));
      setQualificationInput('');
    }
  };

  const handleRemoveQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      doctor_Qualifications: prev.doctor_Qualifications.filter((_, i) => i !== index)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("contract_")) {
      const contractField = name.replace('contract_', '');
      setFormData(prev => ({
        ...prev,
        doctor_Contract: {
          ...prev.doctor_Contract,
          [contractField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;

    if (!file) return;

    console.log("Selected file:", file); // Debug log

    // Size validation
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return;
    }

    // Type validation
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const validAgreementTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (name === "doctor_Image") {
      if (!validImageTypes.includes(file.type)) {
        toast.error("Invalid image format. Please upload JPEG, JPG, or PNG");
        return;
      }

      // Create a URL for the file
      const imageUrl = URL.createObjectURL(file);
      console.log("Generated image URL:", imageUrl); // Debug log

      setPreviewImage(imageUrl);
      setImageFile(file);
    }
    else if (name === "doctor_Agreement") {
      if (!validAgreementTypes.includes(file.type)) {
        toast.error("Invalid file format. Please upload PDF, DOC, or DOCX");
        return;
      }
      setAgreementFile(file);
      setAgreementPreview(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');

    // Validate required fields
    if (!formData.doctor_Name.trim()) {
      toast.error("Doctor name is required");
      return;
    }

    if (!/^\d{4}-\d{7}$/.test(formData.doctor_Contact)) {
      toast.error("Contact must be in format 03XX-XXXXXXX");
      return;
    }

    if (!isEditMode && !formData.doctor_password) {
      toast.error("Password is required");
      return;
    }

    // Additional validations
    if (!formData.doctor_Department) {
      toast.error("Department is required");
      return;
    }

    if (!formData.doctor_Type) {
      toast.error("Doctor type is required");
      return;
    }

    if (!formData.doctor_CNIC) {
      toast.error("CNIC is required");
      return;
    }

    if (!formData.doctor_Contract.doctor_JoiningDate) {
      toast.error("Joining date is required");
      return;
    }

    const formToSubmit = new FormData();

    // Append user data
    formToSubmit.append('user_Name', formData.doctor_Name);
    formToSubmit.append('user_Email', formData.doctor_Email || '');
    formToSubmit.append('user_Contact', formData.doctor_Contact);
    formToSubmit.append('user_Address', formData.doctor_Address);
    formToSubmit.append('user_CNIC', formData.doctor_CNIC);
    formToSubmit.append('user_Password', formData.doctor_password);

    // Append doctor data
    formToSubmit.append('doctor_Department', formData.doctor_Department);
    formToSubmit.append('doctor_Type', formData.doctor_Type);
    formToSubmit.append('doctor_Specialization', formData.doctor_Specialization);
    formToSubmit.append('doctor_LicenseNumber', formData.doctor_LicenseNumber);
    formToSubmit.append('doctor_Fee', String(Number(formData.doctor_Fee)));

    // Append qualifications
    formData.doctor_Qualifications.forEach((qual, i) => {
      formToSubmit.append(`doctor_Qualifications[${i}]`, qual);
    });

    formToSubmit.append('doctor_Contract[doctor_Percentage]', String(Number(formData.doctor_Contract.doctor_Percentage)));
    formToSubmit.append('doctor_Contract[hospital_Percentage]', String(Number(formData.doctor_Contract.hospital_Percentage)));
    formToSubmit.append('doctor_Contract[contract_Time]', formData.doctor_Contract.contract_Time);
    formToSubmit.append('doctor_Contract[doctor_JoiningDate]', formData.doctor_Contract.doctor_JoiningDate);

    // Append files
    if (imageFile) formToSubmit.append('doctor_Image', imageFile);
    if (agreementFile) formToSubmit.append('doctor_Agreement', agreementFile);

    try {
      let result;
      if (isEditMode && doctorId) {
        result = await dispatch(updateDoctorById({ doctorId, updatedData: formToSubmit })).unwrap();
        toast.success("Doctor updated successfully!");
      } else {
        result = await dispatch(createDoctor(formToSubmit)).unwrap();
        toast.success("Doctor created successfully!");
        resetLocalForm();
      }

      console.log('Success result:', result);

      // Navigate after success
      setTimeout(() => {
        navigate(getRoleRoute('doctors'));
      }, 1500);

    } catch (err) {
      console.error('Error details:', err);

      if (err.payload?.statusCode === 409) {
        toast.error("This email or CNIC is already registered");
      } else if (err.payload?.errors) {
        // Handle validation errors from backend
        const errorMessages = Object.values(err.payload.errors).flat().join(', ');
        toast.error(errorMessages);
      } else if (err.payload?.message) {
        toast.error(err.payload.message);
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} doctor. Please try again.`);
      }
    }
  };

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;

    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 8) {
      return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4)}`;
    }
    return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4, 11)}`;
  };

  const formatCNIC = (value) => {
    if (!value) return value;
    const cnicNumber = value.replace(/[^\d]/g, '');
    const cnicNumberLength = cnicNumber.length;

    if (cnicNumberLength < 6) return cnicNumber;
    if (cnicNumberLength < 13) {
      return `${cnicNumber.slice(0, 5)}-${cnicNumber.slice(5)}`;
    }
    return `${cnicNumber.slice(0, 5)}-${cnicNumber.slice(5, 12)}-${cnicNumber.slice(12, 13)}`;
  };

  const handlePhoneChange = (e) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    setFormData({
      ...formData,
      doctor_Contact: formattedPhoneNumber
    });
  };

  const handleCNICChange = (e) => {
    const formattedCNIC = formatCNIC(e.target.value);
    setFormData({
      ...formData,
      doctor_CNIC: formattedCNIC
    });
  };

  const handlePercentageChange = (e) => {
    const { name, value } = e.target;

    // Ensure we have a valid number
    const numericValue = value === '' ? 0 : parseFloat(value);

    if (isNaN(numericValue)) {
      toast.error("Please enter a valid number for percentage");
      return;
    }

    const clampedValue = Math.min(100, Math.max(0, numericValue));
    const roundedValue = parseFloat(clampedValue.toFixed(2));

    if (name === "contract_doctor_Percentage") {
      setFormData(prev => ({
        ...prev,
        doctor_Contract: {
          ...prev.doctor_Contract,
          doctor_Percentage: roundedValue,
          hospital_Percentage: parseFloat((100 - roundedValue).toFixed(2))
        }
      }));
    } else if (name === "contract_hospital_Percentage") {
      setFormData(prev => ({
        ...prev,
        doctor_Contract: {
          ...prev.doctor_Contract,
          hospital_Percentage: roundedValue,
          doctor_Percentage: parseFloat((100 - roundedValue).toFixed(2))
        }
      }));
    }
  };

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
      value: formData.doctor_Contract.doctor_Percentage
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
      value: formData.doctor_Contract.hospital_Percentage
    },
    {
      label: "Contract Time",
      name: "contract_contract_Time",
      icon: "clock",
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
      onChange: handleChange
    }
  ];

  const doctorTypes = ["Senior Doctor", "General Doctor", "Specialist Doctor", "Assistant Doctor", "Internee Doctor", "Consultant", "Surgeon", "Resident Doctor"
  ];

  // In your form fields array, update the structure to match InputField props:
  const basicInfoFields = [
    {
      label: "Full Name",
      name: "doctor_Name",
      icon: "user",
      placeholder: "Enter Doctor Name",
      value: formData.doctor_Name,
      onChange: handleChange,
      required: true
    },
    {
      label: "Email Address",
      name: "doctor_Email",
      icon: "envelope",
      placeholder: "Enter Doctor Email (optional)",
      type: "email",
      value: formData.doctor_Email,
      onChange: handleEmailChange,
      className: emailError ? "border-red-500" : ""
    },
    {
      label: "Password",
      name: "doctor_password",
      icon: "lock",
      placeholder: "Enter password",
      type: "password",
      value: formData.doctor_password,
      onChange: handleChange,
      required: !isEditMode // Only required for new doctors
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
      required: true
    },
    {
      label: "CNIC Number",
      name: "doctor_CNIC",
      icon: "idCard",
      placeholder: "XXXXX-XXXXXXX-X",
      value: formData.doctor_CNIC,
      onChange: handleCNICChange,
      maxLength: 15,
      required: true
    },
    {
      label: "Address",
      name: "doctor_Address",
      icon: "mapMarkerAlt",
      placeholder: "Enter Address",
      value: formData.doctor_Address,
      onChange: handleChange,
      required: true
    },
    {
      label: "Department",
      name: "doctor_Department",
      icon: "stethoscope",
      type: "select",
      options: departments.map(dept => dept.name),
      value: formData.doctor_Department,
      onChange: handleChange,
      required: true
    },
    {
      label: "Doctor Type",
      name: "doctor_Type",
      icon: "tableList",
      type: "select",
      options: doctorTypes,
      value: formData.doctor_Type,
      onChange: handleChange,
      required: true
    },
    {
      label: "Specialization",
      name: "doctor_Specialization",
      icon: "userDoctor",
      placeholder: "Enter Specialization",
      value: formData.doctor_Specialization,
      onChange: handleChange,
      required: true
    },
    {
      label: "License Number",
      name: "doctor_LicenseNumber",
      icon: "fileSignature",
      placeholder: "Enter License Number",
      value: formData.doctor_LicenseNumber,
      onChange: handleChange,
      required: true
    },
    {
      label: "Consultation Fee",
      name: "doctor_Fee",
      icon: "moneyBillWave",
      placeholder: "Enter Fee",
      type: "number",
      value: formData.doctor_Fee,
      onChange: handleChange,
      required: true
    }
  ];

  // Form configuration
  const formConfig = {
    title: isEditMode ? "Edit Doctor" : "Doctor Registration",
    description: isEditMode ? "Update the doctor details below" : "Please fill in the doctor details below",
    submitText: isEditMode ? "Update Doctor" : "Register Doctor",
    loadingText: isEditMode ? "Updating..." : "Processing..."
  };

  return (
    <FormContainer>
      <FormHeader
        title={formConfig.title}
        description={formConfig.description}
        bgColor="bg-primary-600"
        textColor="text-white"
      />

      <form className="w-full p-6" onSubmit={handleSubmit}>
        {/* Profile Picture Section */}
        <FormSection title="Profile Picture" showHeader={false}>
          <div className="mb-6">
            <ImageUpload
              previewImage={previewImage}
              handleFileChange={handleFileChange}
              label="Doctor Image"
              // required={!isEditMode}
              helpText="JPG, JPEG, PNG (max 10MB)"
              containerClass="w-48 h-48 mx-auto"
              name="doctor_Image" // Make sure this matches your handleFileChange check
            />
          </div>
        </FormSection>

        {/* Basic Information Section */}
        <FormSection title="Basic Information">
          <FormGrid cols={{ base: 1, md: 2 }} gap={6}>
            {basicInfoFields.map((field, index) => (
              <InputField key={index} {...field} />
            ))}
          </FormGrid>
        </FormSection>

        {/* Qualifications Section */}
        <FormSection title="Qualifications">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faGraduationCap} className="text-primary-600" />
              </div>
              <input
                type="text"
                value={qualificationInput}
                onChange={(e) => setQualificationInput(e.target.value)}
                placeholder="Add Qualification"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAddQualification}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Add
            </button>
          </div>
          <QualificationsList
            items={formData.doctor_Qualifications}
            onRemove={handleRemoveQualification}
          />
        </FormSection>

        {/* Contract Details Section */}
        <FormSection title="Contract Details">
          <FormGrid cols={{ base: 1, md: 2 }} gap={6}>
            {contractFields.map((field, index) => (
              <InputField key={index} {...field} />
            ))}
            <FileUpload
              previewText={agreementPreview}
              handleFileChange={handleFileChange}
              label="Doctor Agreement"
              required={!isEditMode}
              helpText="PDF, DOC, DOCX (max 10MB)"
              name="doctor_Agreement"
              accept=".pdf,.doc,.docx"
            />
          </FormGrid>
        </FormSection>

        {/* Form Actions */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={status === 'loading'}
            className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {formConfig.loadingText}
              </span>
            ) : (
              formConfig.submitText
            )}
          </button>
        </div>
      </form>
    </FormContainer>
  );
};

export default DoctorForm;