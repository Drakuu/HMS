const bcrypt = require("bcrypt");
const hospitalModel = require("../models/index.model");
const { sendverficationcode } = require("../middleware/Email");
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");


const login = async (req, res) => {
  try {
    const { loginId, password } = req.body; // Changed from email to loginId

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Login ID and password are required",
      });
    }
    console.log(`the user with `, {
      loginId,
      password
    })

    // Check if loginId is email, phone, or staffId
    const isEmail = loginId.includes('@');
    const isPhone = /^\d+$/.test(loginId); // Simple phone number check
    const isStaffId = /^[A-Z]{3}-[A-Z]{2}-\d{4}$/.test(loginId); // Matches format like DOC-JS-0001

    // First check in Staff collection
    let user = await hospitalModel.staff.findOne({
      $or: [
        { email: isEmail ? loginId.toLowerCase().trim() : undefined },
        { phone: isPhone ? loginId : undefined },
        { staffId: isStaffId ? loginId.toUpperCase() : undefined }
      ].filter(cond => cond !== undefined), // Remove undefined conditions
      isActive: true,
      isDeleted: false
    });

    let userType = "staff";

    // If not found in Staff, check User collection (only by email)
    if (!user) {
      if (isEmail) {
        user = await hospitalModel.User.findOne({
          user_Email: loginId.toLowerCase().trim(),
          isVerified: true
        });
        userType = "user";
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Account not found or not active",
      });
    }

    // Verify password
    const passwordField = userType === "staff" ? "password" : "user_Password";
    const validPassword = await bcrypt.compare(password, user[passwordField]);

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Invalid credentials",
      });
    }

    // Prepare user data for JWT
    const userData = {
      id: user._id,
      identifier: userType === "staff" ? user.staffId : user.user_Email,
      access: userType === "staff" ? user.staffType : user.user_Access,
      name: userType === "staff" ? `${user.firstName} ${user.lastName}` : user.user_Name,
      type: userType
    };

    // Generate token
    const jwtLoginToken = jwt.sign(userData, JWT_SECRET, { expiresIn: "7d" });

    // Omit sensitive data in response
    const responseUser = { ...user.toObject() };
    delete responseUser.password;
    delete responseUser.user_Password;

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Login successful",
      data: {
        user: responseUser,
        token: jwtLoginToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = login;

const signUp = async (req, res) => {
  try {
    const {
      user_Email,
      user_Password,
      user_Contact,
      user_Address,
      user_Access
    } = req.body;

    if (!user_Email || !user_Password || !user_Contact || !user_Address || !user_Access) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await userModel.findOne({ user_Email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(user_Password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new userModel({
      user_Email,
      user_Password: hashedPassword,
      user_Contact,
      user_Address,
      user_Access,
      verificationCode,
    });

    await user.save();

    await sendverficationcode(user.user_Email, verificationCode);

    return res.status(201).json({ success: true, message: "User registered successfully", user });

  } catch (error) {
    console.error("Signup error:", error); // ✅ full error log
    return res.status(500).json({ success: false, message: "Server error during signup", error: error.message });
  }
};

const VerifyEmail = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required",
      });
    }

    console.log("📩 Received code:", code);

    const user = await userModel.findOne({ verificationCode: code });

    if (!user) {
      console.log("⚠️ User not found for code:", code);
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // ✅ Use correct field name
    user.isVerified = true;
    user.verificationCode = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    console.error("❌ Server error in VerifyEmail:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during email verification",
      error: error.message, // Optional: return error message during development
    });
  }
};

module.exports = {
  signUp,
  VerifyEmail,
  login
};