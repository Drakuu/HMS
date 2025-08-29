const hospitalModel = require("../models/index.model");

const admittedPatient = async (req, res) => {
  try {
    // console.log("Request body: ", req.body);

    const { patient_MRNo, ward_Information, admission_Details, financials } = req.body;

    // 1. Validate MR Number
    if (!patient_MRNo) {
      return res.status(400).json({
        success: false,
        message: "MR Number required"
      });
    }

    // 2. Check if patient exists
    const patient = await hospitalModel.Patient.findOne({ patient_MRNo });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // 3. Check if already admitted
    const existingAdmission = await hospitalModel.AdmittedPatient.findOne({
      patient_MRNo,
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

    // Find the specific bed  
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

    // 5. Create admission record
    const admission = new hospitalModel.AdmittedPatient({
      patient_MRNo,
      patient_Name: patient.patient_Name,
      patient_CNIC: patient.patient_CNIC,
      patient_Gender: patient.patient_Gender,
      patient_Age: patient.patient_Age,
      patient_DateOfBirth: patient.patient_DateOfBirth,
      patient_Address: patient.patient_Address,
      patient_Guardian: patient.patient_Guardian || {},
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
        bed_No: ward_Information.bed_No, // Fixed from bed_Number to bed_No
        ward_Id: ward._id
      },
      financials: {
        admission_Fee: financials.admission_Fee || 0,
        discount: financials.discount || 0,
        payment_Status: financials.payment_Status || "Unpaid",
        total_Charges: (financials.admission_Fee || 0) - (financials.discount || 0),
        perDayCharges: {
          amount: financials.perDayCharges?.amount || 0,
          status: financials.perDayCharges?.status || "Unpaid",
          startDate: financials.perDayCharges?.startDate || new Date()
        }
      },
      status: "Admitted"
    });

    // 6. Update bed status - store both references
    bed.occupied = true;
    bed.currentPatientMRNo = patient.patient_MRNo; // Store MR number as string
    bed.history.push({
      patientMRNo: patient.patient_MRNo, // Add MR number to history
      admissionDate: new Date()
    });

    // Save both records in transaction if supported
    await Promise.all([
      ward.save(),
      admission.save()
    ]);

    return res.status(201).json({
      success: true,
      message: "Patient admitted successfully",
      data: {
        ...admission.toObject(),
        bedAssignment: {
          bedNumber: bed.bedNumber,
          patientMRNo: bed.currentPatientMRNo
        }
      }
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
    const { ward_Type, search, ward_id, admission_Type,page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      deleted: false
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

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { patient_MRNo: searchRegex },
        { patient_Name: searchRegex },
        { "admission_Details.admitting_Doctor": searchRegex },
        { "patient_Guardian.guardian_Name": searchRegex }
      ];
    }

    // First get the patients without population
    let patients = await hospitalModel.AdmittedPatient.find(query)
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
      const dischargeDate = patient.admission_Details.discharge_Date || new Date();

      const wardId = patient.ward_Information?.ward_Id?.toString();
      const wardDetails = wardId ? wardMap[wardId] : null;

      // Enhanced bed finding logic
      let assignedBed = null;
      if (wardDetails) {

        // Method 1: Check by explicit bed assignment in patient record
        if (patient.ward_Information?.bed_No) {
          assignedBed = wardDetails.beds.find(bed =>
            bed.bedNumber === patient.ward_Information.bed_No
          );
        }

        // Method 2: Check by currentPatient match
        if (!assignedBed) {
          assignedBed = wardDetails.beds.find(bed =>
            bed.currentPatient?.toString() === patient._id.toString()
          );
        }

        // Method 3: Check bed history for active admission
        if (!assignedBed) {
          for (const bed of wardDetails.beds) {
            const activeAdmission = bed.history.find(h =>
              h.patientId?.toString() === patient._id.toString() &&
              !h.dischargeDate
            );
            if (activeAdmission) {
              assignedBed = bed;
              break;
            }
          }
        }

        // Method 4: Last resort - find first occupied bed without currentPatient
        if (!assignedBed) {
          assignedBed = wardDetails.beds.find(bed =>
            bed.occupied && !bed.currentPatient
          );
        }
      }

      // Data consistency check
      if (wardDetails && !assignedBed) {
        console.warn(`No bed assigned for patient ${patient._id} in ward ${wardId}`);
        console.warn('Available beds:', wardDetails.beds.map(b => ({
          bedNumber: b.bedNumber,
          occupied: b.occupied,
          currentPatient: b.currentPatient
        })));
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
              _id: assignedBed._id,
              currentPatient: assignedBed.currentPatient,
              admissionDate: assignedBed.history.find(h =>
                h.patientId?.toString() === patient._id.toString()
              )?.admissionDate
            } : null,
            // Include all beds for debugging (remove in production)
            allBeds: process.env.NODE_ENV === 'development' ?
              wardDetails.beds.map(b => ({
                bedNumber: b.bedNumber,
                occupied: b.occupied,
                currentPatient: b.currentPatient
              })) : undefined
          } : null
        },
        daysAdmitted: Math.ceil((dischargeDate - admissionDate) / (1000 * 60 * 60 * 24))
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
    // console.log("MR Number received via path parameter:", mrNo);

    // Fetch the patient based on MR Number
    const patient = await hospitalModel.AdmittedPatient.findOne({
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

    // Manually populate ward information
    let wardDetails = null;
    if (patient.ward_Information?.ward_Id) {
      wardDetails = await hospitalModel.ward.findOne({
        _id: patient.ward_Information.ward_Id,
        isDeleted: false
      }).lean();
    }

    // Calculate days admitted
    const admissionDate = patient.admission_Details.admission_Date;
    const dischargeDate = patient.admission_Details.discharge_Date || new Date();
    const daysAdmitted = Math.ceil((dischargeDate - admissionDate) / (1000 * 60 * 60 * 24));

    // Find the specific bed assignment if ward information exists
    let bedDetails = null;
    if (wardDetails) {
      const bedNumber = patient.ward_Information.bed_No || patient.ward_Information.ward_No;

      if (wardDetails.beds && bedNumber) {
        const bed = wardDetails.beds.find(b =>
          b.bedNumber.toString().trim().toUpperCase() === bedNumber.toString().trim().toUpperCase()
        );

        if (bed) {
          bedDetails = {
            bedNumber: bed.bedNumber,
            occupied: bed.occupied,
            currentPatient: bed.currentPatient,
            admissionDate: bed.history.find(h =>
              h.patientId?.toString() === patient._id.toString() &&
              !h.dischargeDate
            )?.admissionDate
          };
        }
      }
    }

    // Construct the final patient object
    const patientWithDetails = {
      ...patient,
      ward_Information: {
        ...patient.ward_Information,
        wardDetails: wardDetails ? {
          _id: wardDetails._id,
          name: wardDetails.name,
          wardNumber: wardDetails.wardNumber,
          department_Name: wardDetails.department_Name,
          beds: wardDetails.beds
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
    const { ward_Type, ward_No, bed_No, status, ward_Id, financials } = req.body;

    // Validate required fields for "Admitted" status
    if (status === "Admitted" && (!ward_Type || !ward_No || !bed_No || !ward_Id)) {
      return res.status(400).json({
        success: false,
        message: "Ward type, ward number, bed number and ward ID are required for admission"
      });
    }

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
      // ADMISSION/TRANSFER LOGIC

      // 1. Validate new ward exists
      const newWard = await hospitalModel.ward.findById(ward_Id);
      if (!newWard) {
        return res.status(404).json({
          success: false,
          message: "New ward not found"
        });
      }

      // 2. Check if bed exists in new ward (case-insensitive match)
      const newBed = newWard.beds.find(b =>
        b.bedNumber.toString().trim().toLowerCase() ===
        bed_No.toString().trim().toLowerCase()
      );

      if (!newBed) {
        return res.status(400).json({
          success: false,
          message: `Bed ${bed_No} not found in ward ${newWard.name}`,
          availableBeds: newWard.beds.map(b => b.bedNumber)
        });
      }

      // 3. Check if bed is available (excluding current patient)
      if (newBed.occupied && newBed.currentPatient?.toString() !== currentAdmission.patient_MRNo) {
        return res.status(400).json({
          success: false,
          message: `Bed ${bed_No} is already occupied by another patient`
        });
      }

      // 4. Check if no actual changes are being made
      if (status === currentAdmission.status &&
        currentAdmission.ward_Information.bed_No === bed_No &&
        currentAdmission.ward_Information.ward_Id.toString() === ward_Id) {
        return res.status(400).json({
          success: false,
          message: "No changes detected in ward/bed assignment"
        });
      }

      // 5. Free up old bed if transferring to new ward/bed
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
              h => h.patientId.toString() === currentAdmission.patient_MRNo && !h.dischargeDate
            );

            if (currentStay) {
              currentStay.dischargeDate = new Date();
            }

            await oldWard.save();
          }
        }
      }

      // 6. Occupy new bed
      newBed.occupied = true;
      newBed.currentPatient = currentAdmission.patient_MRNo;

      // Add to bed history
      newBed.history.push({
        patientId: currentAdmission.patient_MRNo,
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

          // Update discharge date in bed history
          const currentStay = bed.history.find(
            h => h.patientId.toString() === currentAdmission.patient_MRNo && !h.dischargeDate
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
        admission_Fee: financials.admission_Fee || 0,
        discount: financials.discount || 0,
        payment_Status: financials.payment_Status || "Unpaid",
        total_Charges: (financials.admission_Fee || 0) - (financials.discount || 0)
      };

      if (financials.perDayCharges) {
        updateData.financials.perDayCharges = {
          amount: financials.perDayCharges.amount || 0,
          status: financials.perDayCharges.status || "Unpaid",
          startDate: financials.perDayCharges.startDate || new Date()
        };
      }
    }

    if (admission_Type) {
  updateData["admission_Details.admission_Type"] = admission_Type;
}

    // Update ward information if admitting/transferring
    if (status === "Admitted") {
      updateData.ward_Information = {
        ward_Type,
        ward_No,
        bed_No,
        ward_Id
      };
    }

    // Update the admission record
    const updatedPatient = await hospitalModel.AdmittedPatient.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

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

    const deletedRecord = await hospitalModel.AdmittedPatient.findByIdAndUpdate(
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
      await hospitalModel.Patient.findOneAndUpdate(
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

const dischargePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { wardId, bedNumber, patientMRNo } = req.body;

    // Option 1: Discharge by admission ID
    if (id) {
      const admission = await hospitalModel.AdmittedPatient.findById(id);
      if (!admission) {
        return res.status(404).json({
          success: false,
          message: "Admission not found"
        });
      }

      // Update ward bed status
      const ward = await hospitalModel.ward.findById(admission.ward_Information?.ward_Id).notDeleted();
      if (ward) {
        const bed = ward.beds.find(b =>
          b.bedNumber?.toString().trim().toUpperCase() ===
          admission.ward_Information?.bed_No?.toString().trim().toUpperCase() &&
          !b.isDeleted
        );

        if (bed) {
          // Verify patient MRNo matches if provided
          if (patientMRNo && bed.currentPatientMRNo !== patientMRNo) {
            return res.status(400).json({
              success: false,
              message: "Patient MRNo doesn't match the bed assignment"
            });
          }

          bed.occupied = false;
          // Safer history update
          const currentAdmission = bed.history.find(h => {
            if (!h || h.dischargeDate) return false;
            const patientIdentifier = h.patientId || h.patientMRNo;
            return patientIdentifier?.toString() === admission.patient_MRNo?.toString();
          });

          if (currentAdmission) {
            currentAdmission.dischargeDate = new Date();
          }
          bed.currentPatientMRNo = null;
          await ward.save();
        }
      }

      // Update admission record
      admission.status = "Discharged";
      admission.admission_Details.discharge_Date = new Date();
      await admission.save();

      return res.status(200).json({
        success: true,
        message: "Patient discharged successfully",
        data: {
          admissionId: admission._id,
          patientMRNo: admission.patient_MRNo,
          dischargeDate: admission.admission_Details.discharge_Date
        }
      });
    }
    // Option 2: Discharge by ward/bed/patient details
    else if (wardId && bedNumber && patientMRNo) {
      const ward = await hospitalModel.ward.findById(wardId).notDeleted();
      if (!ward) {
        return res.status(404).json({
          success: false,
          message: "Ward not found"
        });
      }

      const bed = ward.beds.find(b =>
        b.bedNumber?.toString().trim().toUpperCase() === bedNumber.toString().trim().toUpperCase() &&
        !b.isDeleted
      );

      if (!bed) {
        return res.status(404).json({
          success: false,
          message: "Bed not found in ward"
        });
      }

      // Verify patient MRNo matches
      if (!bed.occupied || bed.currentPatientMRNo !== patientMRNo) {
        return res.status(400).json({
          success: false,
          message: "Patient is not assigned to this bed or MRNo doesn't match"
        });
      }

      // Update bed status
      bed.occupied = false;
      const currentAdmission = bed.history.find(
        h => h && h.patientMRNo === patientMRNo && !h.dischargeDate
      );

      if (currentAdmission) {
        currentAdmission.dischargeDate = new Date();
      }

      bed.currentPatientMRNo = null;
      await ward.save();

      // Update admission record if exists
      try {
        const admission = await hospitalModel.AdmittedPatient.findOne({
          patient_MRNo: patientMRNo,
          status: "Admitted",
          "ward_Information.ward_Id": wardId,
          "ward_Information.bed_No": bedNumber
        });

        if (admission) {
          admission.status = "Discharged";
          admission.admission_Details.discharge_Date = new Date();
          await admission.save();
        }
      } catch (err) {
        console.error("Error updating admission record:", err);
      }

      return res.status(200).json({
        success: true,
        message: "Patient discharged from bed successfully",
        data: {
          wardId: ward._id,
          bedNumber: bed.bedNumber,
          patientMRNo,
          dischargeDate: currentAdmission?.dischargeDate || new Date()
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Either admission ID or wardId/bedNumber/patientMRNo must be provided"
      });
    }
  } catch (error) {
    console.error("Discharge error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during discharge",
      error: error.message
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