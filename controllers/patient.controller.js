const hospitalModel = require("../models/index.model");
const utils = require("../utils/utilsIndex");
const generateUniqueToken = require('../utils/generateUniqueToken'); // Import the updated generateUniqueToken function

const createPatient = async (req, res) => {
  try {
    const {
      patient_Name,
      patient_ContactNo,
      patient_Guardian,
      patient_CNIC,
      patient_Gender,
      patient_Age,
      patient_DateOfBirth,
      patient_Address,
      patient_HospitalInformation,
      patient_BloodType,
      patient_MaritalStatus,
    } = req.body;
    // Use current date if not specified
    const currentDate = new Date().toISOString().split('T')[0];
    const patient_MRNo = await utils.generateUniqueMrNo(currentDate);
    const token = await generateUniqueToken(currentDate);

    const newPatient = await hospitalModel.Patient.create({
      patient_MRNo,
      patient_Name,
      patient_ContactNo,
      patient_Guardian: {
        guardian_Relation: patient_Guardian?.guardian_Relation || "",
        guardian_Name: patient_Guardian?.guardian_Name || "",
        guardian_Contact: patient_Guardian?.guardian_Contact || "",
      },
      patient_CNIC,
      patient_Gender,
      patient_Age,
      patient_DateOfBirth,
      patient_Address,
      patient_HospitalInformation: {
        doctor_Name: patient_HospitalInformation?.doctor_Name || "",
        doctor_Department: patient_HospitalInformation?.doctor_Department || "",
        doctor_Specialization: patient_HospitalInformation?.doctor_Specialization || "",
        doctor_Fee: patient_HospitalInformation?.doctor_Fee || 0,
        discount: patient_HospitalInformation?.discount || 0,
        total_Fee: patient_HospitalInformation?.total_Fee || 0, // ✅ fixed case
        qualification: patient_HospitalInformation?.qualification || "",
        gender: patient_HospitalInformation?.gender || "",
        token,
        amount_Status: patient_HospitalInformation?.amount_Status || "",
        referredBy: patient_HospitalInformation?.referredBy || "", // ✅ fixed nesting
      },
      patient_BloodType,
      patient_MaritalStatus,
    });


    return res.status(200).json({
      success: true,
      message: "Patient created successfully",
      information: { newPatient },
    });
  } catch (error) {
    console.error("Error creating patient:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllPatients = async (req, res) => {
  try {
    const patients = await hospitalModel.Patient.find({ deleted: false });
    if (!patients || patients.length === 0) {
      return res.status(200).json({
        success: true,
        status: 404,
        message: "No patients found",
        information: {
          patients: [],
        },
      });
    }

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Patients retrieved successfully",
      information: { patients },
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: error.message,
    });
  }
};

const getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await hospitalModel.Patient.findOne({
      _id: patientId,
      deleted: false,

    });

    if (!patient) {
      return res.status(404).json({
        success: true,
        status: 404,
        message: "No patient found",
        information: {
          patient: [],
        },
      });
    }


    return res.status(200).json({
      success: true,
      status: 200,
      message: "Patient retrieved successfully",
      information: {
        patient,
      },
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: error.message,
    });
  }
};

const getPatientByMRNo = async (req, res) => {
  try {
    const { patient_MRNo } = req.params;

    // Find the patient by patient_MRNo
    const patient = await hospitalModel.Patient.findOne({
      patient_MRNo,
      deleted: false,
    });

    if (!patient) {
      return res.status(404).json({
        success: true,
        status: 404,
        message: "No patient found with the provided MR Number",
        information: {
          patient: null,
        },
      });
    }

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Patient retrieved successfully",
      information: {
        patient,
      },
    });
  } catch (error) {
    console.error("Error fetching patient by MR Number:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: error.message,
    });
  }
};

const deletePatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Please provide the patient ID.",
      });
    }

    const patient = await hospitalModel.Patient.findById({
      _id: patientId,
    });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    await hospitalModel.Patient.updateOne(
      { _id: patientId },
      { $set: { deleted: true } }
    );

    return res.status(200).json({
      success: true,
      message: "patient deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updatePatient = async (req, res) => {
  try {
    const { patient_MRNo } = req.params;
    const currentDate = new Date().toISOString().split('T')[0];

    // Fetch the existing patient data
    const existingPatient = await hospitalModel.Patient.findOne({ patient_MRNo });

    if (!existingPatient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    const {
      patient_Name,
      patient_ContactNo,
      patient_Guardian,
      patient_CNIC,
      patient_Gender,
      patient_Age,
      patient_DateOfBirth,
      patient_Address,
      patient_HospitalInformation,
      patient_BloodType,
      patient_MaritalStatus,
    } = req.body;

    // Check if token exists, if not generate new one
    let token = existingPatient.patient_HospitalInformation?.token;
    if (!token) {
      token = await generateUniqueToken(currentDate);
    }

    // Prepare update data
    const updateData = {
      patient_Name: patient_Name || existingPatient.patient_Name,
      patient_ContactNo: patient_ContactNo || existingPatient.patient_ContactNo,
      patient_Guardian: patient_Guardian || existingPatient.patient_Guardian,
      patient_CNIC: patient_CNIC || existingPatient.patient_CNIC,
      patient_Gender: patient_Gender || existingPatient.patient_Gender,
      patient_Age: patient_Age || existingPatient.patient_Age,
      patient_DateOfBirth: patient_DateOfBirth || existingPatient.patient_DateOfBirth,
      patient_Address: patient_Address || existingPatient.patient_Address,
      patient_HospitalInformation: {
        ...(existingPatient.patient_HospitalInformation || {}),
        ...(patient_HospitalInformation || {}),
        token // This will either keep existing or use new token
      },
      patient_BloodType: patient_BloodType || existingPatient.patient_BloodType,
      patient_MaritalStatus: patient_MaritalStatus || existingPatient.patient_MaritalStatus,
    };

    // Update patient
    const updatedPatient = await hospitalModel.Patient.findByIdAndUpdate(
      existingPatient._id,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully.",
      information: { updatedPatient },
    });

  } catch (error) {
    console.error("Error updating patient:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Could not update patient.",
    });
  }
};

const patient = {
  createPatient,
  getAllPatients,
  getPatientById,
  getPatientByMRNo,
  deletePatient,
  updatePatient,
};
module.exports = patient;