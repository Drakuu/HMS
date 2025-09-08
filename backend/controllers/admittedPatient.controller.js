const hospitalModel = require("../models/index.model");

const admittedPatient = async (req, res) => {
  try {
    const { patientId, ward_Information, admission_Details, financials } = req.body;

    // 1. Validate Patient ID
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID required"
      });
    }

    // 2. Check if patient exists
    const patient = await hospitalModel.Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // 3. Check if already admitted
    const existingAdmission = await hospitalModel.AdmittedPatient.findOne({
      patient: patientId,
      status: "Admitted"
    });
    if (existingAdmission) {
      return res.status(400).json({
        success: false,
        message: "Patient already admitted"
      });
    }

    // 4. Validate ward and bed
    const ward = await hospitalModel.ward.findById(ward_Information.ward_Id);
    if (!ward) {
      return res.status(404).json({
        success: false,
        message: "Ward not found"
      });
    }

    const bed = ward.beds.find(b =>
      b.bedNumber.toString().trim().toLowerCase() ===
      ward_Information.bed_No.toString().trim().toLowerCase()
    );

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

    // 5. Create admission record with patient reference
    const admission = new hospitalModel.AdmittedPatient({
      patient: patientId,
      admission_Details: {
        admission_Date: new Date(),
        admitting_Doctor: admission_Details.admitting_Doctor,
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
      status: "Admitted"
    });

    // 6. Update bed status
    bed.occupied = true;
    bed.currentPatient = patientId;
    bed.history.push({
      patientId: patientId,
      admissionDate: new Date()
    });

    await Promise.all([ward.save(), admission.save()]);

    // Populate patient data in response
    const populatedAdmission = await hospitalModel.AdmittedPatient
      .findById(admission._id)
      .populate('patient', 'patient_MRNo patient_Name patient_CNIC patient_Gender patient_DateOfBirth patient_Address patient_Guardian');

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

    // Find admission record by populating patient with MR number
    const admission = await hospitalModel.AdmittedPatient.findOne({
      deleted: false,
      status: "Admitted"
    })
      .populate({
        path: 'patient',
        match: { patient_MRNo: mrNo }
      })
      .lean();

    if (!admission || !admission.patient) {
      return res.status(404).json({
        success: false,
        message: "No admission record found for this MR number",
        information: { patient: null },
      });
    }

    // Get ward details
    let wardDetails = null;
    if (admission.ward_Information?.ward_Id) {
      wardDetails = await hospitalModel.ward.findOne({
        _id: admission.ward_Information.ward_Id,
        isDeleted: false
      }).lean();
    }

    // Calculate days admitted
    const admissionDate = admission.admission_Details.admission_Date;
    const daysAdmitted = Math.ceil((new Date() - admissionDate) / (1000 * 60 * 60 * 24));

    // Find the specific bed assignment if ward information exists
    let bedDetails = null;
    if (wardDetails && admission.ward_Information.bed_No) {
      bedDetails = wardDetails.beds.find(bed =>
        bed.bedNumber.toString() === admission.ward_Information.bed_No.toString()
      );
    }

    // Construct the final patient object
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
    const { ward_Type, ward_No, bed_No, status, ward_Id, financials, admission_Details } = req.body;

    // Get current admission record
    const currentAdmission = await hospitalModel.AdmittedPatient.findById(id);
    if (!currentAdmission) {
      return res.status(404).json({
        success: false,
        message: "Admission record not found"
      });
    }

    // Handle different status updates
    if (status === "Admitted") {
      // Validate required fields for "Admitted" status
      if (!ward_Type || !ward_No || !bed_No || !ward_Id) {
        return res.status(400).json({
          success: false,
          message: "Ward type, ward number, bed number and ward ID are required for admission"
        });
      }

      // 1. Validate new ward exists
      const newWard = await hospitalModel.ward.findById(ward_Id);
      if (!newWard) {
        return res.status(404).json({
          success: false,
          message: "New ward not found"
        });
      }

      // 2. Check if bed exists in new ward (case-insensitive match) - FIXED THE ERROR HERE
      const newBed = newWard.beds.find(b => {
        // Add proper null/undefined checks
        if (!b.bedNumber || !bed_No) return false;

        const bedNumber = b.bedNumber.toString().trim().toLowerCase();
        const requestedBedNo = bed_No.toString().trim().toLowerCase();

        return bedNumber === requestedBedNo;
      });

      if (!newBed) {
        return res.status(400).json({
          success: false,
          message: `Bed ${bed_No} not found in ward ${newWard.name}`,
          availableBeds: newWard.beds.map(b => b.bedNumber)
        });
      }

      // 3. Check if bed is available (excluding current patient)
      if (newBed.occupied && newBed.currentPatient?.toString() !== currentAdmission.patient.toString()) {
        return res.status(400).json({
          success: false,
          message: `Bed ${bed_No} is already occupied by another patient`
        });
      }

      // 4. Free up old bed if transferring to new ward/bed
      if (currentAdmission.status === "Admitted") {
        const oldWard = await hospitalModel.ward.findById(
          currentAdmission.ward_Information.ward_Id
        );

        if (oldWard) {
          const oldBed = oldWard.beds.find(b =>
            b.bedNumber === currentAdmission.ward_Information.bed_No
          );

          if (oldBed) {
            oldBed.occupied = false;
            oldBed.currentPatient = null;

            // Update discharge date in bed history
            const currentStay = oldBed.history.find(
              h => {
                const patientId = h.patientId ? h.patientId.toString() : null;
                const admissionPatient = currentAdmission.patient ? currentAdmission.patient.toString() : null;
                return patientId === admissionPatient && !h.dischargeDate;
              }
            );

            if (currentStay) {
              currentStay.dischargeDate = new Date();
            }

            await oldWard.save();
          }
        }
      }

      // 5. Occupy new bed
      newBed.occupied = true;
      newBed.currentPatient = currentAdmission.patient;

      // Add to bed history
      newBed.history.push({
        patientId: currentAdmission.patient,
        admissionDate: new Date()
      });

      await newWard.save();

    } else if (status === "Discharged") {
      // DISCHARGE LOGIC

      // 1. Free up the bed
      const ward = await hospitalModel.ward.findById(
        currentAdmission.ward_Information.ward_Id
      );

      if (ward) {
        const bed = ward.beds.find(b =>
          b.bedNumber === currentAdmission.ward_Information.bed_No
        );

        if (bed) {
          bed.occupied = false;
          bed.currentPatient = null;

          // Update discharge date in bed history - FIXED VARIABLE NAME HERE
          const currentStay = bed.history.find( // Changed from oldBed to bed
            h => {
              const patientId = h.patientId ? h.patientId.toString() : null;
              const admissionPatient = currentAdmission.patient ? currentAdmission.patient.toString() : null;
              return patientId === admissionPatient && !h.dischargeDate;
            }
          );

          if (currentStay) {
            currentStay.dischargeDate = new Date();
          }

          await ward.save();
        }
      }
    }

    // Prepare update data for admission record
    const updateData = {
      status,
      "admission_Details.discharge_Date": status === "Discharged" ? new Date() : null
    };

    // Update financials if provided
    if (financials) {
      updateData.financials = {
        admission_Fee: financials.admission_Fee || currentAdmission.financials.admission_Fee,
        discount: financials.discount || currentAdmission.financials.discount,
        payment_Status: financials.payment_Status || currentAdmission.financials.payment_Status,
        total_Charges: (financials.admission_Fee || currentAdmission.financials.admission_Fee) -
          (financials.discount || currentAdmission.financials.discount)
      };
    }

    if (admission_Details) {
      if (admission_Details.admission_Type) {
        updateData["admission_Details.admission_Type"] = admission_Details.admission_Type;
      }
      if (admission_Details.admitting_Doctor) {
        updateData["admission_Details.admitting_Doctor"] = admission_Details.admitting_Doctor;
      }
      if (admission_Details.diagnosis) {
        updateData["admission_Details.diagnosis"] = admission_Details.diagnosis;
      }
    }

    // Update ward information if admitting/transferring
    if (status === "Admitted") {
      updateData.ward_Information = {
        ward_Type,
        ward_No,
        bed_No,
        ward_Id,
        pdCharges: req.body.ward_Information?.pdCharges || currentAdmission.ward_Information.pdCharges
      };
    }

    // Update the admission record
    const updatedPatient = await hospitalModel.AdmittedPatient.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('patient', 'patient_MRNo patient_Name patient_CNIC patient_Gender patient_DateOfBirth patient_Address patient_Guardian');

    return res.status(200).json({
      success: true,
      message: `Patient ${status.toLowerCase()} successfully`,
      data: updatedPatient
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