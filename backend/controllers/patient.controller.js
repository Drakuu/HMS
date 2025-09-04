const hospitalModel = require("../models/index.model");
const utils = require("../utils/utilsIndex");

// Search patient by multiple fields
const searchPatient = async (req, res) => {
  try {
    const { searchTerm, page = 1, limit = 10 } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    const skip = (page - 1) * limit;

    const patients = await hospitalModel.Patient.find({
      deleted: false,
      $or: [
        { patient_MRNo: { $regex: searchTerm, $options: 'i' } },
        { patient_CNIC: { $regex: searchTerm, $options: 'i' } },
        { patient_ContactNo: { $regex: searchTerm, $options: 'i' } },
        { patient_Name: { $regex: searchTerm, $options: 'i' } },
        { "patient_Guardian.guardian_Contact": { $regex: searchTerm, $options: 'i' } }
      ]
    })
      .select('patient_MRNo patient_Name patient_ContactNo patient_CNIC patient_Gender patient_Age totalVisits lastVisit totalAmountPaid totalAmountDue')
      .sort({ lastVisit: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await hospitalModel.Patient.countDocuments({
      deleted: false,
      $or: [
        { patient_MRNo: { $regex: searchTerm, $options: 'i' } },
        { patient_CNIC: { $regex: searchTerm, $options: 'i' } },
        { patient_ContactNo: { $regex: searchTerm, $options: 'i' } },
        { patient_Name: { $regex: searchTerm, $options: 'i' } },
        { "patient_Guardian.guardian_Contact": { $regex: searchTerm, $options: 'i' } }
      ]
    });

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      message: "Patients found successfully",
      information: {
        patients,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      },
    });
  } catch (error) {
    console.error("Error searching patients:", error);
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
    if (!visitData?.doctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor is required for the visit",
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
      purpose: visitData.purpose || "Consultation",
      disease: visitData.disease || "",
      doctorFee: doctorFee,
      discount: discount,
      totalFee: totalFee,

      // Payment fields
      amountPaid: visitData?.amountPaid || 0,
      amountDue: Math.max(0, totalFee - (visitData?.amountPaid || 0)),
      amountStatus: visitData?.amountPaid >= totalFee ? 'paid' :
        (visitData?.amountPaid > 0 ? 'partial' : 'pending'),
      paymentMethod: visitData?.paymentMethod || 'cash',
      paymentDate: visitData?.amountPaid > 0 ? currentDate : null,
      paymentNotes: visitData?.paymentNotes || "",

      // VCO field
      verbalConsentObtained: visitData?.verbalConsentObtained || false,

      token: token,
      referredBy: visitData?.referredBy || "",
      notes: visitData?.notes || ""
    };

    let patient;

    // Check if patient already exists by MR Number, Contact, or CNIC
    const existingPatientQuery = {
      deleted: false,
      $or: []
    };

    // Add search conditions only if values are provided
    if (patient_MRNo) {
      existingPatientQuery.$or.push({ patient_MRNo });
    }
    if (patient_ContactNo) {
      existingPatientQuery.$or.push({ patient_ContactNo });
    }
    if (patient_CNIC) {
      existingPatientQuery.$or.push({ patient_CNIC });
    }

    // Only search if we have at least one identifier
    if (existingPatientQuery.$or.length > 0) {
      patient = await hospitalModel.Patient.findOne(existingPatientQuery);

      if (patient) {
        // Check for conflicting information if patient is found
        let updateConflicts = [];

        if (patient_MRNo && patient.patient_MRNo !== patient_MRNo) {
          updateConflicts.push(`MR Number: existing (${patient.patient_MRNo}) vs new (${patient_MRNo})`);
        }
        if (patient_ContactNo && patient.patient_ContactNo !== patient_ContactNo) {
          updateConflicts.push(`Contact: existing (${patient.patient_ContactNo}) vs new (${patient_ContactNo})`);
        }
        if (patient_CNIC && patient.patient_CNIC !== patient_CNIC) {
          updateConflicts.push(`CNIC: existing (${patient.patient_CNIC}) vs new (${patient_CNIC})`);
        }

        // If there are conflicts, return error unless it's just updating empty fields
        if (updateConflicts.length > 0) {
          const canUpdate = updateConflicts.every(conflict => {
            // Allow updating if existing field is empty and new field has value
            if (conflict.includes('MR Number') && !patient.patient_MRNo && patient_MRNo) return true;
            if (conflict.includes('Contact') && !patient.patient_ContactNo && patient_ContactNo) return true;
            if (conflict.includes('CNIC') && !patient.patient_CNIC && patient_CNIC) return true;
            return false;
          });

          if (!canUpdate) {
            return res.status(409).json({
              success: false,
              message: "Patient already exists with conflicting information",
              conflicts: updateConflicts,
              existingPatient: {
                patient_MRNo: patient.patient_MRNo,
                patient_ContactNo: patient.patient_ContactNo,
                patient_CNIC: patient.patient_CNIC,
                patient_Name: patient.patient_Name
              }
            });
          }
        }

        // Existing patient found - add new visit
        patient.visits.push(newVisit);
        patient.lastVisit = currentDate;
        patient.totalVisits += 1;

        // Update patient information if provided (only update if new value is provided)
        if (patient_Name) patient.patient_Name = patient_Name;
        if (patient_ContactNo) patient.patient_ContactNo = patient_ContactNo;
        if (patient_Guardian) {
          patient.patient_Guardian = {
            ...patient.patient_Guardian,
            ...patient_Guardian
          };
        }
        if (patient_CNIC) patient.patient_CNIC = patient_CNIC;
        if (patient_Gender) patient.patient_Gender = patient_Gender;
        if (patient_Age) patient.patient_Age = parseInt(patient_Age);
        if (patient_DateOfBirth) patient.patient_DateOfBirth = new Date(patient_DateOfBirth);
        if (patient_Address) patient.patient_Address = patient_Address;
        if (patient_BloodType) patient.patient_BloodType = patient_BloodType;
        if (patient_MaritalStatus) patient.patient_MaritalStatus = patient_MaritalStatus;

        // Update financial summary
        patient.totalAmountPaid = patient.visits.reduce((sum, v) => sum + (v.amountPaid || 0), 0);
        patient.totalAmountDue = patient.visits.reduce((sum, v) => sum + (v.amountDue || 0), 0);

        await patient.save();

        return res.status(200).json({
          success: true,
          message: "Visit added to existing patient successfully",
          information: { patient: await populatePatient(patient._id) },
        });
      }
    }

    // If no existing patient found, create new patient
    // Validate required fields for new patient
    if (!patient_Name || !patient_ContactNo) {
      return res.status(400).json({
        success: false,
        message: "Patient name and contact number are required for new patient registration",
      });
    }

    // Generate new MR Number for new patient
    const newPatientMRNo = patient_MRNo || await utils.generateUniqueMrNo(currentDate.toISOString().split('T')[0]);

    // Create new patient with first visit
    patient = await hospitalModel.Patient.create({
      patient_MRNo: newPatientMRNo,
      patient_Name,
      patient_ContactNo,
      patient_Guardian: patient_Guardian || {},
      patient_CNIC: patient_CNIC || undefined, // Use undefined instead of empty string
      patient_Gender: patient_Gender || undefined,
      patient_Age: parseInt(patient_Age) || 0,
      patient_DateOfBirth: patient_DateOfBirth ? new Date(patient_DateOfBirth) : null,
      patient_Address: patient_Address || undefined,
      patient_BloodType: patient_BloodType || undefined,
      patient_MaritalStatus: patient_MaritalStatus || undefined,
      visits: [newVisit],
      lastVisit: currentDate,
      totalVisits: 1,
      totalAmountPaid: newVisit.amountPaid,
      totalAmountDue: newVisit.amountDue
    });

    return res.status(201).json({
      success: true,
      message: "New patient created successfully with first visit",
      information: { patient: await populatePatient(patient._id) },
    });

  } catch (error) {
    console.error("Error in createPatient:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `Patient with this ${field.replace('patient_', '').replace('_', ' ')} already exists`,
        duplicateField: field
      });
    }

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

// Update patient - can update patient info and/or specific visit including payments and VCO
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

    // Find by patient_MRNo instead of _id
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
        if (visitData.discount !== undefined) {
          visit.discount = visitData.discount;
          visit.totalFee = Math.max(0, visit.doctorFee - visitData.discount);
          // Recalculate amount due if discount changes
          visit.amountDue = Math.max(0, visit.totalFee - visit.amountPaid);
        }
        if (visitData.referredBy !== undefined) visit.referredBy = visitData.referredBy;

        // Update payment fields if provided
        if (visitData.amountPaid !== undefined) {
          visit.amountPaid = visitData.amountPaid;
          visit.amountDue = Math.max(0, visit.totalFee - visitData.amountPaid);
          visit.amountStatus = visitData.amountPaid >= visit.totalFee ? 'paid' :
            (visitData.amountPaid > 0 ? 'partial' : 'pending');

          // Set payment date if payment is made
          if (visitData.amountPaid > 0 && !visit.paymentDate) {
            visit.paymentDate = new Date();
          }
        }
        if (visitData.paymentMethod) visit.paymentMethod = visitData.paymentMethod;
        if (visitData.paymentNotes !== undefined) visit.paymentNotes = visitData.paymentNotes;
        if (visitData.paymentDate) visit.paymentDate = new Date(visitData.paymentDate);

        // Update VCO field if provided
        if (visitData.verbalConsentObtained !== undefined) {
          visit.verbalConsentObtained = visitData.verbalConsentObtained;
        }

      } else {
        // Add new visit
        if (!visitData.doctor || !visitData.purpose) {
          return res.status(400).json({
            success: false,
            message: "Doctor and purpose are required for new visit",
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

          // Payment fields
          amountPaid: visitData?.amountPaid || 0,
          amountDue: Math.max(0, totalFee - (visitData?.amountPaid || 0)),
          amountStatus: visitData?.amountPaid >= totalFee ? 'paid' :
            (visitData?.amountPaid > 0 ? 'partial' : 'pending'),
          paymentMethod: visitData?.paymentMethod || 'cash',
          paymentDate: visitData?.amountPaid > 0 ? currentDate : null,
          paymentNotes: visitData?.paymentNotes || "",

          // VCO field
          verbalConsentObtained: visitData?.verbalConsentObtained || false,

          token: token,
          referredBy: visitData?.referredBy || "",
        };

        patient.visits.push(newVisit);
        patient.lastVisit = currentDate;
        patient.totalVisits += 1;
      }
    }

    // Update patient's financial summary
    patient.totalAmountPaid = patient.visits.reduce((sum, v) => sum + (v.amountPaid || 0), 0);
    patient.totalAmountDue = patient.visits.reduce((sum, v) => sum + (v.amountDue || 0), 0);

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

// controllers/patient.controller.js  (replace getAllPatients)
const getAllPatients = async (req, res) => {
  try {
    // Pagination
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    // Search / filters
    const search = req.query.search || '';
    const gender = req.query.gender;
    const bloodType = req.query.bloodType; // fixed typo (was reqQuery)
    const maritalStatus = req.query.maritalStatus;
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;

    // Sorting
    const sortBy = req.query.sortBy || 'lastVisit';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    const query = { deleted: false };

    if (search) {
      query.$or = [
        { patient_MRNo: { $regex: search, $options: 'i' } },
        { patient_Name: { $regex: search, $options: 'i' } },
        { patient_ContactNo: { $regex: search, $options: 'i' } },
        { patient_CNIC: { $regex: search, $options: 'i' } },
        { "patient_Guardian.guardian_Name": { $regex: search, $options: 'i' } },
        { "patient_Guardian.guardian_Contact": { $regex: search, $options: 'i' } }
      ];
    }

    if (gender) query.patient_Gender = gender;
    if (bloodType) query.patient_BloodType = bloodType;
    if (maritalStatus) query.patient_MaritalStatus = maritalStatus;

    if (fromDate || toDate) {
      query.lastVisit = {};
      if (fromDate) query.lastVisit.$gte = new Date(fromDate);
      if (toDate) query.lastVisit.$lte = new Date(`${toDate}T23:59:59.999Z`);
    }

    const sortOptions = { [sortBy]: sortOrder };

    // IMPORTANT: include only the LAST visit to power OPD list
    const patients = await hospitalModel.Patient.find(query)
      .select(
        'patient_MRNo patient_Name patient_ContactNo patient_CNIC patient_Gender patient_Age ' +
        'patient_Address patient_BloodType patient_MaritalStatus totalVisits lastVisit visits'
      )
      .slice('visits', -1) // only last visit
      .populate('visits.doctor', 'doctor_Department doctor_Specialization user') // doctor basics + user ref
      .populate({
        path: 'visits.doctor',
        populate: { path: 'user', select: 'firstName lastName' } // for doctor name
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const totalPatients = await hospitalModel.Patient.countDocuments(query);
    const totalPages = Math.ceil(totalPatients / limit);

    return res.status(200).json({
      success: true,
      message: "Patients retrieved successfully",
      information: {
        patients,
        pagination: {
          currentPage: page,
          totalPages,
          totalPatients,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          limit
        },
        filters: { search, gender, bloodType, maritalStatus, fromDate, toDate }
      },
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return res.status(500).json({ success: false, message: error.message });
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
  createPatient,
  updatePatient,
  getAllPatients,
  getPatientByMRNo,
  deletePatient,
  getPatientById,
};

module.exports = patient;