const mongoose = require("mongoose");

const testManagmentSchema = new mongoose.Schema(
  {
    testName: { type: String, required: true },
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
          male: {
            min: { type: Number },
            max: { type: Number },
          },
          female: {
            min: { type: Number },
            max: { type: Number },
          },
        },
      },
    ],
  },
  { timestamps: true }
);

const TestManagment = mongoose.model("TestManagment", testManagmentSchema, "testmanagments");

module.exports = TestManagment