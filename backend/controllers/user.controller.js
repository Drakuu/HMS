const bcrypt = require("bcrypt");
const userModel = require("../models/user.model"); // ✅ make sure the path is correct
const { sendverficationcode } = require("../middleware/Email");
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken"); // ✅ Required for JWT



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


//login
const login = async (req, res) => {
  try {
    // console.log("here");
    const { user_Email, user_Password } = req.body;

    if (!user_Email || !user_Password) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "All fields required",
      });
    }

    const user = await userModel.findOne({ user_Email });
// console.log("thwe user", user)
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
    

    const jwtLoginToken = jwt.sign(
      { 
        user_Email: user.user_Email,
        user_Access: user.user_Access,
       },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

// console.log("tHE TIOKEN WAS: ", jwtLoginToken)
    return res.status(200).json({
      success: true,
      status: 200,
      message: "User login successful",
      information: {
        user,
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
  signUp ,
  VerifyEmail,
  login
};