const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    patient_MRNo: { type: String, },  
    patient_Name: { type: String },
    patient_ContactNo: { type: String },
    patient_Guardian: {
      guardian_Relation: { type: String, },
      guardian_Name: { type: String, },
      guardian_Contact: { type: String, },
    },
    patient_CNIC: { type: String },
    patient_Gender: { type: String },
    Patient_Age: { type: String },
    patient_DateOfBirth: { type: String },
    patient_Address: { type: String },
    patient_HospitalInformation: {
      doctor_Name: { type: String },
      doctor_Department: { type: String },
      doctor_Fee: { type: Number },
      discount: { type: Number },
      total_Fee: { type: Number },
      doctor_Specialization : {type : String},
      qualification : {type : String},
      gender : {type : String},
      token: { type: Number, },
      amount_Status: { type: String, },
      referredBy: { type: String },
    },
    patient_BloodType: { type: String },
    patient_MaritalStatus: { type: String },
    deleted: { type: Boolean, default: false },
  },

  {
    timestamps: true,
  }
);

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
