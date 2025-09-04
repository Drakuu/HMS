import React, { useState } from 'react';
import { toast } from 'react-toastify';
import PatientForm from './components/PatientForm';
import DoctorForm from './components/DoctorForm';
import PrintOptions from './components/PrintOptions';
import ActionButtons from './components/ActionButtons';
import PatientSearchBar from './components/PatientSearchBar';
import { usePatientForm } from '../../../hooks/usePatientForm';
import './actionbtns.css';

const NewOpd = ({ mode = "create" }) => {
    const {
        isLoading,
        isSubmitting,
        formData,
        handleChange,
        validGenders,
        validBloodTypes,
        validMaritalStatuses,
        handleSave,
        handleSubmit,
        handleDoctorSelect,
        doctorsStatus,
        getFormattedDoctors,
        mode: formMode,
        populateForm,
        handleSearch // Make sure this is exported from usePatientForm
    } = usePatientForm(mode);

    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const formTitle = formMode === "create"
        ? "New OPD Registration"
        : `Edit Patient - ${formData.patient_MRNo || 'Loading...'}`;
    const formDescription = formMode === "create"
        ? "Please fill in the patient details below"
        : "Edit the patient details below";

    // Enhanced search handler
    const handlePatientSearch = async (searchTerm) => {
        setIsSearching(true);
        try {
            const results = await handleSearch(searchTerm);
            setSearchResults(results);
            setShowSearchResults(true);

            if (!results || results.length === 0) {
                toast.info("No patients found with that search term");
            }
        } catch (error) {
            console.error("Search error:", error);
            toast.error("Search failed");
        } finally {
            setIsSearching(false);
        }
    };

    // Function to handle patient selection from search results
    const handlePatientSelect = (patient) => {
        populateForm(patient);
        setShowSearchResults(false);
        setSearchResults([]);
        toast.success(`Patient ${patient.patient_Name} selected`);
    };

    // Function to clear search results
    const clearSearch = () => {
        setShowSearchResults(false);
        setSearchResults([]);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

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

                {/* Patient Search Bar - Only show in create mode */}
                {formMode === "create" && (
                    <div className="px-6 pt-6">
                        <PatientSearchBar
                            onSearch={handlePatientSearch}
                            onClear={clearSearch}
                            isSearching={isSearching}
                        />
                    </div>
                )}

                {/* Search Results */}
                {showSearchResults && (
                    <div className="px-6 pb-6">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="p-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Search Results ({searchResults.length})
                                </h3>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {searchResults.map(patient => (
                                    <div
                                        key={patient._id}
                                        className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handlePatientSelect(patient)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-medium text-gray-900">
                                                    {patient.patient_Name}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    MR: {patient.patient_MRNo} |
                                                    Contact: {patient.patient_ContactNo} |
                                                    {patient.patient_CNIC && ` CNIC: ${patient.patient_CNIC}`}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">
                                                    {patient.totalVisits || 0} previous visits
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Last visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {searchResults.length > 0 && (
                                <div className="p-3 bg-gray-50 border-t border-gray-200">
                                    <button
                                        onClick={clearSearch}
                                        className="text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        Close results
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Patient Information Form */}
                        <PatientForm
                            formData={formData}
                            handleChange={handleChange}
                            mode={formMode}
                            validGenders={validGenders}
                            validBloodTypes={validBloodTypes}
                            validMaritalStatuses={validMaritalStatuses}
                        />

                        {/* Doctor Information Section */}
                        <DoctorForm
                            formData={formData}
                            handleChange={handleChange}
                            doctorsStatus={doctorsStatus}
                            getFormattedDoctors={getFormattedDoctors}
                            onDoctorSelect={handleDoctorSelect}
                        />
                    </div>

                    <PrintOptions
                        formData={formData}
                        handleChange={handleChange}
                    />

                    <ActionButtons
                        mode={formMode}
                        isSubmitting={isSubmitting}
                        onSave={handleSave}
                        onSubmit={handleSubmit}
                    />
                </form>
            </div>
        </div>
    );
};

export default NewOpd;