const mongoose = require("mongoose");

const RadiologyReportSchema = new mongoose.Schema({
  patientMRNO: String,
  patientName: String,
  age: String,
  sex: String,
  date: Date,
  templateName: String,
  finalContent: String,
  referBy: String,
  deleted: { type: Boolean, default: false },
  totalAmount: Number,
  paidAmount: Number,
  discount: Number,
  finalAmount: Number,
  performedBy: { name: String, id: String },
  createdBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("RadiologyReport", RadiologyReportSchema);
