const mongoose = require("mongoose"); // ADD THIS LINE
const hospitalModel = require("../models/index.model");

const admittedPatient = async (req, res) => {
  try {
    const { patientId, ward_Information, admission_Details, financials } = req.body;

    // Validate required fields
    if (!patientId || !ward_Information || !ward_Information.ward_Id || !ward_Information.bed_No) {
      return res.status(400).json({
        success: false,
        message: "Patient ID, ward ID, and bed number are required"
      });
    }

    // Check if patient exists
    const patient = await hospitalModel.Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Check if already admitted
    const existingAdmission = await hospitalModel.AdmittedPatient.findOne({
      patient: patientId,
      status: "Admitted",
      deleted: false
    });

    if (existingAdmission) {
      return res.status(400).json({
        success: false,
        message: "Patient already admitted"
      });
    }

    // Validate ward
    const ward = await hospitalModel.ward.findById(ward_Information.ward_Id);
    if (!ward || ward.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Ward not found or has been deleted"
      });
    }

    // Validate bed
    const bed = ward.beds.find(b => b.bedNumber.toString() === ward_Information.bed_No.toString());

    if (!bed) {
      return res.status(400).json({
        success: false,
        message: `Bed ${ward_Information.bed_No} not found in ward ${ward.name}`,
        availableBeds: ward.beds.map(b => b.bedNumber)
      });
    }

    if (bed.occupied) {
      return res.status(400).json({
        success: false,
        message: `Bed ${bed.bedNumber} is already occupied`
      });
    }

    // Prepare admission data - handle optional doctor
    const admissionData = {
      patient: patientId,
      admission_Details: {
        admission_Date: new Date(),
        diagnosis: admission_Details.diagnosis,
        discharge_Date: null,
        admission_Type: admission_Details.admission_Type,
      },
      ward_Information: {
        ward_Type: ward.department_Name,
        ward_No: ward.wardNumber.toString(),
        bed_No: ward_Information.bed_No,
        pdCharges: ward_Information.pdCharges || 0,
        ward_Id: ward._id
      },
      financials: {
        admission_Fee: financials.admission_Fee || 0,
        discount: financials.discount || 0,
        payment_Status: financials.payment_Status || "Unpaid",
        total_Charges: (financials.admission_Fee || 0) - (financials.discount || 0),
      },
      status: "Admitted",
      deleted: false
    };

    // Only add admitting_Doctor if provided and valid
    if (admission_Details.admitting_Doctor &&
      mongoose.Types.ObjectId.isValid(admission_Details.admitting_Doctor)) {
      admissionData.admission_Details.admitting_Doctor = admission_Details.admitting_Doctor;
    }

    // Create admission record
    const admission = new hospitalModel.AdmittedPatient(admissionData);

    // Update bed status - FIXED: Add patientMRNo to history
    bed.occupied = true;
    bed.currentPatient = patientId;
    bed.history.push({
      patientId: patientId,
      patientMRNo: patient.patient_MRNo, // ADD THIS LINE
      admissionDate: new Date()
    });

    await Promise.all([ward.save(), admission.save()]);

    // Populate patient data in response
    let populatedAdmission = await hospitalModel.AdmittedPatient
      .findById(admission._id)
      .populate('patient', 'patient_MRNo patient_Name patient_CNIC patient_Gender patient_DateOfBirth patient_Address patient_Guardian');

    // Only populate doctor if it exists
    if (admissionData.admission_Details.admitting_Doctor) {
      populatedAdmission = await populatedAdmission
        .populate('admission_Details.admitting_Doctor', 'name specialty');
    }

    return res.status(201).json({
      success: true,
      message: "Patient admitted successfully",
      data: populatedAdmission
    });

  } catch (error) {
    console.error("Admission error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during admission",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getAllAdmittedPatients = async (req, res) => {
  try {
    const { ward_Type, search, ward_id, admission_Type, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      deleted: false,
      status: "Admitted" // Only show admitted patients
    };

    if (ward_Type) {
      query["ward_Information.ward_Type"] = ward_Type;
    }

    if (admission_Type) {
      query["admission_Details.admission_Type"] = admission_Type;
    }

    if (ward_id) {
      query["ward_Information.ward_Id"] = ward_id;
    }

    // Get patients with populated patient data
    let patients = await hospitalModel.AdmittedPatient.find(query)
      .populate('patient', 'patient_MRNo patient_Name patient_CNIC patient_Gender patient_DateOfBirth patient_Address patient_Guardian')
      .sort({ "admission_Details.admission_Date": -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Then manually populate the ward information
    const wardIds = [...new Set(patients.map(p => p.ward_Information?.ward_Id).filter(Boolean))];
    const wards = await hospitalModel.ward.find({
      _id: { $in: wardIds },
      isDeleted: false
    }).lean();

    const wardMap = wards.reduce((map, ward) => {
      map[ward._id.toString()] = ward;
      return map;
    }, {});

    // Calculate days admitted and add ward details
    const patientsWithDetails = patients.map(patient => {
      const admissionDate = patient.admission_Details.admission_Date;
      const daysAdmitted = Math.ceil((new Date() - admissionDate) / (1000 * 60 * 60 * 24));

      const wardId = patient.ward_Information?.ward_Id?.toString();
      const wardDetails = wardId ? wardMap[wardId] : null;

      let assignedBed = null;
      if (wardDetails && patient.ward_Information?.bed_No) {
        assignedBed = wardDetails.beds.find(bed =>
          bed.bedNumber.toString() === patient.ward_Information.bed_No.toString()
        );
      }

      return {
        ...patient,
        ward_Information: {
          ...patient.ward_Information,
          wardDetails: wardDetails ? {
            _id: wardDetails._id,
            name: wardDetails.name,
            wardNumber: wardDetails.wardNumber,
            department_Name: wardDetails.department_Name,
            assignedBed: assignedBed ? {
              bedNumber: assignedBed.bedNumber,
              occupied: assignedBed.occupied,
              _id: assignedBed._id
            } : null
          } : null
        },
        daysAdmitted
      };
    });

    const total = await hospitalModel.AdmittedPatient.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: patients.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: patientsWithDetails
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

const getByMRNumber = async (req, res) => {
  try {
    const { mrNo } = req.params;
    // console.log("Searching for MR:", mrNo);

    // First find the patient by MR number
    const patient = await hospitalModel.Patient.findOne({
      patient_MRNo: mrNo,
      deleted: false
    }).lean();

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found with this MR number",
        information: { patient: null },
      });
    }

    // Then find the admission record for this patient
    const admission = await hospitalModel.AdmittedPatient.findOne({
      patient: patient._id, // Use the patient's ID
      deleted: false,
      status: "Admitted"
    })
      .populate('patient')
      .lean();

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: "No admission record found for this patient",
        information: { patient: null },
      });
    }

    // console.log("Found admission:", admission._id);
    // console.log("Ward ID:", admission.ward_Information?.ward_Id);

    // Rest of your code for ward details, bed details, etc...
    let wardDetails = null;
    if (admission.ward_Information?.ward_Id) {
      wardDetails = await hospitalModel.ward.findOne({
        _id: admission.ward_Information.ward_Id,
        isDeleted: false
      }).lean();
    }

    const admissionDate = admission.admission_Details.admission_Date;
    const daysAdmitted = Math.ceil((new Date() - admissionDate) / (1000 * 60 * 60 * 24));

    let bedDetails = null;
    if (wardDetails && admission.ward_Information.bed_No) {
      bedDetails = wardDetails.beds.find(bed =>
        bed.bedNumber.toString() === admission.ward_Information.bed_No.toString()
      );
    }

    const patientWithDetails = {
      ...admission,
      ward_Information: {
        ...admission.ward_Information,
        wardDetails: wardDetails ? {
          _id: wardDetails._id,
          name: wardDetails.name,
          wardNumber: wardDetails.wardNumber,
          department_Name: wardDetails.department_Name
        } : null
      },
      bedDetails,
      daysAdmitted
    };

    return res.status(200).json({
      success: true,
      message: "Patient retrieved successfully",
      information: { patient: patientWithDetails },
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

const updateAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Get current admission record
    const currentAdmission = await hospitalModel.AdmittedPatient.findById(id);
    if (!currentAdmission || currentAdmission.deleted) {
      return res.status(404).json({
        success: false,
        message: "Admission record not found"
      });
    }

    // Handle status changes
    if (updateData.status === "Discharged") {
      // Free up the bed when discharging
      const ward = await hospitalModel.ward.findById(currentAdmission.ward_Information.ward_Id);

      if (ward) {
        const bed = ward.beds.find(b => b.bedNumber.toString() === currentAdmission.ward_Information.bed_No.toString());

        if (bed) {
          bed.occupied = false;
          bed.currentPatient = null;

          // Update discharge date in bed history
          const currentStay = bed.history.find(
            h => h.patientId.toString() === currentAdmission.patient.toString() && !h.dischargeDate
          );

          if (currentStay) {
            currentStay.dischargeDate = new Date();
            if (!currentStay.patientMRNo && admission.patient) {
              const patient = await hospitalModel.Patient.findById(admission.patient);
              if (patient) {
                currentStay.patientMRNo = patient.patient_MRNo;
              }
            }
          }

          await ward.save();
        }
      }

      // Set discharge date
      updateData.admission_Details = updateData.admission_Details || {};
      updateData.admission_Details.discharge_Date = new Date();
    }

    // Update the admission record
    const updatedAdmission = await hospitalModel.AdmittedPatient.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('patient', 'patient_MRNo patient_Name patient_CNIC patient_Gender patient_DateOfBirth patient_Address patient_Guardian')
      .populate('admission_Details.admitting_Doctor', 'name specialty');

    return res.status(200).json({
      success: true,
      message: "Admission updated successfully",
      data: updatedAdmission
    });

  } catch (error) {
    console.error("Update admission error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update admission",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteAdmission = async (req, res) => {
  try {
    const { id } = req.params;

    const admission = await hospitalModel.AdmittedPatient.findById(id);
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: "Admission record not found"
      });
    }

    // Check if admission.patient exists
    if (!admission.patient) {
      return res.status(400).json({
        success: false,
        message: "Invalid admission record: patient reference missing"
      });
    }

    // Free up the bed if patient is admitted
    if (admission.status === "Admitted") {
      const ward = await hospitalModel.ward.findById(admission.ward_Information.ward_Id);

      if (ward) {
        const bed = ward.beds.find(b =>
          b.bedNumber === admission.ward_Information.bed_No
        );

        if (bed) {
          bed.occupied = false;
          bed.currentPatient = null;

          // Update discharge date in bed history
          const currentStay = bed.history.find(
            h => {
              // Add proper null/undefined checks
              const patientId = h.patientId ? h.patientId.toString() : null;
              const admissionPatient = admission.patient ? admission.patient.toString() : null;

              return patientId === admissionPatient && !h.dischargeDate;
            }
          );

          if (currentStay) {
            currentStay.dischargeDate = new Date();
            // Also update patientMRNo if needed
            if (!currentStay.patientMRNo && admission.patient) {
              const patient = await hospitalModel.Patient.findById(admission.patient);
              if (patient) {
                currentStay.patientMRNo = patient.patient_MRNo;
              }
            }
          }

          await ward.save();
        }
      }
    }

    // Soft delete the admission record
    admission.deleted = true;
    admission.deletedAt = new Date();
    await admission.save();

    return res.status(200).json({
      success: true,
      message: "Admission record deleted successfully",
      data: admission
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

const dischargePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { wardId, bedNumber } = req.body;

    let admission;

    // Option 1: Discharge by admission ID
    if (id) {
      admission = await hospitalModel.AdmittedPatient.findById(id);
      if (!admission) {
        return res.status(404).json({
          success: false,
          message: "Admission not found"
        });
      }
    }
    // Option 2: Discharge by ward/bed details
    else if (wardId && bedNumber) {
      admission = await hospitalModel.AdmittedPatient.findOne({
        "ward_Information.ward_Id": wardId,
        "ward_Information.bed_No": bedNumber,
        status: "Admitted",
        deleted: false
      });

      if (!admission) {
        return res.status(404).json({
          success: false,
          message: "No admission found for this ward and bed"
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Either admission ID or wardId/bedNumber must be provided"
      });
    }

    // Check if admission.patient exists
    if (!admission.patient) {
      return res.status(400).json({
        success: false,
        message: "Invalid admission record: patient reference missing"
      });
    }

    // Free up the bed
    const ward = await hospitalModel.ward.findById(admission.ward_Information.ward_Id);
    if (ward) {
      const bed = ward.beds.find(b =>
        b.bedNumber === admission.ward_Information.bed_No
      );

      if (bed) {
        bed.occupied = false;
        bed.currentPatient = null;

        // Update discharge date in bed history - FIXED THE ERROR HERE
        const currentStay = bed.history.find(
          h => {
            // Add proper null/undefined checks
            const patientId = h.patientId ? h.patientId.toString() : null;
            const admissionPatient = admission.patient ? admission.patient.toString() : null;

            return patientId === admissionPatient && !h.dischargeDate;
          }
        );

        if (currentStay) {
          currentStay.dischargeDate = new Date();
          if (!currentStay.patientMRNo && admission.patient) {
            const patient = await hospitalModel.Patient.findById(admission.patient);
            if (patient) {
              currentStay.patientMRNo = patient.patient_MRNo;
            }
          }
        }

        await ward.save();
      }
    }

    // Update admission record
    admission.status = "Discharged";
    admission.admission_Details.discharge_Date = new Date();
    await admission.save();

    // Populate patient data for response
    const populatedAdmission = await hospitalModel.AdmittedPatient
      .findById(admission._id)
      .populate('patient', 'patient_MRNo patient_Name patient_CNIC patient_Gender patient_DateOfBirth patient_Address patient_Guardian');

    return res.status(200).json({
      success: true,
      message: "Patient discharged successfully",
      data: populatedAdmission
    });
  } catch (error) {
    console.error("Discharge error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during discharge",
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
  dischargePatient,
};