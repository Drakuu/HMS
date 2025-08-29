const mongoose = require('mongoose');

// Bed History schema
const bedHistorySchema = new mongoose.Schema({
  patientMRNo: { type: String, required: true }, // Only MR number
  admissionDate: { type: Date, default: Date.now },
  dischargeDate: { type: Date },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Bed schema
const bedSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true, uppercase: true, trim: true },
  occupied: { type: Boolean, default: false, },
  currentPatientMRNo: { type: String }, // Only MR number
  history: [bedHistorySchema],
  isDeleted: { type: Boolean, default: false }
});

// Ward schema
const wardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  department_Name: { type: String, required: true, trim: true },
  wardNumber: { type: Number, required: true, unique: true },
  bedCount: { type: Number, required: true, min: 1 },
  beds: [bedSchema],
  nurses: [{
    nurse: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Staff'
    },
    role: {
      type: String, enum: ['Head Nurse', 'Staff Nurse', 'Trainee'], default: 'Staff Nurse'
    }
  }],
  isDeleted: {
    type: Boolean, default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Soft delete method
wardSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  await this.save();
};

// Query helper for non-deleted items
wardSchema.query.notDeleted = function () {
  return this.where({ isDeleted: false });
};

const Ward = mongoose.model('Ward', wardSchema);

module.exports = Ward;