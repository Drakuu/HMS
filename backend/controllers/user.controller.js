const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");
const { sendverficationcode } = require("../middleware/Email");
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

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

const login = async (req, res) => {
  try {
    const { user_Email, user_Password } = req.body;

    if (!user_Email || !user_Password) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "All fields required",
      });
    }

    const user = await userModel.findOne({ user_Email }).populate('doctorProfile');

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: "Email not verified. Please verify your email first.",
      });
    }

    const validPassword = await bcrypt.compare(user_Password, user.user_Password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Invalid email or password",
      });
    }

    // Explicitly construct user data to include in JWT payload
    const userPayload = {
      id: user._id,
      user_Name: user.user_Name,
      user_Email: user.user_Email,
      user_CNIC: user.user_CNIC,
      user_Identifier: user.user_Identifier,
      user_Contact: user.user_Contact,
      user_Address: user.user_Address,
      user_Access: user.user_Access,
      doctorProfile: user.doctorProfile || null,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    const jwtLoginToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });
    // Console the JWT Token
    // console.log("JWT Token:", jwtLoginToken);

    // Decode the JWT Token
    const decodedToken = jwt.verify(jwtLoginToken, JWT_SECRET);

    // Console the Decoded JWT Token
    // console.log("Decoded Token:", decodedToken);


    return res.status(200).json({
      success: true,
      status: 200,
      message: "User login successful",
      information: {
        user: userPayload,
        jwtLoginToken,
      },
    });
  } catch (error) {
    console.log("Login error:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: error.message,
    });
  }
};


module.exports = {
  signUp,
  VerifyEmail,
  login
};