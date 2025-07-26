const hospitalModel = require("../models/index.model");
const utils = require("../utils/utilsIndex")
const bcrypt = require("bcrypt");

const createStaff = async (req, res) => {
  try {
    // Destructure from form data
    const {
      user_Name,
      user_Email,
      user_Contact,
      user_Address,
      user_CNIC,
      user_Password,
      user_Access,
      designation,
      department,
      qualifications,
      gender,
      dateOfBirth,
      emergencyContact,
      shift,
      shiftTiming
    } = req.body;

    console.log(`the request body `, req.body)

    // Validate required fields
    if (!user_Name || !user_Contact || !user_CNIC || !user_Password || !department || !user_Access) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing"
      });
    }

    // Validate staffType is one of the allowed values
    const allowedStaffTypes = ["Receptionist", "Lab", "Radiology", "Nurse"];
    if (!allowedStaffTypes.includes(user_Access)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff type. Must be one of: Receptionist, Lab, Radiology, Nurse"
      });
    }

    // Check for existing user
    const existingUser = await hospitalModel.User.findOne({
      $or: [
        { user_Email: user_Email },
        { user_CNIC: user_CNIC },
        { user_Contact: user_Contact }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email, CNIC or phone already exists"
      });
    }

    // Generate staff ID based on staff type
    const user_Identifier = await utils.generateUniqueStaffId(user_Access, user_Name.trim());

    // Handle file upload if needed
    const profilePicture = req.files?.profilePicture?.[0];

    // Create user (basic info)
    const newUser = await hospitalModel.User.create({
      user_Identifier,
      user_Name,
      user_Email,
      user_CNIC,
      user_Password: await bcrypt.hash(user_Password, 10),
      user_Access: user_Access, // Directly use user_Access as user_Access
      user_Address,
      user_Contact,
      isVerified: true,
      isDeleted: false,
    });

    // Prepare staff-specific data
    const staffData = {
      user: newUser._id,
      designation,
      department,
      qualifications: Array.isArray(qualifications) ? qualifications : [qualifications].filter(Boolean),
      gender,
      dateOfBirth,
      emergencyContact,
      shift,
      shiftTiming,
      profilePicture: profilePicture ? {
        filePath: `/uploads/staff/profile/${profilePicture.filename}`
      } : undefined
    };

    // Add role-specific fields if needed
    if (user_Access === "Lab") {
      // Add lab-specific fields if any
      staffData.labSpecialization = req.body.labSpecialization;
    } else if (user_Access === "Radiology") {
      // Add radiology-specific fields if any
      staffData.radiologyCertification = req.body.radiologyCertification;
    }

    // Create staff (professional info)
    const newStaff = await hospitalModel.Staff.create(staffData);

    return res.status(201).json({
      success: true,
      data: {
        staff: newStaff,
        user: newUser
      }
    });

  } catch (error) {
    console.error('Staff creation error:', error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];

      let fieldName = field;
      if (field === 'user_Email') fieldName = 'email';
      if (field === 'user_CNIC') fieldName = 'CNIC';
      if (field === 'user_Contact') fieldName = 'contact number';

      return res.status(409).json({
        success: false,
        message: `This ${fieldName} (${value}) is already registered.`,
        errorType: 'DUPLICATE_KEY',
        field: fieldName,
        value: value
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }

    // Handle other errors
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while creating staff",
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

const getAllStaff = async (req, res) => {
  try {
    const staffList = await hospitalModel.Staff.find({ isDeleted: false })
      .populate('user', 'user_Name user_Email user_Contact user_Address user_CNIC user_Access');

    res.status(200).json({
      success: true,
      data: staffList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching staff",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get staff by ID
const getStaffById = async (req, res) => {
  const { id } = req.params;

  try {
    const staff = await hospitalModel.Staff.findOne({
      _id: id,
      isDeleted: false
    }).populate('user');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update staff by ID
const updateStaffById = async (req, res) => {
  const { id } = req.params;
  const {
    designation,
    department,
    qualifications,
    gender,
    dateOfBirth,
    emergencyContact,
    shift,
    shiftTiming
  } = req.body;

  try {
    const staff = await hospitalModel.Staff.findOne({
      _id: id,
      isDeleted: false
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    // Update staff fields
    staff.designation = designation || staff.designation;
    staff.department = department || staff.department;
    staff.qualifications = qualifications || staff.qualifications;
    staff.gender = gender || staff.gender;
    staff.dateOfBirth = dateOfBirth || staff.dateOfBirth;
    staff.emergencyContact = emergencyContact || staff.emergencyContact;
    staff.shift = shift || staff.shift;
    staff.shiftTiming = shiftTiming || staff.shiftTiming;

    // Handle file upload if needed
    if (req.files?.profilePicture?.[0]) {
      staff.profilePicture = {
        filePath: `/uploads/staff/profile/${req.files.profilePicture[0].filename}`
      };
    }

    await staff.save();

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Soft delete staff
const softDeleteStaff = async (req, res) => {
  const { id } = req.params;

  try {
    const staff = await hospitalModel.Staff.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true, isActive: false } },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found or already deleted'
      });
    }

    // Also mark user as deleted
    await hospitalModel.User.findByIdAndUpdate(staff.user, {
      isDeleted: true
    });

    res.status(200).json({
      success: true,
      message: 'Staff deleted successfully',
      data: staff
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Restore soft-deleted staff
const restoreStaff = async (req, res) => {
  const { id } = req.params;

  try {
    const staff = await hospitalModel.Staff.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { $set: { isDeleted: false, isActive: true } },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found or not deleted'
      });
    }

    // Also restore the user
    await hospitalModel.User.findByIdAndUpdate(staff.user, {
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      message: 'Staff restored successfully',
      data: staff
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all deleted staff (for admin)
const getDeletedStaff = async (req, res) => {
  try {
    const deletedStaff = await hospitalModel.Staff.find({ isDeleted: true })
      .populate('user');

    res.status(200).json({
      success: true,
      data: deletedStaff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching deleted staff",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaffById,
  softDeleteStaff,
  restoreStaff,
  getDeletedStaff
};
