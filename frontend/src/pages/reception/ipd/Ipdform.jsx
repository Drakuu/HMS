import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { admitPatient, resetAdmissionState } from "../../../features/ipdPatient/IpdPatientSlice";
import { fetchPatientByMrNo } from "../../../features/patient/patientSlice";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { AiOutlineIdcard } from "react-icons/ai";
import { Button, ButtonGroup } from "../../../components/common/Buttons";
import { InputField, TextAreaField } from "../../../components/common/FormFields";
import PatientInfoSection from "./PatientInfoSection";
import AdmissionInfoSection from "./AdmissionInfoSection";
import PrintIpdAdmission from './PrintAdmissionForm';
import ReactDOMServer from 'react-dom/server';

const IpdForm = () => {
  const [isSSPForm, setIsSSPForm] = useState(true);
  const [mrNo, setMrNo] = useState("");
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isLoading = false,
    isError = false,
    errorMessage = '',
  } = useSelector((state) => state.patients || {});

  const {

    isLoading: isAdmissionLoading,
    isError: isAdmissionError,
    errorMessage: admissionErrorMessage,
    isSuccess: isAdmissionSuccess
  } = useSelector((state) => state.ipdPatient);

  const initialFormState = useMemo(() => ({
    mrNumber: "",
    patientName: "",
    patientContactNo: "",
    dob: "",
    cnic: "",
    age: "",
    address: "",
    gender: "",
    referredBy: "",
    guardianName: "",
    guardianRelation: "",
    guardianContact: "",
    maritalStatus: "",
    bloodGroup: "",
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
    diagnosis: "",
  }), []);

  const [formData, setFormData] = useState(initialFormState);
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  useEffect(() => {
    const currentRoute = location.pathname;
    if (currentRoute.includes("/ipd/private")) {
      setIsSSPForm(false);
      setFormData(prev => ({ ...prev, admissionType: "Private" }));
    } else {
      setIsSSPForm(true);
      setFormData(prev => ({ ...prev, admissionType: "SSP" }));
    }
  }, [location]);
  // console.log("[Debug] Final Payload:", formData); // Add this before dispatch

  useEffect(() => {
    if (isAdmissionSuccess) {
      toast.success("Patient admitted successfully!");
      dispatch(resetAdmissionState());
      setFormData(initialFormState);
      setMrNo("");
      setTimeout(() => navigate("/receptionist/ipd/Admitted"), 1000);
    }

    if (isAdmissionError) {
      toast.error(`Admission failed: ${admissionErrorMessage}`);
      dispatch(resetAdmissionState());
    }
  }, [isAdmissionSuccess, isAdmissionError, admissionErrorMessage, dispatch, initialFormState, navigate]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!mrNo) return;

    try {
      const resultAction = await dispatch(fetchPatientByMrNo(mrNo));
      if (fetchPatientByMrNo.fulfilled.match(resultAction)) {
        const patientData = resultAction.payload;
        const guardian = patientData?.patient_Guardian || {};
        const hospitalInfo = patientData?.patient_HospitalInformation || {};

        setFormData(prev => ({
          ...prev,
          mrNumber: patientData?.patient_MRNo || mrNo || "",
          patientName: patientData?.patient_Name || "",
          patientContactNo: patientData?.patient_ContactNo || "",
          dob: patientData?.patient_DateOfBirth || "",
          cnic: patientData?.patient_CNIC || "",
          age: patientData?.patient_Age || "",
          address: patientData?.patient_Address || "",
          gender: patientData?.patient_Gender || "",
          guardianName: guardian?.guardian_Name || "",
          guardianRelation: guardian?.guardian_Relation || "",
          guardianContact: guardian?.guardian_Contact || "",
          doctor: hospitalInfo?.doctor_Name || "",
          referredBy: hospitalInfo?.referredBy || "",
          bloodGroup: patientData?.patient_BloodType || "",
          maritalStatus: patientData?.patient_MaritalStatus || "",
          wardType: "",
          wardNumber: "",
          bedNumber: "",
        }));
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error(errorMessage || "Error fetching patient data");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const handlers = {
      dob: () => {
        const age = calculateAge(value);
        setFormData(prev => ({ ...prev, dob: value, age }));
      },
      cnic: () => {
        const cleanedValue = value.replace(/\D/g, '');
        let formattedValue = cleanedValue;
        if (cleanedValue.length > 5) formattedValue = `${cleanedValue.substring(0, 5)}-${cleanedValue.substring(5)}`;
        if (cleanedValue.length > 12) formattedValue = `${formattedValue.substring(0, 13)}-${formattedValue.substring(13)}`;
        setFormData(prev => ({ ...prev, cnic: formattedValue.substring(0, 15) }));
      },
      emergencyContact: () => formatPhoneNumber(name, value),
      mobileNumber: () => formatPhoneNumber(name, value),
      guardianContact: () => formatPhoneNumber(name, value),
      admissionFee: () => {
        const fee = parseFloat(value) || 0;
        setFormData(prev => ({ ...prev, admissionFee: fee, totalFee: fee - (parseFloat(prev.discount) || 0) }));
      },
      discount: () => {
        const discountValue = parseFloat(value) || 0;
        setFormData(prev => ({ ...prev, discount: discountValue, totalFee: (prev.admissionFee || 0) - discountValue }));
      },
      default: () => setFormData(prev => ({ ...prev, [name]: value }))
    };

    (handlers[name] || handlers.default)();
  };

  const formatPhoneNumber = (name, value) => {
    const cleanedValue = value.replace(/\D/g, '');
    let formattedValue = cleanedValue;
    if (cleanedValue.length > 4) formattedValue = `${cleanedValue.substring(0, 4)}-${cleanedValue.substring(4, 11)}`;
    setFormData(prev => ({ ...prev, [name]: formattedValue.substring(0, 12) }));
  };

  const calculateAge = (dobString) => {
    if (!dobString) return "";
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
    return age.toString();
  };

  const preparePayload = () => {
    return {
      patient_MRNo: formData.patient_MRNo || formData.mrNumber,
      patient_Name: formData.patientName,
      patient_CNIC: formData.cnic,
      patient_Gender: formData.gender,
      patient_Age: formData.age,
      patient_DateOfBirth: formData.dob,
      patient_Address: formData.address,
      patient_Contact: formData.patientContactNo,
      patient_Guardian: {
        guardian_Name: formData.guardianName,
        guardian_Relation: formData.guardianRelation,
        guardian_Contact: formData.guardianContact
      },
      admission_Details: {
        admission_Date: new Date(formData.admissionDate).toISOString(),
        admitting_Doctor: formData.doctor,
        diagnosis: formData.diagnosis
      },
      ward_Information: {
        ward_Type: formData.wardType === "Other" ? formData.customWardType : formData.wardType,
        ward_No: formData.wardNumber,
        bed_No: formData.bedNumber
      },
      financials: {
        admission_Fee: parseFloat(formData.admissionFee) || 0,
        daily_Charges: 0,
        discount: parseFloat(formData.discount) || 0,
        payment_Status: formData.paymentStatus || "Unpaid"
      },
      patient_BloodType: formData.bloodGroup,
      patient_MaritalStatus: formData.maritalStatus
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[Form Submission] Starting form submission process");

    // Validate required fields
    if (!formData.mrNumber) {
      return toast.error("Patient MR Number is required");
    }

    // Prepare payload
    const payload = preparePayload();
    console.log("Final Payload:", JSON.stringify(payload, null, 2));

    try {
      const result = await dispatch(admitPatient(payload));
      if (admitPatient.fulfilled.match(result)) {
        // Success handling
      } else {
        console.error("API Error:", result.payload);
        toast.error(result.payload?.message || "Admission failed");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("Failed to submit form");
    }
  };


  const handlePrintAdmission = () => {
    const printContent = ReactDOMServer.renderToString(
      <PrintIpdAdmission data={formData} />
    );

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>IPD Admission</title>
        <style>
          body { font-family: Arial; font-size: 12px; padding: 10px; }
          .header { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 15px; }
          .section { margin-bottom: 15px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .footer { margin-top: 20px; text-align: center; font-size: 10px; }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);

    printWindow.document.close();

    // Wait for content to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      }, 500);
    };
  };

  const handleSaveAndPrint = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.mrNumber) {
      return toast.error("Patient MR Number is required");
    }

    const payload = preparePayload();

    try {
      const result = await dispatch(admitPatient(payload));

      if (admitPatient.fulfilled.match(result)) {
        toast.success("Patient admitted successfully!");

        // Print after successful admission
        setTimeout(() => {
          handlePrintAdmission();
        }, 300);
      } else {
        throw new Error(result.payload?.message || "Admission failed");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-red-500">
          Error: {errorMessage}
        </div>
      </div>
    );
  }

  if (isLoading || isAdmissionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-primary-600">Please wait...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-primary-600 p-6 text-white">
        <h1 className="text-2xl font-bold">
          {isSSPForm ? "SSP Patient Admission Form" : "Private Patient Admission Form"}
        </h1>
        <p className="text-primary-100">Please fill in the patient details below</p>
      </div>

      <div className="p-6">
        <div className="mb-8 bg-primary-50 p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <div className="h-8 w-1 bg-primary-600 mr-3 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-800">Search Patient</h2>
          </div>

          <div className="flex items-center gap-4">
            <InputField
              name="search"
              type="text"
              value={mrNo}
              onChange={(e) => setMrNo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
              placeholder="Enter MR Number"
              icon="idCard"
              fullWidth
            />
            <Button
              onClick={handleSearch}
              variant="primary"
              className="whitespace-nowrap"
            >
              Search
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <PatientInfoSection
            formData={formData}
            handleChange={handleChange}
            bloodGroups={bloodGroups}
          />

          <AdmissionInfoSection
            formData={formData}
            handleChange={handleChange}
            isSSPForm={isSSPForm}
          />

          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="h-10 w-1 bg-primary-600 mr-3 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-800">Medical Information</h2>
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
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <ButtonGroup>
              <Button
                type="submit"
                variant="primary"
                isSubmitting={isAdmissionLoading}
              >
                Save Admission
              </Button>
              <Button
                type="button"
                variant="success"
                onClick={handleSaveAndPrint}
                isSubmitting={isAdmissionLoading}
              >
                Save & Print
              </Button>
            </ButtonGroup>
          </div>
        </form>
      </div>

    </div>
  );
};

export default IpdForm;