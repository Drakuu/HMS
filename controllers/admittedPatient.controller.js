const AdmittedPatient = require("../models/admittedPatient.model");
const Patient = require("../models/patient.model");

// Helper function to check bed availability
const checkBedAvailability = async (ward_Type, ward_No, bed_No) => {
  const occupiedBed = await AdmittedPatient.findOne({
    "ward_Information.ward_Type": ward_Type,
    "ward_Information.ward_No": ward_No,
    "ward_Information.bed_No": bed_No,
    "status.is_Admitted": true,
    deleted: false
  });
  return !occupiedBed;
};

// Admit a new patient
const admittedPatient = async (req, res) => {
  try {
    // Log the request body for debugging purposes
    console.log("Request body: ", req.body);

    const { patient_MRNo, ward_Information, admission_Details, financials } = req.body;

    // Check if MR number is provided
    if (!patient_MRNo) {
      return res.status(400).json({
        success: false,
        message: "Patient MR Number is required",
      });
    }

    // Fetch patient details based on MR number
    const patient = await Patient.findOne({ patient_MRNo: patient_MRNo });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `No patient found with MR number: ${patient_MRNo}`,
      });
    }

    console.log("Patient data fetched: ", patient); // Log fetched patient data

    // Proceed with the admission process
    const admittedPatientRecord = new AdmittedPatient({
      patient_MRNo,
      patient_Name: patient.patient_Name,
      patient_CNIC: patient.patient_CNIC,
      patient_Gender: patient.patient_Gender,
      patient_Age: patient.patient_Age,
      patient_DateOfBirth: patient.patient_DateOfBirth,
      patient_Address: patient.patient_Address,
      patient_Guardian: patient.patient_Guardian || {},
      admission_Details: {
        admission_Date: Date.now(),
        admitting_Doctor: admission_Details.admitting_Doctor,
        diagnosis: admission_Details.diagnosis,
        discharge_Date: null,
      },
      ward_Information: ward_Information,
      financials: financials,
      status: "Admitted"
    });

    await admittedPatientRecord.save();

    return res.status(201).json({
      success: true,
      message: "Patient admitted successfully",
      data: admittedPatientRecord,
    });
  } catch (error) {
    console.error("❌ Detailed Admission error:", error.message, error.stack);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during admission",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get all admitted patients
const getAllAdmittedPatients = async (req, res) => {
  try {
    const { ward_Type, search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      // status:"Admitted",
      deleted: false
    };

    if (ward_Type) {
      query["ward_Information.ward_Type"] = ward_Type;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { patient_MRNo: searchRegex },
        { patient_Name: searchRegex },
        { "admission_Details.admitting_Doctor": searchRegex }
      ];
    }

    const [patients, total] = await Promise.all([
      AdmittedPatient.find(query)
        .sort({ "admission_Details.admission_Date": -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AdmittedPatient.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      count: patients.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: patients
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admitted patients",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get patient by MR Number
const getByMRNumber = async (req, res) => {
  try {
    const { mrNo } = req.params;  // Capture the MR number from the URL parameter

    // Log for debugging
    console.log("MR Number received via path parameter:", mrNo);

    // Fetch the patient based on MR Number
    const patient = await AdmittedPatient.findOne({
      patient_MRNo: mrNo,
      deleted: false,
    }).lean();

    // If no patient is found
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "No admission record found for this MR number",
        information: { patient: null },
      });
    }

    // Calculate days admitted (if necessary)
    const admissionDate = patient.admission_Details.admission_Date;
    const dischargeDate = patient.admission_Details.discharge_Date || new Date();
    patient.daysAdmitted = Math.ceil((dischargeDate - admissionDate) / (1000 * 60 * 60 * 24));

    return res.status(200).json({
      success: true,
      message: "Patient retrieved successfully",
      information: { patient },
    });
  } catch (error) {
    console.error("MR search error:", error);
    return res.status(500).json({
      success: false,
      message: "Search failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update patient ward/bed and change status if required
const updateAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { ward_Type, ward_No, bed_No, status } = req.body;

    // Validate the presence of the required fields for "Admitted" status
    if (status === "Admitted" && (!ward_Type || !ward_No || !bed_No)) {
      return res.status(400).json({
        success: false,
        message: "Ward type, ward number, and bed number are required for admitted status",
      });
    }


    // Check if the bed is available only when the status is "Admitted"
    if (status === "Admitted") {
      const isBedAvailable = await checkBedAvailability(ward_Type, ward_No, bed_No);
      if (!isBedAvailable) {
        return res.status(400).json({
          success: false,
          message: `Bed ${bed_No} in Ward ${ward_No} (${ward_Type}) is already occupied`
        });
      }
    }

    // Function to return the correct status
    const updatedStatus = () => {
      if (status === "Discharged") {
        return "Discharged"; // Correct the syntax for returning the status
      } else {
        return "Admitted";
      }
    };

    const updateData = {
      status: updatedStatus(), // Set the updated status
    };

    // Include ward information only if the patient is being admitted
    if (status === "Admitted") {
      updateData["ward_Information"] = {
        ward_Type: ward_Type,
        ward_No: ward_No,
        bed_No: bed_No,
      };
    }

    // Update the patient's status in the database
    const updatedPatient = await AdmittedPatient.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({
        success: false,
        message: "Admission record not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admission and status updated successfully",
      data: updatedPatient
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Soft delete admission record
const deleteAdmission = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRecord = await AdmittedPatient.findByIdAndUpdate(
      id,
      {
        $set: {
          deleted: true,
          deletedAt: new Date()
        }
      },
      { new: true }
    );

    if (!deletedRecord) {
      return res.status(404).json({
        success: false,
        message: "Admission record not found"
      });
    }

    // Update patient admission status if they were admitted
    if (deletedRecord.status.is_Admitted) {
      await Patient.findOneAndUpdate(
        { patient_MRNo: deletedRecord.patient_MRNo },
        { $set: { isAdmitted: false } }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Admission record deleted successfully",
      data: deletedRecord
    });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({
      success: false,
      message: "Deletion failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  admittedPatient,
  getAllAdmittedPatients,
  getByMRNumber,
  updateAdmission,
  deleteAdmission,
};  