import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PatientForm = () => {
  const API_URL =import.meta.env.VITE_REACT_APP_API_UR;

  const [formData, setFormData] = useState({
    patient_MRNo: "",
    patient_Name: "",
    patient_Guardian: {
      guardian_Type: "",
      guardian_Name: "",
    },
    patient_CNIC: "",
    patient_Gender: "",
    Patient_Age: "",
    patient_DateOfBirth: "",
    patient_Address: "",
    patient_HospitalInformation: {
      patient_Type: "",
      Department: "",
      Doctor_Name: "",
      Doctor_Fee: "",
      Token: "",
      amount_Status: "Unpaid",
    },
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    // Check if the field belongs to `patient_Guardian`
    if (name === "guardian_Type" || name === "guardian_Name") {
      setFormData((prev) => ({
        ...prev,
        patient_Guardian: {
          ...prev.patient_Guardian,
          [name]: value,
        },
      }));
    } else if (name.startsWith("hospital_")) {
      setFormData((prev) => ({
        ...prev,
        patient_HospitalInformation: {
          ...prev.patient_HospitalInformation,
          [name.replace("hospital_", "")]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const jwtLoginToken = localStorage.getItem("jwtLoginToken"); // Retrieve token
  
    if (!jwtLoginToken) {
      console.error("No token found. Please log in.");
      return;
    }
  
    try {
      const response = await axios.post(
        `${API_URL}/patient/create-patient`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${jwtLoginToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Patient created successfully:", response.data);
      navigate("/adminpaitient");
    } catch (error) {
      console.error("Error creating patient:", error.response?.data || error);
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-lg text-center font-bold mb-10">Patient Form</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MR No */}
        <div className="mb-4">
          <label className="block font-medium">MR No:</label>
          <input
            type="text"
            name="patient_MRNo"
            value={formData.patient_MRNo}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block font-medium">Name:</label>
          <input
            type="text"
            name="patient_Name"
            value={formData.patient_Name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Guardian Type */}
        <div className="mb-4">
          <label className="block font-medium">Guardian Type:</label>
          <input
            type="text"
            name="guardian_Type"
            value={formData.patient_Guardian.guardian_Type}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Guardian Name */}
        <div className="mb-4">
          <label className="block font-medium">Guardian Name:</label>
          <input
            type="text"
            name="guardian_Name"
            value={formData.patient_Guardian.guardian_Name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* CNIC */}
        <div className="mb-4">
          <label className="block font-medium">CNIC:</label>
          <input
            type="text"
            name="patient_CNIC"
            value={formData.patient_CNIC}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Gender */}
        <div className="mb-4">
          <label className="block font-medium">Gender:</label>
          <input
            type="text"
            name="patient_Gender"
            value={formData.patient_Gender}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Age */}
        <div className="mb-4">
          <label className="block font-medium">Age:</label>
          <input
            type="text"
            name="Patient_Age"
            value={formData.Patient_Age}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Date of Birth */}
        <div className="mb-4">
          <label className="block font-medium">Date of Birth:</label>
          <input
            type="date"
            name="patient_DateOfBirth"
            value={formData.patient_DateOfBirth}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Address */}
        <div className="mb-4 md:col-span-2">
          <label className="block font-medium">Address:</label>
          <input
            type="text"
            name="patient_Address"
            value={formData.patient_Address}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Patient Type */}
        <div className="mb-4">
          <label className="block font-medium">Patient Type:</label>
          <input
            type="text"
            name="hospital_patient_Type"
            value={formData.patient_HospitalInformation.patient_Type}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Department */}
        <div className="mb-4">
          <label className="block font-medium">Department:</label>
          <input
            type="text"
            name="hospital_Department"
            value={formData.patient_HospitalInformation.Department}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Doctor Name */}
        <div className="mb-4">
          <label className="block font-medium">Doctor Name:</label>
          <input
            type="text"
            name="hospital_Doctor_Name"
            value={formData.patient_HospitalInformation.Doctor_Name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Doctor Fee */}
        <div className="mb-4">
          <label className="block font-medium">Doctor Fee:</label>
          <input
            type="number"
            name="hospital_Doctor_Fee"
            value={formData.patient_HospitalInformation.Doctor_Fee}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Token */}
        <div className="mb-1">
          <label className="block font-medium">Token:</label>
          <input
            type="number"
            name="hospital_Token"
            value={formData.patient_HospitalInformation.Token}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Amount Status */}
        <div className="mb-2">
          <label className="block font-medium">Amount Status:</label>
          <select
            name="hospital_amount_Status"
            value={formData.patient_HospitalInformation.amount_Status}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="bg-primary-600 text-white px-6 py-2 mt-4 rounded shadow hover:bg-primary-700"
      >
        Submit
      </button>
    </form>
  );
};

export default PatientForm;
