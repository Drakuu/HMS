const mongoose = require("mongoose");

const otSchema = new mongoose.Schema(
    {
        patient_MRNo: { type: String },
        patient_Details: {
            patient_Name: { type: String },
            patient_CNIC: { type: String },
            patient_Gender: { type: String },
            patient_DateOfBirth: { type: Date },
            patient_Address: { type: String },
            patient_Guardian: {
                guardian_Relation: String,
                guardian_Name: String,
                guardian_Contact: String
            },
        },
        // wardInformation: {
        //     wardType: { type: String },
        //     roomNumber: { type: String },
        //     bedNumber: { type: String },
        //     admission_Date: { type: Date },
        //     discharge_Date: { type: Date },
        // },
        procedure: { type: String },
        surgeon: { type: String },
        department: { type: String },
        otTime: {
            startTime: { type: String }, 
            endTime: { type: String },  
        },
        otNumber: { type: String }, 
        status: { type: String },
        otInformation: {
            operationName: { type: String },
            reasonForOperation: { type: String },
            doctor: {
                seniorSurgeon: [{ type: String }],
                assistantDoctors: [{ type: String }],
                nurses: [{ type: String }],
                doctors_Fee: { type: Number },
                anesthesia_Type: { type: String },
                operation_Date: { type: Date },
                surgery_Type: { type: String },
                operation_Outcomes: { type: String },
            },
            equipment_Charges: { type: Number },
        },
        total_Operation_Cost: { type: Number },
        operation_PaymentStatus: { type: String },
        payment_Method: { type: String }, 
    deleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

const Ot = mongoose.model("OT", otSchema);
module.exports = Ot;
