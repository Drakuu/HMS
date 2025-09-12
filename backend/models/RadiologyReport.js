const mongoose = require('mongoose');

const RadiologyReportSchema = new mongoose.Schema(
  {
    patientMRNO: String,
    patientName: String,
    patient_ContactNo: String,
    age: Date,
    sex: String,
    date: { type: Date, default: Date.now },
    templateName: {
      type: [String],
    },

    finalContent: { type: [String] },
    referBy: String,
    deleted: { type: Boolean, default: false },

    // Billing Info
    totalAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 0 },
    paidAfterReport: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    refundableAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending',
    },
    refunded: [
      {
        refundAmount: Number,
        refundReason: String,
        performedByname: String,
        performedByid: mongoose.Schema.Types.ObjectId,
        refundedAt: { type: Date, default: Date.now },
      },
    ],
    history: [
      {
        action: { type: String, required: true },
        performedBy: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    performedBy: {
      name: String,
      id: mongoose.Schema.Types.ObjectId,
    },

    createdBy: mongoose.Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RadiologyReport', RadiologyReportSchema);
