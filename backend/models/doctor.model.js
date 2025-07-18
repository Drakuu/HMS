const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    doctor_Identifier: { type: String, unique: true, required: true, },
    doctor_Image: { filePath: { type: String }, },
    doctor_Name: { type: String, required: true, },
    doctor_Email: { type: String, unique: true, sparse: true, default: undefined },
    doctor_Contact: { type: String, sparse: true, unique: true, },
    doctor_Address: { type: String, },
    doctor_Department: { type: String },
    doctor_CNIC: { type: String, unique: true, },
    doctor_Type: { type: String, },
    doctor_Specialization: { type: String, },
    doctor_Qualifications: [{ type: String }],
    doctor_LicenseNumber: { type: String },
    doctor_Fee: { type: Number },

    doctor_Contract: {
      doctor_Percentage: { type: Number },
      hospital_Percentage: { type: Number },
      contract_Time: { type: String },
      doctor_JoiningDate: { type: String, },
      doctor_Agreement: { filePath: { type: String }, },
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true, }
);
const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
