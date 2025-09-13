const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    user_Identifier: { type: String, unique: true },
    user_Name: { type: String },
    user_Email: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
      set: function (email) {
        // Convert empty strings, undefined, or null to null
        return !email || email.trim() === '' ? null : email;
      }
    },
    user_Password: { type: String, required: true },
    user_CNIC: { type: String, unique: true },
    user_Contact: { type: String },
    user_Address: { type: String },
    user_Access: {
      type: String,
      enum: ["Admin", "Receptionist", "Lab", "Radiology", "Doctor", "Nurse", "Patient"],
      required: true
    },
    doctorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    verificationCode: { type: String },
  },
  { timestamps: true }
);

// Pre-save middleware to handle email conversion
userSchema.pre('save', function (next) {
  if (this.user_Email === '' || this.user_Email === undefined) {
    this.user_Email = null;
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;