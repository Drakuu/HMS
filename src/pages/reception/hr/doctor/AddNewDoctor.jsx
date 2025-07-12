import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createDoctor, resetDoctorState, updateDoctorById, fetchDoctorById } from '../../../../features/doctor/doctorSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  faUser, faEnvelope, faPhone, faMapMarkerAlt, faStethoscope,
  faGraduationCap, faIdCard, faPercentage, faCalendarAlt,
  faFileContract, faMoneyBillWave, faClock, faFileImage,
  faTableList, faUserDoctor, faFileSignature
} from "@fortawesome/free-solid-svg-icons";
import { getallDepartments } from "../../../../features/department/DepartmentSlice";
import { InputField } from '../../../../components/common/FormFields';

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

  // const validateEmail = (email) => {
  //   if (!email) {
  //     setEmailError(true);
  //     toast.error("Email is required");
  //     return false;
  //   }

  //   // Basic email format validation
  //   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  //     setEmailError(true);
  //     toast.error("Please enter a valid email address");
  //     return false;
  //   }

  //   // Check against existing doctors in Redux store
  //   const emailExists = doctors.some(doctor => {
  //     return isEditMode
  //       ? doctor.doctor_Email === email && doctor._id !== doctorId
  //       : doctor.doctor_Email === email;
  //   });

  //   if (emailExists) {
  //     setEmailError(true);
  //     toast.error("Email already exists in our records");
  //     return false;
  //   }

  //   setEmailError(false);
  //   return true;
  // };

  const handleEmailChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, doctor_Email: value }));
    setEmailError(false); // Reset error state on change

    // Only validate if email is not empty and has proper format
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
        doctor_Name: currentDoctor.doctor_Name || '',
        doctor_Email: currentDoctor.doctor_Email || '',
        doctor_Contact: currentDoctor.doctor_Contact || '',
        doctor_Address: currentDoctor.doctor_Address || '',
        doctor_Department: currentDoctor.doctor_Department || '',
        doctor_CNIC: currentDoctor.doctor_CNIC || '',
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
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const validAgreementTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!file) return;

    // Size validation
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return;
    }

    // Type validation
    if (name === "doctor_Image" && !validImageTypes.includes(file.type)) {
      toast.error("Invalid image format. Please upload JPEG, JPG, or PNG");
      return;
    }

    if (name === "doctor_Agreement" && !validAgreementTypes.includes(file.type)) {
      toast.error("Invalid file format. Please upload PDF, DOC, or DOCX");
      return;
    }

    // Process valid files
    if (name === "doctor_Image") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    } else if (name === "doctor_Agreement") {
      setAgreementFile(file);
      setAgreementPreview(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email before submission
    // if (!validateEmail(formData.doctor_Email)) return;

    if (!isEditMode) {
      if (!imageFile) {
        toast.error("Please upload a doctor image");
        return;
      }
      if (!agreementFile) {
        toast.error("Please upload an agreement file");
        return;
      }
    }

    const formToSubmit = new FormData();

    // Append form data
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'doctor_Qualifications') {
        value.forEach((qual, i) => formToSubmit.append(`doctor_Qualifications[${i}]`, qual));
      } else if (key !== 'doctor_Contract') {
        formToSubmit.append(key, value);
      }
    });

    // Append contract data
    Object.entries(formData.doctor_Contract).forEach(([key, value]) => {
      formToSubmit.append(`doctor_Contract[${key}]`, value);
    });


    if (imageFile) {
      formToSubmit.append('doctor_Image', imageFile);
    }
    if (agreementFile) {
      formToSubmit.append('doctor_Agreement', agreementFile);
    }

    try {
      if (isEditMode && doctorId) {
        await dispatch(updateDoctorById({ doctorId, updatedData: formToSubmit })).unwrap();
        toast.success("Doctor updated successfully!");
      } else {
        await dispatch(createDoctor(formToSubmit)).unwrap();
        toast.success("Doctor created successfully!");
        resetLocalForm();
      }
      navigate('/receptionist/doctors');
    } catch (err) {
      if (err.statusCode === 409) {
        toast.error("This email is already registered to another doctor");
        setEmailError(true);
      } else {
        toast.error(err.message || `Failed to ${isEditMode ? 'update' : 'create'} doctor`);
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
    const numericValue = parseFloat(value) || 0;

    const clampedValue = Math.min(100, Math.max(0, numericValue))
    const roundedValue = parseFloat(clampedValue.toFixed(2))

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

  useEffect(() => {
    if (status === 'succeeded') {
      if (!isEditMode) {
        resetLocalForm();
      }
      dispatch(resetDoctorState());
    } else if (status === 'failed') {
      toast.error(error || `Failed to ${isEditMode ? 'update' : 'create'} doctor`);
      dispatch(resetDoctorState());
    }
  }, [status, error, navigate, dispatch, isEditMode]);

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


  const formConfig = {
    title: isEditMode ? "Edit Doctor" : "Doctor Registration",
    description: isEditMode ? "Update the doctor details below" : "Please fill in the doctor details below",
    submitText: isEditMode ? "Update Doctor" : "Register Doctor",
    loadingText: isEditMode ? "Updating..." : "Processing..."
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header Section */}
      <div className="bg-primary-600 rounded-t-md text-white px-6 py-8 shadow-md">
        <div className="flex items-center">
          <div className="h-12 w-1 bg-primary-300 mr-4 rounded-full"></div>
          <div>
            <h1 className="text-3xl font-bold">{formConfig.title}</h1>
            <p className="text-primary-100 mt-1">{formConfig.description}</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form className="w-full p-6" onSubmit={handleSubmit}>
        {/* Doctor Image Upload */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="h-10 w-1 bg-primary-600 mr-3 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-800">Profile Picture</h2>
            {!isEditMode && <span className="text-red-500 ml-1">*</span>}
          </div>

          <div className="flex justify-center">
            <label htmlFor="doctor_Image" className="cursor-pointer">
              <div className="w-48 h-48 rounded-lg border-4 border-dashed border-primary-300 flex items-center justify-center hover:border-primary-500 transition-colors">
                {previewImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={previewImage}
                      alt="Doctor Preview"
                      className="w-full h-full rounded-lg object-cover"
                    />
                  </div>
                ) : (
                  <div className="text-center text-primary-800">
                    <FontAwesomeIcon icon={faFileImage} className="text-5xl mb-2" />
                    <p className="text-sm font-medium">Upload Doctor Image</p>
                    <span className="text-xs text-gray-500">JPG, JPEG, PNG</span>
                  </div>
                )}
              </div>
            </label>
            <input
              type="file"
              id="doctor_Image"
              name="doctor_Image"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
              required={!isEditMode}
            />
          </div>
          <span className="text-xs place-content-center flex text-gray-600">
            Img size must be less than 10mb <span className="text-red-400">*</span>
          </span>
        </div>

        {/* Basic Details Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="h-10 w-1 bg-primary-600 mr-3 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {basicInfoFields.map((field, index) => (
              <InputField key={index} {...field} />
            ))}
          </div>
        </div>

        {/* Qualifications Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="h-10 w-1 bg-primary-600 mr-3 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-800">Qualifications</h2>
          </div>

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

          <div className="space-y-2 ">
            {formData.doctor_Qualifications?.map((qualification, index) => (
              <div key={index} className="flex border border-primary-500 border-t-primary-200 items-center justify-between bg-gray-50 py-2 px-4 rounded-md">
                <span className="text-gray-800 underline italic font-medium">{qualification}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveQualification(index)}
                  className="bg-red-500 px-2 py-1 text-white rounded-md hover:bg-gray-300 focus:outline-none"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Contract Details Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="h-10 w-1 bg-primary-600 mr-3 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-800">Contract Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contractFields.map((field, index) => (
              <InputField key={index} {...field} />
            ))}

            {/* Agreement File Input */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Agreement File {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <label htmlFor="doctor_Agreement" className="cursor-pointer">
                <div className="border-2 border-dashed border-primary-300 rounded-md p-4 text-center hover:border-primary-500 transition-colors">
                  {agreementPreview ? (
                    <div className="text-primary-800">
                      <FontAwesomeIcon icon={faFileContract} className="text-3xl mb-2" />
                      <p className="text-sm font-medium">
                        {isEditMode && !agreementFile ? "Current: " : ""}
                        {agreementPreview}
                      </p>
                      {isEditMode && !agreementFile && (
                        <p className="text-xs text-gray-500 mt-1">Click to upload new file</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-primary-800">
                      <FontAwesomeIcon icon={faFileContract} className="text-3xl mb-2" />
                      <p className="text-sm font-medium">Upload Agreement File</p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX</p>
                    </div>
                  )}
                </div>
              </label>
              <input
                type="file"
                id="doctor_Agreement"
                name="doctor_Agreement"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx"
                required={!isEditMode}
              />
            </div>
          </div>
          {/* Move this inside the agreement file input div, right after the input */}
        </div>

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
            className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''
              }`}
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
    </div>
  );
};

export default DoctorForm;