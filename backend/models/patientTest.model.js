const mongoose = require('mongoose');

const patientTestSchema = new mongoose.Schema({
    isExternalPatient: { type: Boolean, default: false },
    tokenNumber: { type: Number, required: true },
    patient_Detail: {
        patient_MRNo: { type: String, ref: 'Patient' },
        patient_CNIC: { type: String, ref: 'Patient' },
        patient_Name: { type: String },
        patient_ContactNo: { type: String },
        patient_Gender: { type: String },
        patient_Age: { type: String },
        referredBy: { type: String },
    },

    selectedTests: [{
        test: {
            type: mongoose.Schema.Types.ObjectId, ref: 'TestManagment',
        },
        testDetails: {
            testName: String,
            testCode: String,
            testPrice: Number,
            sampleStatus: { type: String, enum: ['pending', 'collected'], default: 'pending' },

            reportStatus: { type: String, enum: ['not_started', 'draft', 'completed'], default: 'not_started' },
        },
        testDate: { type: Date, default: Date.now },
        resultDate: { type: Date },
        statusHistory: [{
            status: { type: String, enum: ['registered', 'sample-collected', 'processing', 'completed', 'reported', 'cancelled', 'pending'], },
            changedAt: { type: Date, default: Date.now },
            changedBy: { type: String } 
        }]
    }],

    totalAmount: { type: Number, },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'partial'], default: 'pending' },

    labNotes: { type: String },
    performedBy: { type: String },
    isDeleted: { type: Boolean, default: false },

}, { timestamps: true });

const PatientTest = mongoose.model('PatientTest', patientTestSchema);

module.exports = PatientTest