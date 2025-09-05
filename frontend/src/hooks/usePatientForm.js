import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchAllDoctors } from '../features/doctor/doctorSlice';
import { createPatient, fetchPatientByMrNo, updatePatient, searchPatients, selectSelectedPatient } from '../features/patient/patientSlice';
import { getRoleRoute } from '../utils/getRoleRoute';
import { handlePrint } from '../utils/printUtils';

export const usePatientForm = (mode = "create") => {
   const dispatch = useDispatch();
   const { patientMRNo } = useParams();
   const navigate = useNavigate();

   const [isLoading, setIsLoading] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [selectedVisitId, setSelectedVisitId] = useState(null);
   const [showVisitSelector, setShowVisitSelector] = useState(false);
   const [isFormDataReady, setIsFormDataReady] = useState(false);
   const [localSelectedPatient, setLocalSelectedPatient] = useState(null);

   const { searchResults: reduxSearchResults, searchStatus } = useSelector((state) => state.patients);
   const { doctors: doctorsList, status: doctorsStatus } = useSelector((state) => state.doctor);
   const selectedPatient = useSelector(selectSelectedPatient);

   // Define valid enum values according to your backend schema
   const validGenders = ['male', 'female', 'other'];
   const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
   const validMaritalStatuses = ['single', 'married', 'divorced', 'widowed'];
   const validPaymentMethods = ['cash', 'card', 'bank_transfer', 'online', 'other'];

   const initialFormState = {
      // Patient Information
      patient_MRNo: "",
      patient_Name: "",
      patient_ContactNo: "",
      patient_Guardian: {
         guardian_Relation: "",
         guardian_Name: "",
         guardian_Contact: ""
      },
      patient_CNIC: "",
      patient_Gender: "",
      patient_Age: "",
      patient_DateOfBirth: "",
      patient_Address: "",
      patient_BloodType: "",
      patient_MaritalStatus: "",

      // Visit Information
      visitData: {
         doctor: "",
         purpose: "",
         disease: "",
         discount: 0,
         referredBy: "",
         amountPaid: 0,
         paymentMethod: "cash",
         verbalConsentObtained: false,
         token: "",
         notes: ""
      },

      // UI State
      printOption: "",
      doctorDetails: {
         name: "",
         gender: "",
         qualification: "",
         fee: 0,
         specialization: "",
         department: ""
      }
   };

   const [formData, setFormData] = useState(initialFormState);

   // Fetch doctors when component mounts
   useEffect(() => {
      dispatch(fetchAllDoctors());
   }, [dispatch]);

   // In your NewOpd component, modify the useEffect that fetches patient data
   useEffect(() => {
      if (mode === "edit" && patientMRNo) {
         setIsLoading(true);
         dispatch(fetchPatientByMrNo(patientMRNo))
            .unwrap()
            .then((patientData) => {
               // Just set the patient data, don't populate the form
               setLocalSelectedPatient(patientData);
               setShowVisitSelector(true);
            })
            .catch((err) => {
               console.error("Error fetching patient:", err);
               toast.error("Failed to load patient data");
               navigate(getRoleRoute(`OPD/manage`));
            })
            .finally(() => setIsLoading(false));
      }
   }, [mode, patientMRNo, dispatch, navigate]);

   // Modify populateForm to handle visit selection
   const populateForm = (patientData, visitId = null) => {
      if (!patientData) return;

      console.log("Populating form with patient data:", patientData);
      console.log("Visit ID provided:", visitId);

      // If no visitId provided, use the latest visit
      let targetVisit = patientData.visits?.[patientData.visits.length - 1] || {};

      if (visitId) {
         // Find the specific visit by ID
         targetVisit = patientData.visits.find(v => v._id === visitId) || targetVisit;
         console.log("Found target visit:", targetVisit);
      }

      const doctor = targetVisit.doctor || {};
      const user = doctor.user || {};

      console.log("Doctor object:", doctor);
      console.log("User object:", user);

      // Build the new form data object with CORRECT field names
      const newFormData = {
         patient_MRNo: patientData.patient_MRNo || "",
         patient_Name: patientData.patient_Name || "",
         patient_ContactNo: patientData.patient_ContactNo || "",
         patient_Guardian: {
            guardian_Relation: patientData.patient_Guardian?.guardian_Relation || "",
            guardian_Name: patientData.patient_Guardian?.guardian_Name || "",
            guardian_Contact: patientData.patient_Guardian?.guardian_Contact || ""
         },
         patient_CNIC: patientData.patient_CNIC || "",
         patient_Gender: patientData.patient_Gender || "",
         patient_Age: patientData.patient_Age || "",
         patient_DateOfBirth: patientData.patient_DateOfBirth ?
            new Date(patientData.patient_DateOfBirth).toISOString().split('T')[0] : "",
         patient_Address: patientData.patient_Address || "",
         patient_BloodType: patientData.patient_BloodType || "",
         patient_MaritalStatus: patientData.patient_MaritalStatus || "",

         visitData: {
            visitId: targetVisit._id || "", // Store the visit ID for updates
            doctor: targetVisit.doctor?._id || "", // CORRECT: use 'doctor' not 'doctorId'
            purpose: targetVisit.purpose || "",
            disease: targetVisit.disease || "",
            discount: targetVisit.discount || 0,
            referredBy: targetVisit.referredBy || "",
            amountPaid: targetVisit.amountPaid || 0,
            paymentMethod: targetVisit.paymentMethod || "cash",
            verbalConsentObtained: targetVisit.verbalConsentObtained || false,
            token: targetVisit.token || "",
            notes: targetVisit.notes || ""
         },

         doctorDetails: {
            name: user.user_Name || "N/A",
            gender: doctor.doctor_Gender || "",
            qualification: Array.isArray(doctor.doctor_Qualifications)
               ? doctor.doctor_Qualifications.join(", ")
               : doctor.doctor_Qualifications || "",
            fee: doctor.doctor_Fee || 0,
            specialization: doctor.doctor_Specialization || "",
            department: doctor.doctor_Department || ""
         },

         printOption: ""
      };

      console.log("New form data to be set:", newFormData);
      setFormData(newFormData);
      setIsFormDataReady(true); // Add this line
   };

   const resetForm = () => {
      setFormData(initialFormState);
   };

   const handleSave = async (e) => {
      if (e) e.preventDefault();
      setIsSubmitting(true);

      // Validate enum fields before sending
      const validationErrors = [];

      if (formData.patient_Gender && !validGenders.includes(formData.patient_Gender)) {
         validationErrors.push(`Gender must be one of: ${validGenders.join(', ')}`);
      }

      if (formData.patient_BloodType && !validBloodTypes.includes(formData.patient_BloodType)) {
         validationErrors.push(`Blood type must be one of: ${validBloodTypes.join(', ')}`);
      }

      if (formData.patient_MaritalStatus && !validMaritalStatuses.includes(formData.patient_MaritalStatus)) {
         validationErrors.push(`Marital status must be one of: ${validMaritalStatuses.join(', ')}`);
      }

      if (formData.visitData.paymentMethod && !validPaymentMethods.includes(formData.visitData.paymentMethod)) {
         validationErrors.push(`Payment method must be one of: ${validPaymentMethods.join(', ')}`);
      }

      if (validationErrors.length > 0) {
         validationErrors.forEach(error => toast.error(error));
         setIsSubmitting(false);
         return;
      }

      // Prepare payload with proper validation
      const payload = {
         patient_MRNo: formData.patient_MRNo,
         patient_Name: formData.patient_Name,
         patient_ContactNo: formData.patient_ContactNo,
         patient_Guardian: formData.patient_Guardian,
         patient_CNIC: formData.patient_CNIC,
         // Only include enum fields if they have valid values
         ...(formData.patient_Gender && { patient_Gender: formData.patient_Gender }),
         patient_Age: parseInt(formData.patient_Age) || 0,
         patient_DateOfBirth: formData.patient_DateOfBirth,
         patient_Address: formData.patient_Address,
         ...(formData.patient_BloodType && { patient_BloodType: formData.patient_BloodType }),
         ...(formData.patient_MaritalStatus && { patient_MaritalStatus: formData.patient_MaritalStatus }),
         visitData: {
            ...formData.visitData,
            visitId: formData.visitData.visitId, // Include visitId for updates
            doctor: formData.visitData.doctor,
            purpose: formData.visitData.purpose || "Consultation", // Default purpose
            disease: formData.visitData.disease || "",
            discount: parseFloat(formData.visitData.discount) || 0,
            referredBy: formData.visitData.referredBy || "",
            amountPaid: parseFloat(formData.visitData.amountPaid) || 0,
            paymentMethod: formData.visitData.paymentMethod || "cash",
            verbalConsentObtained: Boolean(formData.visitData.verbalConsentObtained),
            token: formData.visitData.token ||  "NAN",
            notes: formData.visitData.notes || ""
         }
      };

      // Remove empty string values for enum fields
      Object.keys(payload).forEach(key => {
         if (payload[key] === "") {
            delete payload[key];
         }
      });

      try {
         if (mode === "create") {
            await dispatch(createPatient(payload)).unwrap();
            toast.success("Patient created successfully!");
         } else {
            if (!formData.patient_MRNo) {
               throw new Error("MR Number is required");
            }

            await dispatch(updatePatient({
               mrNo: formData.patient_MRNo,
               updatedData: payload
            })).unwrap();

            toast.success("Patient updated successfully!");
         }
         resetForm();
         navigate(getRoleRoute('/OPD/manage'));
      } catch (err) {
         console.error("Submission error:", err);
         toast.error(
            err.payload?.message ||
            (mode === "create" ? "Patient creation failed!" : "Patient update failed!"),
            {
               autoClose: 5000,
               closeOnClick: true,
               pauseOnHover: true,
            }
         );
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (formData.patient_DateOfBirth && new Date(formData.patient_DateOfBirth) > new Date()) {
         toast.error("Date of birth cannot be in the future");
         return;
      }

      if (!formData.visitData.doctor) {
         toast.error("Please select a doctor");
         return;
      }

      if (!formData.printOption) {
         toast.error("Please select a print option");
         return;
      }

      try {
         await handleSave();
         // Print logic would go here
      } catch (error) {
         console.error("Submission failed:", error);
      }
   };

   const validateAgeInput = (value) => {
      const ageRegex = /^(\d+y-)?(\d+m-)?(\d+d)?$/;
      return ageRegex.test(value) || value === "";
   };

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;

      // Handle nested objects
      if (name.startsWith('patient_Guardian.')) {
         const field = name.split('.')[1];
         setFormData(prev => ({
            ...prev,
            patient_Guardian: {
               ...prev.patient_Guardian,
               [field]: value
            }
         }));
         return;
      }

      if (name.startsWith('visitData.')) {
         const field = name.split('.')[1];
         setFormData(prev => ({
            ...prev,
            visitData: {
               ...prev.visitData,
               [field]: type === 'checkbox' ? checked : value
            }
         }));

         // Recalculate total fee if discount changes
         if (field === 'discount') {
            const discountValue = parseFloat(value) || 0;
            const doctorFee = formData.doctorDetails.fee || 0;
            setFormData(prev => ({
               ...prev,
               visitData: {
                  ...prev.visitData,
                  discount: discountValue
               }
            }));
         }
         return;
      }

      if (name === "patient_DateOfBirth") {
         const age = calculateAge(value);
         setFormData(prev => ({
            ...prev,
            patient_DateOfBirth: value,
            patient_Age: age
         }));
         return;
      }

      if (name === "patient_Age") {
         if (validateAgeInput(value)) {
            setFormData(prev => ({
               ...prev,
               patient_Age: value
            }));
         }
         return;
      }

      // Handle CNIC formatting
      if (name === "patient_CNIC") {
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
            patient_CNIC: formattedValue
         }));
         return;
      }

      // Handle contact number formatting
      if (name === "patient_Guardian.guardian_Contact" || name === "patient_ContactNo") {
         const field = name === "patient_ContactNo" ? "patient_ContactNo" : "patient_Guardian.guardian_Contact";
         const cleanedValue = value.replace(/\D/g, '');
         let formattedValue = cleanedValue;
         if (cleanedValue.length > 4) {
            formattedValue = `${cleanedValue.substring(0, 4)}-${cleanedValue.substring(4, 11)}`;
         }
         formattedValue = formattedValue.substring(0, 12);

         if (field === "patient_ContactNo") {
            setFormData(prev => ({
               ...prev,
               patient_ContactNo: formattedValue
            }));
         } else {
            setFormData(prev => ({
               ...prev,
               patient_Guardian: {
                  ...prev.patient_Guardian,
                  guardian_Contact: formattedValue
               }
            }));
         }
         return;
      }

      // Update the rest of the fields
      setFormData(prev => ({
         ...prev,
         [name]: value
      }));
   };

   const calculateAge = (dobString) => {
      if (!dobString) return "";

      const dob = new Date(dobString);
      const today = new Date();

      if (dob > today) {
         return "Invalid date (future)";
      }

      let years = today.getFullYear() - dob.getFullYear();
      let months = today.getMonth() - dob.getMonth();
      let days = today.getDate() - dob.getDate();

      if (days < 0) {
         months--;
         const lastDayOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            0
         ).getDate();
         days += lastDayOfMonth;
      }

      if (months < 0) {
         years--;
         months += 12;
      }

      return `${years}y-${months}m-${days}d`;
   };

   const getFormattedDoctors = () => {
      if (!Array.isArray(doctorsList)) return [];

      return doctorsList.map(doc => ({
         id: doc._id,
         name: doc.user?.user_Name || '',
         gender: doc.doctor_Gender || "",
         qualification: Array.isArray(doc.doctor_Qualifications)
            ? doc.doctor_Qualifications.join(", ")
            : doc.doctor_Qualifications || "",
         fee: doc.doctor_Fee || 0,
         specialization: doc.doctor_Specialization || "",
         department: doc.doctor_Department || ""
      }));
   };

   const handleDoctorSelect = (selectedOption) => {
      if (selectedOption) {
         const doctorData = selectedOption.data;
         setFormData(prev => ({
            ...prev,
            visitData: {
               ...prev.visitData,
               doctor: doctorData.id
            },
            doctorDetails: {
               name: doctorData.name,
               gender: doctorData.gender,
               qualification: doctorData.qualification,
               fee: doctorData.fee,
               specialization: doctorData.specialization,
               department: doctorData.department
            }
         }));
      } else {
         setFormData(prev => ({
            ...prev,
            visitData: {
               ...prev.visitData,
               doctor: ""
            },
            doctorDetails: {
               name: "",
               gender: "",
               qualification: "",
               fee: 0,
               specialization: "",
               department: ""
            }
         }));
      }
   };

   // In usePatientForm.js - update the handleSearch function
   const handleSearch = async (searchTerm) => {
      if (!searchTerm.trim()) {
         toast.error("Please enter a search term");
         return [];
      }

      try {
         const result = await dispatch(searchPatients(searchTerm)).unwrap();
         return result || [];
      } catch (error) {
         console.error("Search error:", error);
         toast.error(error.payload || "Search failed");
         return [];
      }
   };

   // In your usePatientForm hook, update the handleVisitSelect function
   const handleVisitSelect = (visitId) => {
      console.log("Visit selected:", visitId);

      if (localSelectedPatient) {
         populateForm(localSelectedPatient, visitId);
         setSelectedVisitId(visitId);
         setShowVisitSelector(false);
         toast.success(`Visit selected for editing`);
      } else {
         toast.error("Patient data not available");
      }
   };

   const showVisitSelection = () => {
      setShowVisitSelector(true);
   }

   const handleSaveAndPrint = async (e) => {
      if (e) e.preventDefault();

      if (!formData.printOption) {
         toast.error("Please select a print option");
         return;
      }

      setIsSubmitting(true);

      try {
         // First save the data
         await handleSave(e);

         // Then print using the utility function
         setTimeout(() => {
            handlePrint(formData, formData.printOption);
         }, 500);

      } catch (error) {
         console.error("Save and print failed:", error);
         toast.error(error.message || "Save failed - not printing");
      } finally {
         setIsSubmitting(false);
      }
   };

   const handlePrintOnly = () => {
      if (!formData.printOption) {
         toast.error("Please select a print option");
         return;
      }

      try {
         handlePrint(formData, formData.printOption);
      } catch (error) {
         toast.error(error.message);
      }
   };

   return {
      isLoading,
      isSubmitting,
      formData,
      setFormData,
      handleChange,
      handleSave,
      handleSubmit,
      handleDoctorSelect,
      resetForm,
      doctorsStatus,
      getFormattedDoctors,
      mode,
      patientMRNo,
      validGenders,
      validBloodTypes,
      validMaritalStatuses,
      populateForm,
      handleSearch,
      selectedVisitId,
      showVisitSelector,
      handleVisitSelect,
      setShowVisitSelector,
      isFormDataReady,
      localSelectedPatient,
      showVisitSelection,
      selectedPatient,
      handleSaveAndPrint,
      handlePrint: handlePrintOnly,
   };
};