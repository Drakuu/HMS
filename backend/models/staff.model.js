const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    // Personal Information
    profilePicture: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    dateOfBirth: { type: Date },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    cnic: { type: String, unique: true },

    // Professional Information
    staffId: { type: String, unique: true },
    designation: { type: String },
    department: { type: String, required: true },
    staffType: {
        type: String,
        required: true,
        enum: ['Doctor', 'Nurse', 'Lab Technician', 'Receptionist', 'Cleaning Staff', 'Administrative']
    },
    qualifications: [{ type: String }],
    joiningDate: { type: Date, default: Date.now },

    // Contact & Emergency
    emergencyContact: {
        name: { type: String },
        relation: { type: String },
        phone: { type: String }
    },

    // Work Schedule
    shift: { type: String, enum: ['Morning', 'Evening', 'Night', 'Rotational'] },
    shiftTiming: {
        start: { type: String },
        end: { type: String }
    },

    // Financial
    salary: {
        basic: { type: Number },
        allowances: { type: Number, default: 0 },
        deductions: { type: Number, default: 0 }
    },

    // General shift and timing for all staff
    shift: { type: String, enum: ['Morning', 'Evening', 'Night', 'Rotational'] },
    shiftTiming: {
        start: { type: String }, // e.g. '08:00'
        end: { type: String }    // e.g. '16:00'
    },
    // doctorDetails: {
    //     specialization: { type: String },
    //     licenseNumber: { type: String },
    //     consultingHours: { type: String },
    //     consultationFee: { type: Number },
    //     availableDays: [{ type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }],
    //     type: { type: String },
    //     isSurgeon: { type: Boolean, default: false },
    //     wardRounds: { type: String },
    //     contract: {
    //         doctorPercentage: { type: Number }, 
    //         hospitalPercentage: { type: Number }, 
    //         contractDuration: { type: String }, 
    //         agreement: { type: String } 
    //     }
    // },

    // // Nurse Specific
    // nurseDetails: {
    //     assignedWard: { type: String },
    //     certifications: [{ type: String }],
    //     nursingLicense: { type: String },
    // },
    //  // Cleaning Staff Specific
    // cleaningStaffDetails: {
    //     assignedArea: { type: String },
    //     cleaningCertification: { type: Boolean },
    //     equipmentTraining: [{ type: String }]
    // },
    // // Admin Specific
    // adminDetails: {
    //     role: { type: String },
    //     accessLevel: { type: Number },
    //     systemAccess: [{ type: String }],
    // },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;