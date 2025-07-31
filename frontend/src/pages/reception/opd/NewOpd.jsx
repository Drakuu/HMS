import React, { useState, useEffect } from "react";
import {
    AiOutlinePrinter,
    AiOutlineFileText,
    AiOutlineSave,
} from "react-icons/ai";
import { FaUserMd } from "react-icons/fa";
import { toast } from 'react-toastify';
import ReactDOMServer from 'react-dom/server';
import PrintSlip from "./PrintSlip";
import PrintA4 from "./PrintA4";
import PrintPdf from "./PrintPdf";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllDoctors } from "../../../features/doctor/doctorSlice";
import { createPatient, fetchPatientByMrNo, updatePatient } from "../../../features/patient/patientSlice";
import { selectSelectedPatient } from '../../../features/patient/patientSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { InputField, RadioGroup } from '../../../components/common/FormFields'
import { FormSection, FormGrid } from '../../../components/common/FormSection';
import { Button, ButtonGroup } from '../../../components/common/Buttons';
import { getRoleRoute } from '../../../utils/getRoleRoute';

const NewOpd = ({ mode = "create" }) => {
    const dispatch = useDispatch();
    const { patientMRNo } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { doctors: doctorsList, status: doctorsStatus } = useSelector((state) => state.doctor);
    const selectedPatient = useSelector(selectSelectedPatient);
    // At the top of your component (outside the NewOpd function)
    const initialFormState = {
        patientMRNo: "",
        patientName: "",
        patientContactNo: "",
        guardianName: "",
        guardianRelation: "",
        guardianContact: "",
        dob: "",
        cnic: "",
        age: "",
        address: "",
        gender: "",
        maritalStatus: "",
        bloodGroup: "",
        doctorName: "",
        referredBy: "",
        doctorGender: "",
        doctorQualification: "",
        doctorFee: "",
        discount: "",
        totalFee: "",
        doctorSpecialization: "",
        doctorDepartment: "",
        printThermalSlip: false,
        printA4: false,
        printPdf: false,
        printOption: "",
    };
    const [formData, setFormData] = useState(initialFormState);

    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    // Fetch doctors when component mounts
    useEffect(() => {
        dispatch(fetchAllDoctors());
    }, [dispatch]);

    // Update your fetch effect
    useEffect(() => {
        if (mode === "edit" && patientMRNo) {
            setIsLoading(true);
            dispatch(fetchPatientByMrNo(patientMRNo))
                .unwrap()
                .then((patientData) => {
                    populateForm(patientData); // Populate form after successful fetch
                })
                .catch((err) => {
                    console.error("Error fetching patient:", err);
                    toast.error("Failed to load patient data");
                    navigate(getRoleRoute(`OPD/manage`));
                })
                .finally(() => setIsLoading(false));
        }
    }, [mode, patientMRNo, dispatch, navigate]);

    // Populate form when selectedPatient changes (edit mode)
    useEffect(() => {
        if (mode === "edit" && selectedPatient) {
            setFormData({
                patientMRNo: selectedPatient.patient_MRNo,
                patientName: selectedPatient.patient_Name,
                patientContactNo: selectedPatient.patient_ContactNo,
                guardianName: selectedPatient.patient_Guardian?.guardian_Name || "",
                guardianRelation: selectedPatient.patient_Guardian?.guardian_Relation || "",
                guardianContact: selectedPatient.patient_Guardian?.guardian_Contact || "",
                dob: selectedPatient.patient_DateOfBirth,
                cnic: selectedPatient.patient_CNIC,
                age: selectedPatient.patient_Age,
                address: selectedPatient.patient_Address,
                gender: selectedPatient.patient_Gender,
                maritalStatus: selectedPatient.patient_MaritalStatus,
                bloodGroup: selectedPatient.patient_BloodType,
                doctorName: selectedPatient.patient_HospitalInformation?.doctor_Name || "",
                referredBy: selectedPatient.patient_HospitalInformation?.referredBy || "",
                doctorGender: selectedPatient.patient_HospitalInformation?.gender || "",
                doctorQualification: selectedPatient.patient_HospitalInformation?.qualification || "",
                doctorFee: selectedPatient.patient_HospitalInformation?.doctor_Fee || "",
                discount: selectedPatient.patient_HospitalInformation?.discount || "",
                totalFee: selectedPatient.patient_HospitalInformation?.total_Fee || "",
                doctorSpecialization: selectedPatient.patient_HospitalInformation?.doctor_Specialization || "",
                doctorDepartment: selectedPatient.patient_HospitalInformation?.doctor_Department || "",
                printThermalSlip: false,
                printA4: false,
                printPdf: false,
                printOption: "",
            });
        }
    }, [selectedPatient, mode]);

    // Transform doctor data for select options
    const getFormattedDoctors = () => {
        if (!Array.isArray(doctorsList)) return [];

        return doctorsList.map(doc => ({
            id: doc.doctor_Identifier,
            name: doc.user.user_Name,
            cnic: doc.doctor_CNIC,
            gender: doc.doctor_Gender || "Male",
            qualification: Array.isArray(doc.doctor_Qualifications)
                ? doc.doctor_Qualifications.join(", ")
                : doc.doctor_Qualifications,
            fee: doc.doctor_Fee || 0,
            specialization: doc.doctor_Specialization,
            department: doc.doctor_Department
        }));
    };

    const populateForm = (patientData) => {
        if (!patientData) return;

        setFormData({
            patientMRNo: patientData.patient_MRNo || "",
            patientName: patientData.patient_Name || "",
            patientContactNo: patientData.patient_ContactNo || "",
            guardianName: patientData.patient_Guardian?.guardian_Name || "",
            guardianRelation: patientData.patient_Guardian?.guardian_Relation || "",
            guardianContact: patientData.patient_Guardian?.guardian_Contact || "",
            dob: patientData.patient_DateOfBirth || "",
            cnic: patientData.patient_CNIC || "",
            age: patientData.patient_Age || "",
            address: patientData.patient_Address || "",
            gender: patientData.patient_Gender || "",
            maritalStatus: patientData.patient_MaritalStatus || "",
            bloodGroup: patientData.patient_BloodType || "",
            doctorName: patientData.patient_HospitalInformation?.doctor_Name || "",
            referredBy: patientData.patient_HospitalInformation?.referredBy || "",
            doctorGender: patientData.patient_HospitalInformation?.gender || "",
            doctorQualification: patientData.patient_HospitalInformation?.qualification || "",
            doctorFee: patientData.patient_HospitalInformation?.doctor_Fee || "",
            discount: patientData.patient_HospitalInformation?.discount || "",
            totalFee: patientData.patient_HospitalInformation?.total_Fee || "",
            doctorSpecialization: patientData.patient_HospitalInformation?.doctor_Specialization || "",
            doctorDepartment: patientData.patient_HospitalInformation?.doctor_Department || "",
            printThermalSlip: false,
            printA4: false,
            printPdf: false,
            printOption: "",
        });
    };

    useEffect(() => {
        if (mode === "edit" && selectedPatient) {
            populateForm(selectedPatient);
        }
    }, [selectedPatient, mode]);

    const resetForm = () => {
        setFormData(initialFormState);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            patient_Name: formData.patientName,
            patient_ContactNo: formData.patientContactNo,
            patient_Guardian: {
                guardian_Relation: formData.guardianRelation,
                guardian_Name: formData.guardianName,
                guardian_Contact: formData.guardianContact,
            },
            patient_CNIC: formData.cnic,
            patient_Gender: formData.gender,
            patient_Age: formData.age,
            patient_DateOfBirth: formData.dob,
            patient_Address: formData.address,
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

        try {
            if (mode === "create") {
                await dispatch(createPatient(payload)).unwrap();
                toast.success("Patient created successfully!");
            } else {
                if (!formData.patientMRNo) {
                    throw new Error("MR Number is required");
                }

                await dispatch(updatePatient({
                    mrNo: formData.patientMRNo,
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

        // Final validation for future date (in case someone bypasses the UI)
        if (formData.dob && new Date(formData.dob) > new Date()) {
            toast.error("Date of birth cannot be in the future");
            return;
        }

        // Rest of your submission logic
        if (!formData.printOption) {
            toast.error("Please select a print option");
            return;
        }

        try {
            await handleSave(e);
            // Only proceed with printing if save was successful
            if (formData.printOption === "thermal") handlePrintSlip();
            if (formData.printOption === "a4") handlePrintA4();
            if (formData.printOption === "pdf") handlePrintPdf();
        } catch (error) {
            console.error("Submission failed:", error);
        }
    };

    const handlePrintSlip = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(ReactDOMServer.renderToString(<PrintSlip formData={formData} />));
        printWindow.document.close();
    };

    const handlePrintA4 = () => {
        const printWindow = window.open('', '_blank');
        const html = `
          <!DOCTYPE html>
          ${ReactDOMServer.renderToString(<PrintA4 formData={formData} />)}
        `;

        printWindow.document.write(html);
        printWindow.document.close();

        const printAfterLoad = () => {
            printWindow.print();
            printWindow.onafterprint = () => printWindow.close();
        };

        if (printWindow.document.readyState === 'complete') {
            setTimeout(printAfterLoad, 500);
        } else {
            printWindow.addEventListener('load', () => {
                setTimeout(printAfterLoad, 500);
            }, { once: true });
        }
    };

    const handlePrintPdf = () => {
        const pdfWindow = window.open('', '_blank');
        pdfWindow.document.write(`
      <!DOCTYPE html>
      ${ReactDOMServer.renderToString(<PrintPdf formData={formData} />)}
    `);
        pdfWindow.document.close();
    };

    const validateAgeInput = (value) => {
        // Simple regex to match the y-m-d format
        const ageRegex = /^(\d+y-)?(\d+m-)?(\d+d)?$/;
        return ageRegex.test(value) || value === "";
    };

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

        if (name === "age") {
            if (validateAgeInput(value)) {
                setFormData(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
            return;
        }

        // Handle CNIC formatting
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

        // Handle guardian contact or mobile number formatting
        if (name === "guardianContact" || name === "patientContactNo") {
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

        // Update the rest of the fields
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Special case for doctor info auto-population
        if (name === "doctor") {
            const selectedOption = e.target.options[e.target.selectedIndex];
            if (selectedOption.value) {
                const doctorData = JSON.parse(selectedOption.dataset.doctor);
                setFormData(prev => ({
                    ...prev,
                    doctorName: doctorData.name,
                    doctorGender: doctorData.gender,
                    doctorQualification: doctorData.qualification,
                    doctorFee: doctorData.fee,
                    doctorSpecialization: doctorData.specialization,
                    doctorDepartment: doctorData.department,
                    totalFee: doctorData.fee - (prev.discount || 0)
                }));
            }
            return;
        }


        // Handle discount calculation
        if (name === "discount") {
            const discountValue = parseFloat(value) || 0;
            setFormData(prev => ({
                ...prev,
                discount: discountValue,
                totalFee: (prev.doctorFee || 0) - discountValue
            }));
        }
    };

    const calculateAge = (dobString) => {
        if (!dobString) return "";

        const dob = new Date(dobString);
        const today = new Date();

        // Check if DOB is in the future
        if (dob > today) {
            return "Invalid date (future)";
        }

        // Calculate years
        let years = today.getFullYear() - dob.getFullYear();

        // Calculate months
        let months = today.getMonth() - dob.getMonth();

        // Calculate days
        let days = today.getDate() - dob.getDate();

        // Adjust for negative months or days
        if (days < 0) {
            months--;
            // Get the last day of the previous month
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

    // At the top of your return statement
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    const formTitle = mode === "create"
        ? "New OPD Registration"
        : `Edit Patient - ${formData.patientMRNo}`;
    const formDescription = mode === "create"
        ? "Please fill in the patient details below"
        : "Edit the patient details below";

    // Doctor select component (since it has special logic)
    const DoctorSelect = () => (
        <div className="space-y-1 mb-6">
            <label className="block text-sm font-medium text-gray-700">Consulting Doctor</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserMd className="text-primary-600" />
                </div>
                <select
                    name="doctor"
                    value={formData.doctorName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 appearance-none"
                    required
                    disabled={doctorsStatus === 'loading'}
                >
                    <option value="">Select Doctor</option>
                    {doctorsStatus === 'loading' ? (
                        <option>Loading doctors...</option>
                    ) : (
                        getFormattedDoctors().map(doctor => (
                            <option key={doctor.id}
                                value={`${doctor.name}`}
                                data-doctor={JSON.stringify(doctor)}
                            >
                                {doctor.name} ({doctor.department}) ({doctor.specialization})
                            </option>
                        ))
                    )}
                </select>
            </div>
        </div>
    );

    // Action buttons component
    const ActionButtons = () => (
        <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button
                variant="secondary"
                onClick={() => navigate('/receptionist/OPD/manage')}
            >
                Cancel
            </Button>

            <ButtonGroup>
                <Button
                    variant="success"
                    onClick={handleSave}
                    isSubmitting={isSubmitting}
                    icon={AiOutlineSave}
                >
                    {isSubmitting ? 'Saving...' : mode === "create" ? 'Save Only' : 'Update Only'}
                </Button>
                <Button
                    onClick={handleSubmit}
                    isSubmitting={isSubmitting}
                    icon={AiOutlinePrinter}
                >
                    {isSubmitting ? 'Processing...' : mode === "create" ? 'Save & Print' : 'Update & Print'}
                </Button>
            </ButtonGroup>
        </div>
    );

    return (
        <div className="">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-primary-600 rounded-md text-white px-6 py-8 shadow-md">
                    <div className="max-w-9xl mx-auto">
                        <div className="flex items-center">
                            <div className="h-12 w-1 bg-primary-300 mr-4 rounded-full"></div>
                            <div>
                                <h1 className="text-3xl font-bold">{formTitle}</h1>
                                <p className="text-primary-100 mt-1">{formDescription}</p>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Patient Information Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <FormSection title="Patient Information">

                            <FormGrid>
                                <InputField name="patientMRNo" label="MR Number" icon="idCard" value={formData.patientMRNo} onChange={handleChange} placeholder="Auto-generated MR Number" readOnly />

                                <InputField name="patientName" label="Patient Name" icon="user" value={formData.patientName} onChange={handleChange} placeholder="Enter Patient Name" required />

                                <InputField name="guardianName" label="Guardian Name" icon="team" value={formData.guardianName} onChange={handleChange} placeholder="Enter Guardian Name" required />

                                <InputField name="guardianRelation" label="Guardian Relation" icon="team" type="select" value={formData.guardianRelation} onChange={handleChange} options={["Father", "Mother", "Sibling", "Spouse", "Uncle", "Aunt", "Grandfather", "Grandmother", "Other"]} placeholder="Select Relation" />

                                <InputField name="dob" label="Date of Birth" icon="calendar" type="date" value={formData.dob} max={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        const selectedDate = new Date(e.target.value); const today = new Date();
                                        if (selectedDate > today) { toast.error("Date of birth cannot be in the future"); setFormData(prev => ({ ...prev, dob: "", age: "" })); return; } handleChange(e)
                                    }} />

                                <InputField name="cnic" label="CNIC Number" icon="idCard" value={formData.cnic} onChange={handleChange} placeholder="XXXXX-XXXXXXX-X" required />

                                <InputField name="age" label="Age" icon="number" value={formData.age} onChange={handleChange} placeholder="Age will auto-calculate" readOnly />

                                <InputField name="patientContactNo" label="Patient Contact" icon="number" type="tel" value={formData.patientContactNo} onChange={handleChange} placeholder="03XX-XXXXXXX" required />

                                <InputField name="guardianContact" label="Guardian Contact" icon="number" type="tel" value={formData.guardianContact} onChange={handleChange} placeholder="03XX-XXXXXXX" />

                                <InputField name="address" label="Address" icon="home" value={formData.address} onChange={handleChange} placeholder="Enter Full Address" fullWidth required />

                                <InputField name="gender" label="Gender" icon="man" type="select" value={formData.gender} onChange={handleChange} options={["Female", "Male", "Other"]} />

                                <InputField name="maritalStatus" label="Marital Status" icon="ring" type="select" value={formData.maritalStatus} onChange={handleChange} options={["Single", "Married", "Divorced", "Widowed"]} />

                                <InputField name="bloodGroup" label="Blood Group" icon="heartbeat" type="select" value={formData.bloodGroup} onChange={handleChange} options={bloodGroups} />

                                <InputField name="referredBy" label="Referred By" icon="health" value={formData.referredBy} onChange={handleChange} placeholder="Enter Referral Name (if any)" fullWidth />
                            </FormGrid>
                        </FormSection>
                    </form>

                    {/* Doctor Information Section */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <FormSection title="Doctor Information">
                            <DoctorSelect />

                            <FormGrid className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Gender" icon="man" value={formData.doctorGender} readOnly />

                                <InputField label="Qualification" icon="graduation" value={formData.doctorQualification} readOnly />

                                <InputField label="Department" icon="work" value={formData.doctorDepartment} readOnly />

                                <InputField label="Specialization" icon="work" value={formData.doctorSpecialization} readOnly />

                                <InputField label="Consultation Fee" icon="dollar" value={formData.doctorFee ? `Rs. ${formData.doctorFee}` : ""} readOnly />

                                <InputField name="discount" label="Discount" icon="discount" type="number" value={formData.discount} onChange={handleChange} placeholder="Enter discount" min="0" max={formData.doctorFee || 0} />

                                <InputField label="Total Fee" icon="dollar" value={formData.totalFee ? `Rs. ${formData.totalFee}` : ""} readOnly className="font-semibold" />
                            </FormGrid>
                        </FormSection>

                        <div className="space-y-4 border-t pt-4 mb-6">
                            <RadioGroup name="printOption" label="Print Options" value={formData.printOption} onChange={handleChange}
                                options={[
                                    { value: "thermal", label: "Thermal Slip", icon: AiOutlinePrinter },
                                    { value: "a4", label: "A4 Form", icon: AiOutlineFileText },
                                    { value: "pdf", label: "PDF", icon: AiOutlineFileText }
                                ]}
                            />
                        </div>

                        <ActionButtons />
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewOpd;