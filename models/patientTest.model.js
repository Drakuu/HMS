const mongoose = require('mongoose');

const patientTestSchema = new mongoose.Schema({
    // originalPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
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
        testDetails: {  // Add this field
            testName: String,
            testCode: String,
            testPrice: Number,
            fields: [{
                name: String,
                unit: String,
                normalRange: {
                    male: { min: Number, max: Number },
                    female: { min: Number, max: Number }
                }
            }]
        },
        results: [{
            fieldName: String,
            value: String,
            unit: String,
            normalRange: String
        }],
        testDate: { type: Date, default: Date.now },
        resultDate: { type: Date },
        status: {
            type: String,
            enum: ['pending', 'completed', 'cancelled'],
            default: 'pending'
        },
        notes: { type: String },
         statusHistory: [{
            status: { type: String,  enum: ['registered', 'sample-collected', 'processing', 'completed', 'reported', 'cancelled'], },
            changedAt: { type: Date, default: Date.now },
            changedBy: { type: String }  // Person who changed the status
        }]
    }],

    totalAmount: { type: Number, },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'partial'],
        default: 'pending'
    },
    labNotes: { type: String },
    performedBy: { type: String },
    isDeleted: { type: Boolean, default: false },

}, { timestamps: true });

const PatientTest = mongoose.model('PatientTest', patientTestSchema);

module.exports = PatientTest