const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema(
  {
    testId: String,
    performedByname: String,
    performedByid: String,
    refundAmount: Number,
    refundReason: String,
  },
  {
    timestamps: true,
    _id: false,
  }
);

const patientTestSchema = new mongoose.Schema(
  {
    isExternalPatient: { type: Boolean, default: false },
    tokenNumber: { type: Number, required: true },
    patient_Detail: {
      patient_MRNo: { type: String, ref: "Patient" },
      patient_Guardian: { type: String, ref: "Patient" },
      patient_CNIC: { type: String, ref: "Patient" },
      patient_Name: { type: String },
      patient_ContactNo: { type: String },
      patient_Gender: { type: String },
      patient_Age: { type: String },
      referredBy: { type: String },
    },
    selectedTests: [
      {
        test: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TestManagment",
        },
        testStatus: {
          type: String,
          enum: ["draft", "registered", "completed", "cancelled", "refunded"],
          default: "registered",
        },
        testDetails: {
          advanceAmount: { type: Number, default: 0 },
          discountAmount: { type: Number, default: 0 },
          remainingAmount: { type: Number, default: 0 },
          testName: String,
          testCode: String,
          testPrice: { type: Number, required: true },
          sampleStatus: {
            type: String,
            enum: ["pending", "collected"],
            default: "pending",
          },
          reportStatus: {
            type: String,
            enum: ["not_started", "draft", "completed"],
            default: "not_started",
          },
        },
        testDate: { type: Date, default: Date.now },
        resultDate: { type: Date },
        statusHistory: [
          {
            status: {
              type: String,
              enum: [
                "registered",
                "sample-collected",
                "processing",
                "completed",
                "reported",
                "cancelled",
              ],
            },
            changedAt: { type: Date, default: Date.now },
            changedBy: { type: String },
          },
        ],
      },
    ],
    totalAmount: { type: Number, required: true },
    advanceAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    cancelledAmount: { type: Number, default: 0 },
    refundableAmount: { type: Number, default: 0 },
    refunded: [refundSchema],
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partial", "refunded"],
      default: "pending",
    },
    paidAfterReport: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    labNotes: { type: String },
    history: [
      {
        action: { type: String, required: true },
        performedBy: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    performedBy: String,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PatientTest = mongoose.model("PatientTest", patientTestSchema);

module.exports = PatientTest;
