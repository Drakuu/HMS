const mongoose = require("mongoose");

const admittedPatientSchema = new mongoose.Schema(
  {
    patient_MRNo: { type: String, },
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
    admission_Details: {
      admission_Date: { type: Date },
      discharge_Date: { type: Date },
      admitting_Doctor: { type: String },
      diagnosis: { type: String },
      admission_Type: { type: String }
    },
    ward_Information: {
      ward_Type: { type: String },
      ward_No: { type: String },
      bed_No: { type: String },
      pdCharges: { type: Number, default: 0 },
      ward_Id: { type: mongoose.Schema.Types.ObjectId } // Add if needed
    },
    financials: {
      admission_Fee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total_Charges: { type: Number, default: 0 },
      payment_Status: { type: String, default: "paid" },
      perDayCharges: {
        amount: { type: Number, default: 0 },
        status: { type: String, default: "Unpaid" },
        startDate: { type: Date, default: Date.now }
      }
    },
    status: { type: String },
    deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdmittedPatient", admittedPatientSchema);
