const mongoose = require("mongoose");

const admittedPatientSchema = new mongoose.Schema(
  {
    // Reference to the original patient
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },

    admission_Details: {
      admission_Date: { type: Date, default: Date.now },
      discharge_Date: { type: Date },
      admitting_Doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', },
      diagnosis: { type: String },
      admission_Type: { type: String }
    },

    ward_Information: {
      ward_Type: { type: String },
      ward_No: { type: String },
      bed_No: { type: String },
      pdCharges: { type: Number, default: 0 },
      ward_Id: { type: mongoose.Schema.Types.ObjectId }
    },

    financials: {
      admission_Fee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total_Charges: { type: Number, default: 0 },
      payment_Status: { type: String, default: "paid" },
    },

    status: {
      type: String,
      enum: ['Admitted', 'Discharged', 'Transferred'],
      default: 'Admitted'
    },

    deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Virtual for patient MR Number (for easy access)
admittedPatientSchema.virtual('patient_MRNo').get(function () {
  return this.patient?.patient_MRNo;
});

// Ensure virtuals are included when converting to JSON
admittedPatientSchema.set('toJSON', { virtuals: true });
admittedPatientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("AdmittedPatient", admittedPatientSchema);