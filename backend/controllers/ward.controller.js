const hospitalModel = require("../models/index.model");

// Create a new ward
exports.createWard = async (req, res) => {
    const { name, department_Name, wardNumber, bedCount, nurseAssignments } = req.body;

    try {
        // Generate beds
        const beds = Array.from({ length: bedCount }, (_, i) => ({
            bedNumber: `B${wardNumber}-${i + 1}`,
            occupied: false
        }));

        const newWard = await hospitalModel.ward.create({
            name,
            wardNumber,
            bedCount,
            department_Name,
            beds,
            nurses: nurseAssignments
        });

        // Assign to department
        const department = await hospitalModel.Department.findOne({
            name: { $regex: new RegExp(`^${department_Name}$`, 'i') }
        });

        if (!department) {
            await newWard.softDelete();
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        department.ward.push(newWard._id);
        await department.save();

        res.status(201).json({
            success: true,
            message: 'Ward created successfully',
            ward: newWard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all non-deleted wards
exports.getAllWards = async (req, res) => {
    try {
        const wards = await hospitalModel.ward.find().notDeleted();
        res.status(200).json({
            success: true,
            count: wards.length,
            wards
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch wards",
            error: error.message
        });
    }
};

// Update Ward by ID
exports.updateWardById = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ward ID"
            });
        }

        // Prevent certain fields from being updated
        const restrictedFields = ['_id', 'isDeleted', 'beds.history'];
        restrictedFields.forEach(field => {
            if (updates[field]) {
                delete updates[field];
            }
        });

        const updatedWard = await hospitalModel.ward.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).notDeleted();

        if (!updatedWard) {
            return res.status(404).json({
                success: false,
                message: "Ward not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Ward updated successfully",
            data: updatedWard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update ward",
            error: error.message
        });
    }
};

// Get wards by department (non-deleted only)
exports.getWardsByDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;

        // First validate the department exists
        const department = await hospitalModel.Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Get all wards with full details
        const wards = await hospitalModel.ward.find({
            _id: { $in: department.ward },
            isDeleted: false
        }); // Exclude unnecessary fields

        res.status(200).json({
            success: true,
            wards
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getWardsById = async (req, res) => {
    try {
        const { wardId } = req.params;
        // res.send("here")
        // First validate the department exists
        const ward = await hospitalModel.ward.findById(wardId);
        if (!ward) {
            return res.status(404).json({
                success: false,
                message: 'ward not found'
            });
        }

        res.status(200).json({
            success: true,
            ward
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getPatientbyBedId = async (req, res) => {
    try {
        const { bedId } = req.params;

        // Find the ward containing this bed
        const ward = await hospitalModel.ward.findOne({
            'beds._id': bedId,
            isDeleted: false
        });

        if (!ward) {
            return res.status(404).json({
                success: false,
                message: 'Bed not found in any ward'
            });
        }

        // Find the specific bed
        const bed = ward.beds.find(b =>
            b._id.toString() === bedId &&
            !b.isDeleted
        );

        if (!bed) {
            return res.status(404).json({
                success: false,
                message: 'Bed not found or has been deleted'
            });
        }

        // Get patient details from AdmittedPatient collection
        let patientDetails = null;
        if (bed.occupied && bed.currentPatientMRNo) {
            try {
                // Query using the correct field name from your schema
                patientDetails = await hospitalModel.AdmittedPatient.findOne({
                    patient_MRNo: bed.currentPatientMRNo
                }).select('patient_Name patient_MRNo patient_CNIC patient_Gender patient_DateOfBirth patient_Address patient_Guardian admission_Details ward_Information status');

                if (!patientDetails) {
                    patientDetails = { 
                        patient_MRNo: bed.currentPatientMRNo, 
                        error: "Patient details not found in admitted patients" 
                    };
                }
            } catch (patientError) {
                console.error('Error fetching patient:', patientError);
                patientDetails = { 
                    patient_MRNo: bed.currentPatientMRNo, 
                    error: "Error fetching patient details" 
                };
            }
        }

        res.status(200).json({
            success: true,
            data: {
                bed: {
                    id: bed._id,
                    bedNumber: bed.bedNumber,
                    status: bed.occupied ? 'Occupied' : 'Available',
                    currentPatientMRNo: bed.currentPatientMRNo,
                    ward: {
                        id: ward._id,
                        name: ward.name,
                        wardNumber: ward.wardNumber,
                        department: ward.department_Name
                    }
                },
                patient: patientDetails,
                history: bed.history.filter(h => !h.isDeleted)
            }
        });

    } catch (error) {
        console.error('Error in getPatientbyBedId:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
// Soft delete a ward
exports.deleteWard = async (req, res) => {
    try {
        const { id } = req.params;

        const ward = await hospitalModel.ward.findById(id).notDeleted();
        if (!ward) {
            return res.status(404).json({
                success: false,
                message: "Ward not found"
            });
        }

        // Check if any beds are occupied
        const occupiedBeds = ward.beds.some(bed => bed.occupied);
        if (occupiedBeds) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete ward with occupied beds"
            });
        }

        await ward.softDelete();

        // Remove from department
        await hospitalModel.Department.updateMany(
            { ward: id },
            { $pull: { ward: id } }
        );

        res.status(200).json({
            success: true,
            message: "Ward deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete ward",
            error: error.message
        });
    }
};

// Get bed history
exports.getBedHistory = async (req, res) => {
    try {
        const { wardId, bedNumber } = req.params;

        const ward = await hospitalModel.ward.findById(wardId).notDeleted();
        if (!ward) {
            return res.status(404).json({
                success: false,
                message: "Ward not found"
            });
        }

        const bed = ward.beds.find(b =>
            b.bedNumber.toString().trim().toUpperCase() === bedNumber.toString().trim().toUpperCase() &&
            !b.isDeleted
        );

        if (!bed) {
            return res.status(404).json({
                success: false,
                message: "Bed not found in ward"
            });
        }

        // Return history with only MRNo
        const history = bed.history
            .filter(h => !h.isDeleted)
            .map(h => ({
                patientMRNo: h.patientMRNo,
                admissionDate: h.admissionDate,
                dischargeDate: h.dischargeDate
            }));

        res.status(200).json({
            success: true,
            history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get bed history",
            error: error.message
        });
    }
};