// IpdForm.js (Refactored)
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  admitPatient,
  resetAdmissionState,
} from "../../../features/ipdPatient/IpdPatientSlice";
import { fetchPatientByMrNo } from "../../../features/patient/patientSlice";
import { toast } from "react-toastify";
import PatientSearch from "./addipd/PatientSearch";
import MedicalInformation from "./addipd/MedicalInformation";
import FormActions from "./addipd/FormActions";
import PatientInfoSection from "./addipd/PatientInfoSection";
import AdmissionInfoSection from "./addipd/AdmissionInfoSection";
import PrintIpdAdmission from "./PrintAdmissionForm";
import ReactDOMServer from "react-dom/server";
import { getRoleRoute } from "../../../utils/getRoleRoute";

const IpdForm = () => {
  const [mrNo, setMrNo] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { wardsByDepartment } = useSelector((state) => state.ward || {});
  const { departments } = useSelector((state) => state.department || {});
  const {
    isLoading = false,
    isError = false,
    errorMessage = "",
  } = useSelector((state) => state.patients || {});

  const {
    isLoading: isAdmissionLoading,
    isError: isAdmissionError,
    errorMessage: admissionErrorMessage,
    isSuccess: isAdmissionSuccess,
  } = useSelector((state) => state.ipdPatient || {});

  const initialFormState = useMemo(() => ({
    patientId: '',
    mrNumber: "",
    referredBy: "",
    wardType: "",
    wardNumber: "",
    admissionDate: new Date().toISOString().split("T")[0],
    admissionType: "SSP",
    doctorId: "",
    departmentId: "",
    wardId: "",
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
  }, [
    isAdmissionSuccess,
    isAdmissionError,
    admissionErrorMessage,
    dispatch,
    initialFormState,
    navigate,
  ]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!mrNo.trim()) {
      toast.error("Please enter an MR Number");
      return;
    }

    setIsSearching(true);
    try {
      const resultAction = await dispatch(fetchPatientByMrNo(mrNo));

      if (fetchPatientByMrNo.fulfilled.match(resultAction)) {
        const patientData = resultAction.payload;

        if (!patientData) {
          toast.error(`Patient with MR ${mrNo} not found`);
          return;
        }

        const guardian = patientData?.patient_Guardian || {};

        setFormData((prev) => ({
          ...prev,
          patientId: patientData._id, // Store the patient ID
          mrNumber: patientData?.patient_MRNo || mrNo,
          patientName: patientData?.patient_Name || "",
          patientContactNo: patientData?.patient_ContactNo || "",
          dob: patientData?.patient_DateOfBirth
            ? new Date(patientData.patient_DateOfBirth).toISOString().split('T')[0]
            : "",
          cnic: patientData?.patient_CNIC || "",
          age: patientData?.patient_Age?.toString() || "",
          address: patientData?.patient_Address || "",
          gender: patientData?.patient_Gender || "",
          guardianName: guardian?.guardian_Name || "",
          guardianRelation: guardian?.guardian_Relation || "",
          guardianContact: guardian?.guardian_Contact || "",
          bloodGroup: patientData?.patient_BloodType || "",
          maritalStatus: patientData?.patient_MaritalStatus || "",
        }));

        toast.success("Patient data loaded successfully!");

      } else if (fetchPatientByMrNo.rejected.match(resultAction)) {
        const error = resultAction.payload || resultAction.error?.message || "Unknown error";

        if (typeof error === 'string' && error.includes("not found")) {
          toast.error(`Patient with MR ${mrNo} not found`);
        } else {
          toast.error(`Error: ${error}`);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("An unexpected error occurred during search");
    } finally {
      setIsSearching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Reset ward and bed when department changes
    if (name === "departmentId") {
      setFormData((prev) => ({
        ...prev,
        departmentId: value,
        wardId: "",
        bedNumber: "",
      }));
      return;
    }
    // Reset bed when ward changes
    if (name === "wardId") {
      setFormData((prev) => ({
        ...prev,
        wardId: value,
        bedNumber: "",
      }));
      return;
    }

    // Handle different input types
    const handlers = {
      dob: () => {
        const age = calculateAge(value);
        setFormData((prev) => ({ ...prev, dob: value, age }));
      },
      cnic: () => {
        const cleanedValue = value.replace(/\D/g, "");
        let formattedValue = cleanedValue;
        if (cleanedValue.length > 5)
          formattedValue = `${cleanedValue.substring(0, 5)}-${cleanedValue.substring(5)}`;
        if (cleanedValue.length > 12)
          formattedValue = `${formattedValue.substring(0, 13)}-${cleanedValue.substring(13)}`;
        setFormData((prev) => ({
          ...prev,
          cnic: formattedValue.substring(0, 15),
        }));
      },
      patientContactNo: () => formatPhoneNumber(name, value),
      guardianContact: () => formatPhoneNumber(name, value),
      admissionFee: () => {
        const fee = parseFloat(value) || 0;
        setFormData((prev) => ({
          ...prev,
          admissionFee: fee,
          totalFee: fee - (parseFloat(prev.discount) || 0),
        }));
      },
      discount: () => {
        const discountValue = parseFloat(value) || 0;
        setFormData((prev) => ({
          ...prev,
          discount: discountValue,
          totalFee: (prev.admissionFee || 0) - discountValue,
        }));
      },
      default: () => setFormData((prev) => ({ ...prev, [name]: value })),
    };

    (handlers[name] || handlers.default)();
  };

  const formatPhoneNumber = (name, value) => {
    const cleanedValue = value.replace(/\D/g, "");
    let formattedValue = cleanedValue;
    if (cleanedValue.length > 4)
      formattedValue = `${cleanedValue.substring(0, 4)}-${cleanedValue.substring(4, 11)}`;
    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue.substring(0, 12),
    }));
  };

  const calculateAge = (dobString) => {
    if (!dobString) return "";
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()))
      age--;
    return age.toString();
  };

  const preparePayload = () => {
    const selectedWard = wardsByDepartment.find(
      (ward) => ward._id === formData.wardId
    );
    const selectedDepartment = departments.find(
      (dept) => dept._id === formData.departmentId
    );

    return {
      patientId: formData.patientId, // Changed from patient_MRNo to patientId
      admission_Details: {
        admission_Date: new Date(formData.admissionDate),
        admitting_Doctor: formData.doctorId,
        diagnosis: formData.diagnosis,
        admission_Type: formData.admissionType,
      },
      ward_Information: {
        ward_Id: formData.wardId,
        ward_Type: selectedDepartment?.name || "",
        ward_No: selectedWard?.wardNumber || "",
        bed_No: formData.bedNumber,
        pdCharges: 0 // Add this field as per schema
      },
      financials: {
        admission_Fee: parseFloat(formData.admissionFee) || 0,
        discount: parseFloat(formData.discount) || 0,
        payment_Status: formData.paymentStatus || "Unpaid",
        total_Charges:
          (parseFloat(formData.admissionFee) || 0) -
          (parseFloat(formData.discount) || 0),
      }
    };
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setMrNo("");
  };

  const validateForm = () => {
    const errors = {};

    // Check if patient is selected
    if (!formData.patientId) {
      errors.patient = "Please search and select a patient first";
    }

    // Patient Info Validation
    if (!formData.mrNumber.trim()) errors.mrNumber = "MR Number is required";
    if (!formData.admissionDate)
      errors.admissionDate = "Admission Date is required";
    if (!formData.departmentId) errors.departmentId = "Department is required";
    if (!formData.wardId) errors.wardId = "Ward is required";
    if (!formData.bedNumber) errors.bedNumber = "Bed is required";
    if (!formData.admissionFee || parseFloat(formData.admissionFee) <= 0) {
      errors.admissionFee = "Valid Admission Fee is required";
    }
    if (!formData.paymentStatus)
      errors.paymentStatus = "Payment Status is required";
    if (!formData.diagnosis.trim()) errors.diagnosis = "Diagnosis is required";

    // Bed Availability Check
    const selectedWard = wardsByDepartment.find(
      (w) => w._id === formData.wardId
    );
    if (selectedWard) {
      const selectedBed = selectedWard.beds.find(
        (b) => b.bedNumber === formData.bedNumber
      );
      if (selectedBed?.occupied) {
        errors.bedNumber = "Selected bed is occupied";
      }
    } else if (formData.wardId) {
      errors.wardId = "Invalid ward selected";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if patientId is available
    if (!formData.patientId) {
      toast.error("Please search for a patient first");
      return;
    }

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, message]) => {
        toast.error(message);
      });
      return;
    }

    try {
      const payload = preparePayload();
      const result = await dispatch(admitPatient(payload));

      if (admitPatient.fulfilled.match(result)) {
        toast.success("Patient admitted successfully!");
        resetForm();
        navigate(getRoleRoute(`ipd/Admitted`));
      } else if (admitPatient.rejected.match(result)) {
        const error = result.payload;

        // Handle different error types
        if (error?.message) {
          if (error.message.includes("already admitted")) {
            toast.error("This patient is already admitted");
          } else if (error.message.includes("Bed")) {
            toast.error(error.message);
          } else {
            toast.error(`Admission error: ${error.message}`);
          }
        } else {
          toast.error("Admission failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit form. Please try again.");
    }
  };

  const handlePrintAdmission = () => {
    try {
      const selectedWard = wardsByDepartment.find(
        (ward) => ward._id === formData.wardId
      );
      const selectedDepartment = departments.find(
        (dept) => dept._id === formData.departmentId
      );

      const printData = {
        ...formData,
        mrNumber: formData.mrNumber || "N/A",
        patientName: formData.patientName || "N/A",
        patientContactNo: formData.patientContactNo || "N/A",
        dob: formData.dob || "N/A",
        cnic: formData.cnic || "N/A",
        gender: formData.gender || "N/A",
        address: formData.address || "N/A",
        guardianName: formData.guardianName || "N/A",
        guardianRelation: formData.guardianRelation || "N/A",
        guardianContact: formData.guardianContact || "N/A",
        wardType: selectedDepartment?.name || "N/A",
        admissionType: formData.admissionType || "N/A",
        wardNumber: selectedWard?.wardNumber || "N/A",
        bedNumber: formData.bedNumber || "N/A",
        admissionDate: formData.admissionDate || "N/A",
        doctor: formData.doctor || "N/A",
        diagnosis: formData.diagnosis || "N/A",
        admissionFee: formData.admissionFee || "0",
        discount: formData.discount || "0",
        paymentStatus: formData.paymentStatus || "N/A",
      };

      const printContent = ReactDOMServer.renderToString(
        <PrintIpdAdmission data={printData} />
      );

      const printWindow = window.open("", "_blank");
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

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.onafterprint = () => printWindow.close();
        }, 500);
      };
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to generate print preview");
    }
  };

  const handleSaveAndPrint = async (e) => {
    e.preventDefault();

    // Check if patientId is available
    if (!formData.patientId) {
      toast.error("Please search for a patient first");
      return;
    }

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, message]) => {
        toast.error(message);
      });
      return;
    }

    try {
      const payload = preparePayload();
      const result = await dispatch(admitPatient(payload));

      if (admitPatient.fulfilled.match(result)) {
        toast.success("Patient admitted successfully!");
        setTimeout(() => {
          handlePrintAdmission();
        }, 300);
      } else {
        const error = result.payload;
        throw new Error(error?.message || "Admission failed");
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
        <div className="text-xl font-semibold text-primary-600">
          Please wait...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-primary-600 p-6 text-white">
        <h1 className="text-2xl font-bold">IPD Patient Admission Form</h1>
        <p className="text-primary-100">
          Please fill in all required patient details below
        </p>
      </div>

      <div className="p-6">
        <PatientSearch
          mrNo={mrNo}
          setMrNo={setMrNo}
          handleSearch={handleSearch}
          isLoading={isLoading}
          isSearching={isSearching}
        />

        <form onSubmit={handleSubmit}>
          <PatientInfoSection
            formData={formData}
            handleChange={handleChange}
            bloodGroups={bloodGroups}
            required
          />

          <AdmissionInfoSection
            formData={formData}
            handleChange={handleChange}
            required
          />

          <MedicalInformation
            formData={formData}
            handleChange={handleChange}
          />

          <FormActions
            onCancel={() => navigate(-1)}
            onSubmit={handleSubmit}
            onSaveAndPrint={handleSaveAndPrint}
            isSubmitting={isAdmissionLoading}
          />
        </form>
      </div>
    </div>
  );
};

export default IpdForm;