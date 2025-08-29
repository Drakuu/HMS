const mongoose = require("mongoose");

const testManagementSchema = new mongoose.Schema(
  {
    testName: { type: String, required: true },
    testDept: { type: String },
    testCode: { type: String, required: true, unique: true },
    description: { type: String },
    instructions: { type: String },
    testPrice: { type: Number, required: true },
    requiresFasting: { type: Boolean, default: false },
    reportDeliveryTime: { type: String },
    fields: [
      {
        name: { type: String, required: true },
        unit: { type: String },
        normalRange: {
          type: Map,
          of: {
            min: { type: mongoose.Schema.Types.Mixed }, // Can be String, Number, etc.
            max: { type: mongoose.Schema.Types.Mixed },  // Can be String, Number, etc.
            unit: { type: String }, // Optional per-range unit override
            description: { type: String } // Additional context
          }
        },
        // Store commonly used options directly in the field
        commonUnits: [{ type: String }],
        commonLabels: [{ type: String }]
      }
    ],
    isDeleted: { type: Boolean },
  },
  { timestamps: true }
);

// Add indexes for better performance
testManagementSchema.index({ testCode: 1 });
// testManagementSchema.index({ "fields.name": 1 });

const TestManagement = mongoose.model("TestManagement", testManagementSchema, "testmanagements");

module.exports = TestManagement;