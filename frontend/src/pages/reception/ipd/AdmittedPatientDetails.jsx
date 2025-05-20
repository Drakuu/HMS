import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getIpdPatientByMrno } from '../../../features/ipdPatient/IpdPatientSlice';

const PatientDetails = () => {
    const { mrno } = useParams();
    const dispatch = useDispatch();
    const { currentPatient, status, error } = useSelector(state => state.ipdPatient);

    useEffect(() => {
        if (mrno) {
            dispatch(getIpdPatientByMrno(mrno));
        }
    }, [mrno, dispatch]);

    if (status === 'loading') {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>;
    }
    
    if (status === 'failed') {
        return <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            </div>
        </div>;
    }
    
    if (!currentPatient) {
        return <div className="text-center py-8 text-gray-500">No patient data found</div>;
    }
    

    // Calculate age safely
    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Patient Details</h1>

            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-2">
                        <p><span className="font-medium">Name:</span> {currentPatient?.patient_Name}</p>
                        <p><span className="font-medium">MR Number:</span> {currentPatient?.patient_MRNo}</p>
                        <p><span className="font-medium">Age:</span> {calculateAge(currentPatient?.patient_DateOfBirth)} years</p>
                        <p><span className="font-medium">Gender:</span> {currentPatient?.patient_Gender}</p>
                        <p><span className="font-medium">CNIC:</span> {currentPatient?.patient_CNIC || 'N/A'}</p>
                    </div>

                    {/* Status and Admission Info */}
                    <div className="space-y-2">
                        <p>
                            <span className="font-medium">Status:</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                currentPatient?.status === 'Admitted' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {currentPatient?.status}
                            </span>
                        </p>
                        <p><span className="font-medium">Admission Date:</span> 
                            {currentPatient?.admission_Details?.admission_Date 
                                ? new Date(currentPatient?.admission_Details.admission_Date).toLocaleString() 
                                : 'N/A'}
                        </p>
                        <p><span className="font-medium">Ward Type:</span> {currentPatient?.ward_Information?.ward_Type || 'N/A'}</p>
                        <p><span className="font-medium">Ward No:</span> {currentPatient?.ward_Information?.ward_No || 'N/A'}</p>
                        <p><span className="font-medium">Bed No:</span> {currentPatient?.ward_Information?.bed_No || 'N/A'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Guardian Information */}
                    <div className="space-y-2">
                        <p><span className="font-medium">Guardian Name:</span> {currentPatient?.patient_Guardian?.guardian_Name || 'N/A'}</p>
                        <p><span className="font-medium">Guardian Relation:</span> {currentPatient?.patient_Guardian?.guardian_Type || 'N/A'}</p>
                        <p><span className="font-medium">Guardian Contact:</span> {currentPatient?.patient_Guardian?.guardian_Contact || 'N/A'}</p>
                    </div>

                    {/* Address and Financials */}
                    <div className="space-y-2">
                        <p><span className="font-medium">Address:</span> {currentPatient?.patient_Address || 'N/A'}</p>
                        <p><span className="font-medium">Admission Fee:</span> {currentPatient?.financials?.admission_Fee || 'N/A'}</p>
                        <p><span className="font-medium">Daily Charges:</span> {currentPatient?.financials?.daily_Charges || 'N/A'}</p>
                        <p><span className="font-medium">Discount:</span> {currentPatient?.financials?.discount || 'N/A'}</p>
                        <p><span className="font-medium">Total Charges:</span> {currentPatient?.financials?.total_Charges || 'N/A'}</p>
                        <p><span className="font-medium">Payment Status:</span> {currentPatient?.financials?.payment_Status || 'N/A'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Diagnosis and Doctor Information */}
                    <div className="space-y-2">
                        <p><span className="font-medium">Diagnosis:</span> {currentPatient?.admission_Details?.diagnosis || 'N/A'}</p>
                        <p><span className="font-medium">Admitting Doctor:</span> {currentPatient?.admission_Details?.admitting_Doctor || 'N/A'}</p>
                    </div>

                    {/* Discharge Date */}
                    <div className="space-y-2">
                        <p><span className="font-medium">Discharge Date:</span> 
                            {currentPatient?.admission_Details?.discharge_Date 
                                ? new Date(currentPatient?.admission_Details.discharge_Date).toLocaleString() 
                                : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetails;