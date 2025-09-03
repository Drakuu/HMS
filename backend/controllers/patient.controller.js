const hospitalModel = require("../models/index.model");
const utils = require("../utils/utilsIndex");

// Search patient by multiple fields
const searchPatient = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    const patients = await hospitalModel.Patient.find({
      deleted: false,
      $or: [
        { patient_MRNo: { $regex: searchTerm, $options: 'i' } },
        { patient_CNIC: { $regex: searchTerm, $options: 'i' } },
        { patient_ContactNo: { $regex: searchTerm, $options: 'i' } },
        { patient_Name: { $regex: searchTerm, $options: 'i' } },
        { "patient_Guardian.guardian_Contact": { $regex: searchTerm, $options: 'i' } }
      ]
    }).select('patient_MRNo patient_Name patient_ContactNo patient_CNIC patient_Gender patient_Age totalVisits lastVisit');

    return res.status(200).json({
      success: true,
      message: "Patients found successfully",
      information: { patients },
    });
  } catch (error) {
    console.error("Error searching patients:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create patient - can be new patient or add visit to existing patient
const createPatient = async (req, res) => {
  try {
    const {
      patient_MRNo, // Optional: if provided, means existing patient
      patient_Name,
      patient_ContactNo,
      patient_Guardian,
      patient_CNIC,
      patient_Gender,
      patient_Age,
      patient_DateOfBirth,
      patient_Address,
      patient_BloodType,
      patient_MaritalStatus,
      visitData // Required for both new and existing patients
    } = req.body;

    // Validate visit data
    if (!visitData?.doctor || !visitData?.purpose) {
      return res.status(400).json({
        success: false,
        message: "Doctor and purpose are required for the visit",
      });
    }

    // Check if doctor exists
    const doctor = await hospitalModel.Doctor.findById(visitData.doctor);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const currentDate = new Date();
    const token = await utils.generateUniqueToken(currentDate.toISOString().split('T')[0]);

    // Calculate visit details
    const doctorFee = doctor.doctor_Fee || 0;
    const discount = visitData?.discount || 0;
    const totalFee = Math.max(0, doctorFee - discount);

    // Create visit object
    const newVisit = {
      visitDate: currentDate,
      doctor: visitData.doctor,
      purpose: visitData.purpose,
      disease: visitData.disease || "",
      doctorFee: doctorFee,
      discount: discount,
      totalFee: totalFee,
      amountStatus: visitData?.amountStatus || 'pending',
      token: token,
      referredBy: visitData?.referredBy || "",
      notes: visitData?.notes || ""
    };

    let patient;

    // If MR Number provided, try to find existing patient
    if (patient_MRNo) {
      patient = await hospitalModel.Patient.findOne({
        patient_MRNo,
        deleted: false
      });

      if (patient) {
        // Existing patient - add new visit
        patient.visits.push(newVisit);
        patient.lastVisit = currentDate;
        patient.totalVisits += 1;

        // Update patient information if provided
        if (patient_Name) patient.patient_Name = patient_Name;
        if (patient_ContactNo) patient.patient_ContactNo = patient_ContactNo;
        if (patient_Guardian) patient.patient_Guardian = { ...patient.patient_Guardian, ...patient_Guardian };
        if (patient_CNIC) patient.patient_CNIC = patient_CNIC;
        if (patient_Gender) patient.patient_Gender = patient_Gender;
        if (patient_Age) patient.patient_Age = parseInt(patient_Age);
        if (patient_DateOfBirth) patient.patient_DateOfBirth = new Date(patient_DateOfBirth);
        if (patient_Address) patient.patient_Address = patient_Address;
        if (patient_BloodType) patient.patient_BloodType = patient_BloodType;
        if (patient_MaritalStatus) patient.patient_MaritalStatus = patient_MaritalStatus;

        await patient.save();

        return res.status(200).json({
          success: true,
          message: "Visit added to existing patient successfully",
          information: { patient: await populatePatient(patient._id) },
        });
      }
    }

    // Create new patient (either MR Number not provided or not found)
    if (!patient_MRNo) {
      // Check if patient already exists with same CNIC or contact
      const existingPatient = await hospitalModel.Patient.findOne({
        deleted: false,
        $or: [
          { patient_CNIC: patient_CNIC },
          { patient_ContactNo: patient_ContactNo }
        ]
      });

      if (existingPatient) {
        return res.status(409).json({
          success: false,
          message: "Patient with same CNIC or contact number already exists",
          information: { existingPatient: await populatePatient(existingPatient._id) }
        });
      }
    }

    // Generate new MR Number for new patient
    const newPatientMRNo = patient_MRNo || await utils.generateUniqueMrNo(currentDate.toISOString().split('T')[0]);

    // Create new patient with first visit
    patient = await hospitalModel.Patient.create({
      patient_MRNo: newPatientMRNo,
      patient_Name,
      patient_ContactNo,
      patient_Guardian: patient_Guardian || {},
      patient_CNIC,
      patient_Gender,
      patient_Age: parseInt(patient_Age) || 0,
      patient_DateOfBirth: patient_DateOfBirth ? new Date(patient_DateOfBirth) : null,
      patient_Address,
      patient_BloodType,
      patient_MaritalStatus,
      visits: [newVisit],
      lastVisit: currentDate,
      totalVisits: 1
    });

    return res.status(201).json({
      success: true,
      message: "New patient created successfully with first visit",
      information: { patient: await populatePatient(patient._id) },
    });

  } catch (error) {
    console.error("Error in createPatient:", error);
    return res.status(500).json({
      success: false,
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
    })
      .populate('visits.doctor', 'doctor_Department doctor_Specialization doctor_Fee user doctor_Qualifications')
      .populate({
        path: 'visits.doctor',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient retrieved successfully with history",
      information: { patient },
    });
  } catch (error) {
    console.error("Error fetching patient history:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update patient - can update patient info and/or specific visit
const updatePatient = async (req, res) => {
  try {
    const { patient_MRNo } = req.params;
    const {
      patient_Name,
      patient_ContactNo,
      patient_Guardian,
      patient_CNIC,
      patient_Gender,
      patient_Age,
      patient_DateOfBirth,
      patient_Address,
      patient_BloodType,
      patient_MaritalStatus,
      visitData, // Optional: if provided, update or add visit
      visitId // Optional: if provided with visitData, update specific visit
    } = req.body;

    //  Find by patient_MRNo instead of _id
    const patient = await hospitalModel.Patient.findOne({
      patient_MRNo,
      deleted: false
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Update patient basic information
    if (patient_Name) patient.patient_Name = patient_Name;
    if (patient_ContactNo) patient.patient_ContactNo = patient_ContactNo;
    if (patient_Guardian) patient.patient_Guardian = { ...patient.patient_Guardian, ...patient_Guardian };
    if (patient_CNIC) patient.patient_CNIC = patient_CNIC;
    if (patient_Gender) patient.patient_Gender = patient_Gender;
    if (patient_Age) patient.patient_Age = parseInt(patient_Age);
    if (patient_DateOfBirth) patient.patient_DateOfBirth = new Date(patient_DateOfBirth);
    if (patient_Address) patient.patient_Address = patient_Address;
    if (patient_BloodType) patient.patient_BloodType = patient_BloodType;
    if (patient_MaritalStatus) patient.patient_MaritalStatus = patient_MaritalStatus;

    // Handle visit data
    if (visitData) {
      if (visitId) {
        // Update existing visit
        const visit = patient.visits.id(visitId);
        if (!visit) {
          return res.status(404).json({
            success: false,
            message: "Visit not found",
          });
        }

        if (visitData.purpose) visit.purpose = visitData.purpose;
        if (visitData.disease !== undefined) visit.disease = visitData.disease;
        if (visitData.discount !== undefined) visit.discount = visitData.discount;
        if (visitData.amountStatus) visit.amountStatus = visitData.amountStatus;
        if (visitData.referredBy !== undefined) visit.referredBy = visitData.referredBy;
        if (visitData.notes !== undefined) visit.notes = visitData.notes;

        // Recalculate total fee if discount changed
        if (visitData.discount !== undefined) {
          visit.totalFee = Math.max(0, visit.doctorFee - visitData.discount);
        }
      } else {
        // Add new visit
        if (!visitData.doctor) {
          return res.status(400).json({
            success: false,
            message: "Doctor are required for new visit",
          });
        }

        const doctor = await hospitalModel.Doctor.findById(visitData.doctor);
        if (!doctor) {
          return res.status(404).json({
            success: false,
            message: "Doctor not found",
          });
        }

        const currentDate = new Date();
        const token = await utils.generateUniqueToken(currentDate.toISOString().split('T')[0]);

        const doctorFee = doctor.doctor_Fee || 0;
        const discount = visitData?.discount || 0;
        const totalFee = Math.max(0, doctorFee - discount);

        const newVisit = {
          visitDate: currentDate,
          doctor: visitData.doctor,
          purpose: visitData.purpose,
          disease: visitData.disease || "",
          doctorFee: doctorFee,
          discount: discount,
          totalFee: totalFee,
          amountStatus: visitData?.amountStatus || 'pending',
          token: token,
          referredBy: visitData?.referredBy || "",
          notes: visitData?.notes || ""
        };

        patient.visits.push(newVisit);
        patient.lastVisit = currentDate;
        patient.totalVisits += 1;
      }
    }

    await patient.save();

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      information: { patient: await populatePatient(patient._id) },
    });

  } catch (error) {
    console.error("Error updating patient:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to populate patient data
const populatePatient = async (patientId) => {
  return await hospitalModel.Patient.findById(patientId)
    .populate('visits.doctor', 'doctor_Department doctor_Specialization doctor_Fee user doctor_Qualifications')
    .populate({
      path: 'visits.doctor',
      populate: {
        path: 'user',
        select: 'firstName lastName email'
      }
    });
};

// Keep other functions (getAllPatients, getPatientByMRNo, deletePatient, etc.)
const getAllPatients = async (req, res) => {
  try {
    const patients = await hospitalModel.Patient.find({ deleted: false })
      .select('patient_MRNo patient_Name patient_ContactNo patient_CNIC patient_Gender patient_Age totalVisits lastVisit')
      .sort({ lastVisit: -1 });

    return res.status(200).json({
      success: true,
      message: "Patients retrieved successfully",
      information: { patients },
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPatientByMRNo = async (req, res) => {
  try {
    const { patient_MRNo } = req.params;

    const patient = await hospitalModel.Patient.findOne({
      patient_MRNo,
      deleted: false,
    })
      .populate('visits.doctor', 'doctor_Department doctor_Specialization doctor_Fee user')
      .populate({
        path: 'visits.doctor',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient retrieved successfully",
      information: { patient },
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return res.status(500).json({
      success: false,
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

    const patient = await hospitalModel.Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    patient.deleted = true;
    await patient.save();

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const patient = {
  searchPatient,
  createPatient, // Now handles both new patient and adding visit to existing
  updatePatient, // Now handles patient info updates and visit updates/additions
  getAllPatients,
  getPatientByMRNo,
  deletePatient,
  getPatientById,
};

module.exports = patient;