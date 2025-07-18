const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
    patientTestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PatientTest',
        required: true
    },
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestManagment',
        required: true
    },
    
    patientGender: { type: String, enum: ['male', 'female', 'other'], required: true },
    results: [{
        fieldName: { type: String, required: true },
        value: { type: String, required: true },
        unit: { type: String },
        normalRange: {
            min: Number,
            max: Number
        },
        isNormal: { type: Boolean },
        notes: { type: String }
    }],
    status: {
        type: String,
        enum: ['pending', 'completed', 'processing', 'verified', 'cancelled', 'draft'],
        default: 'draft'
    },
    performedBy: { type: String },
    verifiedBy: { type: String },
    notes: { type: String },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const TestResult = mongoose.model('TestResult', testResultSchema);

module.exports = TestResult;