const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    user_Name: { type: String },
    user_Email: { type: String, unique: true, },
    user_Password: { type: String,  required: true },
    user_CNIC : { type : String , unique: true, },
    user_Identifier: { type: String, unique: true,  },
    user_Contact: { type: String },
    user_Address: { type: String },
    user_Access: {
      type: String,
      enum: ["Admin", "Receptionist", "Lab", "Doctor", "Patient"],
       required: true
    },
     doctorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    isVerified: { type: Boolean, default: false, },
    verificationCode: { type: String, },
  },
  { timestamps: true, }
);

const User = mongoose.model("User", userSchema);

module.exports = User;