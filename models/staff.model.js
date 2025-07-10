const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    designation: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    department: { type: String, required: true },
    staffType: { 
        type: String, 
        required: true,
        enum: ['Doctor', 'Nurse', 'Cleaning', 'Administrative', 'Technician']
    },
    qualification: { type: String },
    emergencyContact: {
        name: { type: String },
        relation: { type: String },
        phone: { type: String }
    },
    doctorDetails: {
        specialization: { type: String },
        licenseNumber: { type: String },
        consultingHours: { type: String },
        wardRounds: { type: String },
        procedures: [{ type: String }]
    },
    nurseDetails: {
        shift: { type: String, enum: ['Morning', 'Evening', 'Night', 'Rotational'] },
        assignedWard: { type: String },
        nursingLicense: { type: String },
        certifications: [{ type: String }]
    },
    cleaningStaffDetails: {
        shift: { type: String, enum: ['Morning', 'Evening', 'Night', 'Rotational'] },
        assignedArea: { type: String },
        cleaningCertification: { type: Boolean },
        equipmentTraining: [{ type: String }]
    },
    adminDetails: {
        role: { type: String },
        accessLevel: { type: Number },
        systemAccess: [{ type: String }]
    },
    joiningDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;