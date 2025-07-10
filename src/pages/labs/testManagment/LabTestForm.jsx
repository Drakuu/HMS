import React, { useState } from 'react';
import { FormSection, FormGrid } from '../../../components/common/FormSection';
import { InputField, TextAreaField, RadioGroup } from '../../../components/common/FormFields'
import { Button, ButtonGroup } from './../../../components/common/Buttons'
import { AiOutlinePrinter, AiOutlineFileText, AiOutlineSave, } from "react-icons/ai";

const AddTest = ({ mode = "create" }) => {
    const [formData, setFormData] = useState({
        testName: '',
        testCode: '',
        description: '',
        instructions: '',
        testPrice: '',
        requiresFasting: false,
        reportDeliveryTime: '',
        normalRange: '',
        units: '',
        urgencyLevel: '',
        performedByLab: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [additionalFields, setAdditionalFields] = useState([]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Submitted:', formData);
        // TODO: API call or backend logic here
    };

    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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
            navigate('/OPD/manage');
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

    const AddFieldButton = () => (
        <div className="mt-2">
            <button
                type="button"
                onClick={() =>
                    setAdditionalFields(prev => [
                        ...prev,
                        { normalRange: '', units: '', urgencyLevel: '' }
                    ])
                }
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                + Add Field
            </button>

        </div>
    );


    const ActionButtons = () => (
        <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button
                variant="secondary"
                onClick={() => navigate('/OPD/manage')}
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
                                <h1 className="text-3xl font-bold">Lab Test</h1>
                                <p className="text-primary-100 mt-1">DEF</p>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="grid grid-cols lg:grid-cols-0 gap-4">
                    {/* Patient Information Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <FormSection title="Patient Information">

                            <FormGrid>
                                <InputField name="testName" label="Test Name" icon="idCard" value={formData.testName} onChange={handleChange} placeholder="Enter Test Name" />

                                <InputField name="testCode" label="Test Code" icon="user" value={formData.testCode} onChange={handleChange} placeholder="Enter test Code" required />

                                <TextAreaField name='description' label='Description' value={formData.description} onChange={handleChange} placeholder='Enter Description' />

                                <TextAreaField name='instruction' label='Instruction' value={formData.instructions} onChange={handleChange} placeholder='Write Instructions' />

                                <InputField name="testPrice" label="Test Price" icon="number" type="number" inputMode="numeric" value={formData.testPrice}
                                    onChange={handleChange} />

                                <RadioGroup name="requireFasting" label="Requires Fasting" icon="idCard" value={formData.requiresFasting} type='boolean'
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        requiresFasting: e.target.value === 'true'
                                    })
                                    }
                                    required
                                    options={[
                                        { label: 'Yes', value: 'true' },
                                        { label: 'No', value: 'false' }
                                    ]} />

                                <InputField name="reportDelivaryTime" label="Report Delivery Time" type='date' icon="calenundar" value={formData.age} onChange={handleChange} />

                                <InputField name="performedByLab" label="Performed By Lab" icon="team" type="select" value={formData.performedByLab} onChange={handleChange} options={["Lab A", "Lab B", "Lab C"]} />

                            </FormGrid>
                        </FormSection>

                        <div>
                            <div>
                                <AddFieldButton />
                            </div>
                            {additionalFields.map((field, index) => (
                                <div className='grid grid-cols-3 gap-3 mt-4'>
                                    <InputField
                                        name={`normalRange-${index}`}
                                        label="Normal Range"
                                        icon="number"
                                        value={field.normalRange}
                                        onChange={(e) => {
                                            const updated = [...additionalFields];
                                            updated[index].normalRange = e.target.value;
                                            setAdditionalFields(updated);
                                        }}
                                    />
                                    <InputField
                                        name={`units-${index}`}
                                        label="Units"
                                        icon="number"
                                        value={field.units}
                                        onChange={(e) => {
                                            const updated = [...additionalFields];
                                            updated[index].units = e.target.value;
                                            setAdditionalFields(updated);
                                        }}
                                    />
                                    <InputField
                                        name={`urgencyLevel-${index}`}
                                        label="Urgency Level"
                                        icon="alert-triangle"
                                        type="select"
                                        options={["Low", "Medium", "High"]}
                                        value={field.urgencyLevel}
                                        onChange={(e) => {
                                            const updated = [...additionalFields];
                                            updated[index].urgencyLevel = e.target.value;
                                            setAdditionalFields(updated);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <ActionButtons />
                    </form>
                </div>
            </div>
        </div>
    );
}
export default AddTest;