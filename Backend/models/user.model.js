const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    user_Name: { type: String },
    userId: { type: String },
    user_Email: { type: String, unique: true },
    user_Password: { type: String },
    user_Contact: { type: String },
    user_Address: { type: String },
    user_Access: {
      type: String,
      enum: ["Admin", "Receptionist", "Lab"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    }, // to check if user is verified or not
    verificationCode: {
      type: String,
    }, // for storing email/SMS verification code
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;