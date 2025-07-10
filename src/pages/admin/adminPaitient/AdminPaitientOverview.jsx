import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PatientOverview = () => {
  const API_URL =import.meta.env.VITE_REACT_APP_API_UR;

  const navigate = useNavigate();
  const [patients, setPatients] = useState([]); // Initial state is an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jwtLoginToken, setJwtLoginToken] = useState(null);

  // Retrieve the JWT token from local storage
  useEffect(() => {
    const token = localStorage.getItem("jwtLoginToken"); // Correct key for token
    console.log("Retrieved Token: ", token); // Log token retrieval
    setJwtLoginToken(token); // Store token in state
  }, []);

  // Fetch patients from API
  useEffect(() => {
    const fetchPatients = async () => {
      console.log("Fetching patients...");

      if (!jwtLoginToken) {
        setError("Unauthorized: No token found");
        setLoading(false);
        return;
      }

      try {
        console.log("Sending request to API with token:", jwtLoginToken);
        const response = await axios.get(`${API_URL}/patient/get-patients`, {
          headers: {
            Authorization: `Bearer ${jwtLoginToken}`,
          },
        });

        console.log("API Response: ", response.data); // Log API response

        // Validate and set patients array
        const patientData = response.data?.information?.patients;
        if (Array.isArray(patientData)) {
          setPatients(patientData);
        } else {
          console.error("Patients data is not an array:", patientData);
          setPatients([]); // Default to an empty array if the data is invalid
        }
      } catch (error) {
        console.error("API Error: ", error); // Log any API errors
        setError(error.response?.data?.message || "Failed to fetch patients");
      } finally {
        setLoading(false); // Set loading to false after request completes
      }
    };

    if (jwtLoginToken) {
      fetchPatients();
    }
  }, [jwtLoginToken]);

  const handleAddPatient = () => {
    navigate("/addnew");
  };

  return (
    <div className="p-">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-sky-600">Patient Overview</h1>
        <button
          onClick={handleAddPatient}
          className="flex items-center bg-sky-300 text-black px-4 py-2 rounded shadow hover:bg-sky-600"
        >
          <span className="mr-2 text-lg font-bold">+</span> Add New Patient
        </button>
      </div>

      {/* Loading, error, or patient list */}
      {loading ? (
        <p className="text-center text-sky-600">Loading patients...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-sky-300 text-black">
                <th className="py-3 px-4 text-left">Paitient MR.NO</th>
                <th className="py-3 px-4 text-left">Paitient Name</th>
                <th className="py-3 px-4 text-left">Diseases</th>
                <th className="py-3 px-4 text-left">Doctor Name</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">PaidAmount</th>

              </tr>
            </thead>
            <tbody>
              {Array.isArray(patients) && patients.length > 0 ? (
                patients.map((patient, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-primary-100" : "bg-white"}>
                    <td className="py-3 px-4"> {patient.patient_Room}</td>
                    <td className="py-3 px-4">{patient.patient_Room}</td>
                    <td className="py-3 px-4">{patient.patienage}</td>
                    <td className="py-3 px-4">{patient.patiendate}</td>
                    <td className="py-3 px-4">{patient.patienreasont}</td>
                    <td className="py-3 px-4">{patient.patiendoctor}</td>
                    <td className="py-3 px-4">{patient.patienbedType}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-sm font-semibold ${
                          patient.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : patient.status === "Inactive"
                            ? "bg-red-100 text-red-700"
                            : "bg-primary-100 text-primary-700"
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientOverview;
