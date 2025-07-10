const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    appointmentPatientCNIC: { 
        type: String, 
        required: true, 
        minlength: 13, 
        maxlength: 13 
    },
    appointmentMRNO: { type: String, required: true },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    appointmentDoctorName: { type: String },
    appointmentType: { type: String },
    appointmentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'confirm'],
        default: 'pending'
    },
    message: { type: String },
    deleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);