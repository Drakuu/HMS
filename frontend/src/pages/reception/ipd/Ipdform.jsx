import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { admitPatient, resetAdmissionState, } from "../../../features/ipdPatient/IpdPatientSlice";
import { fetchPatientByMrNo } from "../../../features/patient/patientSlice";
import { toast } from 'react-toastify';

import { useNavigate } from "react-router-dom"; // make sure you have this
import {
  AiOutlineUser,
  AiOutlineHome,
  AiOutlineIdcard,
  AiOutlineTeam,
  AiOutlineMan,
  AiOutlineCalendar,
  AiOutlineFieldNumber,
  AiOutlineDollar
} from "react-icons/ai";
import { FaUserMd, FaHeartbeat, FaRing } from "react-icons/fa";
import { GiHealthNormal } from "react-icons/gi";
import { MdWork, MdDiscount, MdLocalHospital, MdMeetingRoom, MdSingleBed } from "react-icons/md";

const IpdForm = () => {
  const [isSSPForm, setIsSSPForm] = useState(true);
  const [mrNo, setMrNo] = useState("");
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    data = {},        
    isLoading = false, 
    isError = false,   
    errorMessage = '' ,
  } = useSelector((state) => state.patient || {});

  const {
    admissionData,
    isLoading: isAdmissionLoading,
    isError: isAdmissionError,
    errorMessage: admissionErrorMessage,
    isSuccess: isAdmissionSuccess
  } = useSelector((state) => state.ipdPatient);

  // Add useEffect to handle success/error states
  useEffect(() => {
    if (isAdmissionSuccess) {
      toast.success("Patient admitted successfully!");
      dispatch(resetAdmissionState());
    }

    if (isAdmissionError) {
      toast.error(`Admission failed: ${admissionErrorMessage}`);
      dispatch(resetAdmissionState());
    }
  }, [isAdmissionSuccess, isAdmissionError, admissionErrorMessage, dispatch]);

  const [formData, setFormData] = useState({
    // Patient Information
    mrNumber: "",
    patientName: "",
    patientContactNo: "",
    dob: "",
    cnic: "",
    age: "",
    address: "",
    gender: "",
    referredBy: "",

    // Guardian Information
    guardianName: "",
    guardianRelation: "",
    guardianContact: "",
    maritalStatus: "",
    bloodGroup: "",
    // Admission Information
    admissionDate: new Date().toISOString().split('T')[0],
    admissionType: "SSP",
    doctor: "",
    wardType: "",
    wardNumber: "",
    bedNumber: "",
    admissionFee: "",
    discount: 0,
    totalFee: 0,
    customWardType: "",
    paymentStatus: "Unpaid",

    // Medical Information
    diagnosis: "",
    // allergies: "",
    // currentMedication: ""
  });

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  useEffect(() => {
    // Check if the current route is for "SSP" or "Private"
    const currentRoute = location.pathname;
    if (currentRoute.includes("/ipd/private")) {
      setIsSSPForm(false);
      setFormData(prev => ({ ...prev, admissionType: "Private" }));
    } else {
      setIsSSPForm(true);
      setFormData(prev => ({ ...prev, admissionType: "SSP" }));
    }
  }, [location]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!mrNo) return;

    try {
      const resultAction = await dispatch(fetchPatientByMrNo(mrNo));

      if (fetchPatientByMrNo.fulfilled.match(resultAction)) {
        const data = resultAction.payload.information?.patient;
        const guardian = data?.patient_Guardian || {};
        const doctor = data?.patient_HospitalInformation || {};

        setFormData(prev => ({
          ...prev,
          mrNumber: data.patient_MRNo || "",
          patientName: data.patient_Name || "",
          patientContactNo: data.patient_ContactNo || "",
          dob: data.patient_DateOfBirth || "",
          cnic: data.patient_CNIC || "",
          age: data.Patient_Age || "",
          address: data.patient_Address || "",
          gender: data.patient_Gender || "",
          guardianName: guardian.guardian_Name || "",
          guardianRelation: guardian.guardian_Relation || "",
          guardianContact: guardian.guardian_Contact || "",

          // Doctor-related fields
          doctor: doctor.doctor_Name || "",
          doctorName: doctor.doctor_Name || "",
          doctorDepartment: doctor.doctor_Department || "",
          doctorSpecialization: doctor.doctor_Specialization || "",
          doctorFee: doctor.doctor_Fee || "",
          doctorQualification: doctor.qualification || "",
          doctorGender: doctor.gender || "",

          // ✅ Referred By field
          referredBy: doctor.referredBy || "",

          // Other patient details
          bloodGroup: data.patient_BloodType || "",
          maritalStatus: data.patient_MaritalStatus || "",

          // Admission defaults
          wardType: "",
          wardNumber: "",
          bedNumber: "",
        }));

      }
    } catch (error) {
      toast.error(errorMessage || "Error fetching patient data");
    }
  };

  //Error state
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-red-500">
          Error: {errorMessage}
        </div>
      </div>
    );
  }
  // Add to your loading states
  if (isLoading || isAdmissionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-primary-600">Please wait...</div>
      </div>
    );

  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dob") {
      const age = calculateAge(value);
      setFormData(prev => ({
        ...prev,
        dob: value,
        age: age
      }));
      return;
    }

    if (name === "cnic") {
      const cleanedValue = value.replace(/\D/g, '');
      let formattedValue = cleanedValue;
      if (cleanedValue.length > 5) {
        formattedValue = `${cleanedValue.substring(0, 5)}-${cleanedValue.substring(5)}`;
      }
      if (cleanedValue.length > 12) {
        formattedValue = `${formattedValue.substring(0, 13)}-${formattedValue.substring(13)}`;
      }
      formattedValue = formattedValue.substring(0, 15);

      setFormData(prev => ({
        ...prev,
        cnic: formattedValue
      }));
      return;
    }

    if (name === "emergencyContact" || name === "mobileNumber" || name === "guardianContact") {
      const cleanedValue = value.replace(/\D/g, '');
      let formattedValue = cleanedValue;
      if (cleanedValue.length > 4) {
        formattedValue = `${cleanedValue.substring(0, 4)}-${cleanedValue.substring(4, 11)}`;
      }
      formattedValue = formattedValue.substring(0, 12);

      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }

    if (name === "admissionFee") {
      const fee = parseFloat(value) || 0;
      setFormData(prev => ({
        ...prev,
        admissionFee: fee,
        totalFee: fee - (parseFloat(prev.discount) || 0)
      }));
      return;
    }

    if (name === "discount") {
      const discountValue = parseFloat(value) || 0;
      setFormData(prev => ({
        ...prev,
        discount: discountValue,
        totalFee: (prev.admissionFee || 0) - discountValue
      }));
      return;
    }

    // Handling the doctor's name input
    if (name === "doctor") {
      setFormData(prev => ({
        ...prev,
        doctor: value // Set the doctor's name in the form data
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const calculateAge = (dobString) => {
    if (!dobString) return "";
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age.toString();
  };

  // Update your handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.mrNumber || !formData.patientName || !formData.doctor ||
      !formData.wardType || !formData.wardNumber || !formData.bedNumber) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!formData.diagnosis) {
      toast.error("Diagnosis is required");
      return;
    }

    const finalWardType = formData.wardType === "Other"
      ? formData.customWardType
      : formData.wardType;

    const payload = {
      patient_MRNo: formData.mrNumber,
      ward_Information: {
        ward_Type: formData.wardType === "Other" ? formData.customWardType : formData.wardType,
        ward_No: formData.wardNumber,
        bed_No: formData.bedNumber
      },
      admission_Details: {
        admission_Date: new Date(formData.admissionDate).toISOString(),
        admitting_Doctor: formData.doctor, // ✅ use correct key
        diagnosis: formData.diagnosis
      },
      financials: {
        admission_Fee: parseFloat(formData.admissionFee) || 0,
        daily_Charges: 0,
        discount: parseFloat(formData.discount) || 0,
        payment_Status: (formData.paymentStatus || "Unpaid")
          .charAt(0).toUpperCase() + formData.paymentStatus.slice(1).toLowerCase()
      },
      patient_Name: formData.patientName,
      patient_CNIC: formData.cnic,
      patient_Gender: formData.gender,
      patient_Age: formData.age,
      patient_DateOfBirth: formData.dob,
      patient_Address: formData.address,
      patient_Contact: formData.mobileNumber,
      patient_Guardian: {
        guardian_Name: formData.guardianName,
        guardian_Type: formData.guardianRelation,
        guardian_Contact: formData.guardianContact
      },
      patient_HospitalInformation: {
        doctor_Name: formData.doctorName,
        doctor_Department: formData.doctorDepartment,
        doctor_Specialization: formData.doctorSpecialization,
        doctor_Fee: formData.doctorFee,
        discount: formData.discount,
        total_Fee: formData.totalFee,
        qualification: formData.doctorQualification,
        gender: formData.doctorGender,
        referredBy: formData.referredBy,
      },
      patient_BloodType: formData.bloodGroup,
      patient_MaritalStatus: formData.maritalStatus,
    };


    console.log("Submitting payload:", payload); // Debug log

    try {
      const result = await dispatch(admitPatient(payload));

      if (admitPatient.fulfilled.match(result)) {
        toast.success("Patient admitted successfully!");

        // Reset form
        setFormData({
          mrNumber: "",
          patientName: "",
          patientContactNo: "",
          dob: "",
          cnic: "",
          age: "",
          address: "",
          gender: "",
          maritalStatus: "",
          bloodGroup: "",
          referredBy: "",
          guardianName: "",
          guardianRelation: "",
          guardianContact: "",
          admissionDate: new Date().toISOString().split('T')[0],
          admissionType: isSSPForm ? "SSP" : "Private",
          doctorName: "",
          wardType: "",
          wardNumber: "",
          bedNumber: "",
          admissionFee: "",
          discount: 0,
          totalFee: 0,
          customWardType: "",
          paymentStatus: "Unpaid",
          diagnosis: "",
        });

        setMrNo(""); // also clear MRNo field if needed

        // Navigate after short delay
        setTimeout(() => {
          navigate("/ipd/Admitted");
        }, 1000);
      } else {
        toast.error(result.payload?.message || "Admission failed. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to submit the form. Please try again.");
      console.error("Submit Error:", error);
    }

  };

  return (
    <div className="">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-primary-600 p-6 text-white">
          <h1 className="text-2xl font-bold">
            {isSSPForm ? "SSP Patient Admission Form" : "Private Patient Admission Form"}
          </h1>
          <p className="text-primary-100">Please fill in the patient details below</p>
        </div>

        <div className="p-6">
          {/* Search Section */}
          <div className="mb-8 bg-primary-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="h-8 w-1 bg-primary-600 mr-3 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-800">Search Patient</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AiOutlineIdcard className="text-primary-600" />
                </div>
                <input
                  type="text"
                  value={mrNo}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(e); // ⬅️ Call your search function
                    }
                  }}
                  onChange={(e) => setMrNo(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter MR Number"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Search
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Patient Information Section */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="h-10 w-1 bg-primary-600 mr-3 rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-800">Patient Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[
                  {
                    name: "mrNumber",
                    label: "MR Number",
                    icon: <AiOutlineIdcard className="text-primary-600" />,
                    type: "text",
                    placeholder: "Enter MR Number",
                    required: true,
                    readOnly: true,
                  },
                  {
                    name: "patientName",
                    label: "Patient Name",
                    icon: <AiOutlineUser className="text-primary-600" />,
                    type: "text",
                    placeholder: "Enter Patient Name",
                    required: true
                  },
                  {
                    name: "guardianName", // corrected
                    label: "Guardian Name",
                    icon: <AiOutlineTeam className="text-primary-600" />,
                    type: "text",
                    placeholder: "Enter Guardian Name",
                    required: true
                  },
                  {
                    name: "guardianRelation",
                    label: "Guardian Relation",
                    icon: <AiOutlineTeam className="text-primary-600" />,
                    type: "select",
                    options: ["Father", "Mother", "Sibling", "Spouse", "Uncle", "Aunt", "Grandfather", "Grandmother", "Other"],
                    placeholder: "Select Relation",
                    render: (
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Guardian Relation</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <AiOutlineTeam className="text-primary-600" />
                          </div>
                          <select
                            name="guardianRelation"
                            value={formData.guardianRelation}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 appearance-none"
                          >
                            <option value="">Select Relation</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Uncle">Uncle</option>
                            <option value="Aunt">Aunt</option>
                            <option value="Grandfather">Grandfather</option>
                            <option value="Grandmother">Grandmother</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    )
                  },
                  {
                    name: "dob",
                    label: "Date of Birth",
                    icon: <AiOutlineCalendar className="text-primary-600" />,
                    type: "date"
                  },
                  {
                    name: "cnic",
                    label: "CNIC Number",
                    icon: <AiOutlineIdcard className="text-primary-600" />,
                    type: "text",
                    placeholder: "XXXXX-XXXXXXX-X"
                  },
                  {
                    name: "age",
                    label: "Age",
                    icon: <AiOutlineFieldNumber className="text-primary-600" />,
                    type: "number",
                    placeholder: "Enter Age",
                  },
                  {
                    name: "patientContactNo",
                    label: "Patient Contact",
                    icon: <AiOutlineFieldNumber className="text-primary-600" />,
                    type: "tel",
                    placeholder: "03XX-XXXXXXX",
                    required: true
                  },
                  {
                    name: "guardianContact",
                    label: "Guardian Contact",
                    icon: <AiOutlineFieldNumber className="text-primary-600" />,
                    type: "tel",
                    placeholder: "03XX-XXXXXXX"
                  },
                  {
                    name: "address",
                    label: "Address",
                    icon: <AiOutlineHome className="text-primary-600" />,
                    type: "text",
                    placeholder: "Enter Full Address",
                    fullWidth: true
                  },
                ].map((field, index) => (
                  <div key={index} className={`space-y-1 ${field.fullWidth ? 'md:col-span-2' : ''}`}>
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {field.icon}
                      </div>
                      <input
                        name={field.name}
                        type={field.type}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder={field.placeholder}
                        required={field.required}
                        readOnly={field.readOnly}
                      />
                    </div>
                  </div>
                ))}

                {/* Gender Field */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AiOutlineMan className="text-primary-600" />
                    </div>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 appearance-none"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Marital Status Field */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaRing className="text-primary-600" />
                    </div>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 appearance-none"
                    >
                      <option value="">Select Marital Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>

                {/* Blood Group Field */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaHeartbeat className="text-primary-600" />
                    </div>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 appearance-none"
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Referred By Field */}
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Referred By</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GiHealthNormal className="text-primary-600" />
                    </div>
                    <input
                      name="referredBy"
                      type="text"
                      value={formData.referredBy}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter Referral Name (if any)"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Admission Information Section */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="h-10 w-1 bg-primary-600 mr-3 rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-800">Admission Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Admission Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AiOutlineCalendar className="text-primary-600" />
                    </div>
                    <input
                      name="admissionDate"
                      type="date"
                      value={formData.admissionDate}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Admission Type</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdLocalHospital className="text-primary-600" />
                    </div>
                    <select
                      name="admissionType"
                      value={formData.admissionType}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 appearance-none"
                      required
                    >
                      <option value="SSP">SSP</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Doctor</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUserMd className="text-primary-600" />
                    </div>
                    <input
                      name="doctor"
                      type="text"
                      value={formData.doctor}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter Doctor Name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Ward Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdMeetingRoom className="text-primary-600" />
                    </div>
                    <input
                      name="wardNumber"
                      type="text"
                      value={formData.wardNumber}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter Ward Number"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Ward Type</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AiOutlineTeam className="text-primary-600" />
                    </div>
                    <select
                      name="wardType"
                      value={formData.wardType}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 appearance-none"
                      required
                    >
                      <option value="">Select Ward Type</option>
                      <option value="General">General</option>
                      <option value="Private">Private</option>
                      <option value="ICU">ICU</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {formData.wardType === "Other" && (
                    <div className="mt-2">
                      <input
                        type="text"
                        name="customWardType"
                        placeholder="Please specify ward type"
                        className="block w-full pl-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        value={formData.customWardType || ""}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>



                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Bed Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdSingleBed className="text-primary-600" />
                    </div>
                    <input
                      name="bedNumber"
                      type="text"
                      value={formData.bedNumber}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter Bed Number"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Admission Fee</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AiOutlineDollar className="text-primary-600" />
                    </div>
                    <input
                      name="admissionFee"
                      type="number"
                      value={formData.admissionFee}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter Admission Fee"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Discount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdDiscount className="text-primary-600" />
                    </div>
                    <input
                      name="discount"
                      type="number"
                      value={formData.discount}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter Discount"
                      min="0"
                      max={formData.admissionFee || 0}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Total Fee</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AiOutlineDollar className="text-primary-600" />
                    </div>
                    <input
                      type="text"
                      value={formData.totalFee ? `Rs. ${formData.totalFee}` : "Rs. 0"}
                      readOnly
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 font-semibold focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AiOutlineDollar className="text-primary-600" />
                    </div>
                    <select
                      name="paymentStatus"
                      value={formData.paymentStatus || "Unpaid"}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 appearance-none"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="partial">Partial</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="h-10 w-1 bg-primary-600 mr-3 rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-800">Medical Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                  <div className="relative">
                    <textarea
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleChange}
                      className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter Diagnosis"
                      rows="3"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <div className="flex space-x-4">
                {/* <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                >
                  <AiOutlinePrinter className="mr-2" />
                  Print
                </button> */}
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Save Admission
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IpdForm;