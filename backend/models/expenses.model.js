const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  doctor: {
    type: String,
    required: true,
    trim: true
  },
  doctorWelfare: {
    type: Number,
    required: true,
    min: 0
  },
  otExpenses: {
    type: Number,
    required: true,
    min: 0
  },
  otherExpenses: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  total: {
    type: Number,
    required: true
  },
  deleted: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true
});

// Calculate total before saving
expenseSchema.pre('save', function (next) {
  this.total = this.doctorWelfare + this.otExpenses + this.otherExpenses;
  next();
});

// Static method to get doctor summary
expenseSchema.statics.getDoctorSummary = function () {
  return this.aggregate([
    {
      $group: {
        _id: '$doctor',
        totalWelfare: { $sum: '$doctorWelfare' },
        totalOT: { $sum: '$otExpenses' },
        totalOther: { $sum: '$otherExpenses' },
        totalAmount: { $sum: '$total' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);
};

// Static method to get grand totals
expenseSchema.statics.getGrandTotals = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        grandWelfare: { $sum: '$doctorWelfare' },
        grandOT: { $sum: '$otExpenses' },
        grandOther: { $sum: '$otherExpenses' },
        grandTotal: { $sum: '$total' },
        totalEntries: { $sum: 1 },
        uniqueDoctors: { $addToSet: '$doctor' }
      }
    },
    {
      $project: {
        _id: 0,
        grandWelfare: 1,
        grandOT: 1,
        grandOther: 1,
        grandTotal: 1,
        totalEntries: 1,
        totalDoctors: { $size: '$uniqueDoctors' }
      }
    }
  ]);
};

module.exports = mongoose.model('Expense', expenseSchema);