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
      diagnosis: { type: String }
    },
    ward_Information: {
      wardType: { type: String },
      roomNumber: { type: String },
      availableBeds: { type: String },
      pdCharges: { type: Number, default: 0 },
    },
    financials: {
      admission_Fee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total_Charges: { type: Number, default: 0 },
      payment_Status: { type: String, default: "paid" }
    },
    status: { type: String },
    deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Auto-calculate total charges
admittedPatientSchema.pre('save', function (next) {
  if (this.isModified('admission_Details.discharge_Date') || this.isNew) {
    const admissionDate = this.admission_Details.admission_Date;
    const dischargeDate = this.admission_Details.discharge_Date || new Date();
    const daysAdmitted = dischargeDate ? Math.ceil((dischargeDate - admissionDate) / (1000 * 60 * 60 * 24)) : 1;

    this.financials.total_Charges =
      this.financials.admission_Fee +
      (this.financials.daily_Charges * daysAdmitted) -
      this.financials.discount;
  }
  next();
});

// Adding virtual for calculating patient age dynamically
// admittedPatientSchema.virtual('patient_Age').get(function() {
//   const ageDifMs = Date.now() - this.patient_DateOfBirth.getTime();
//   const ageDate = new Date(ageDifMs); 
//   return Math.abs(ageDate.getUTCFullYear() - 1970); 
// });

module.exports = mongoose.model("AdmittedPatient", admittedPatientSchema);
