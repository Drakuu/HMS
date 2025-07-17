const doctorRoleCheck = async (req, res, next) => {
  try {
    const user = req.user;

    // Check if staff member is a doctor
    if (user.staffType && user.staffType === 'Doctor') {
      // Additional doctor-specific checks can go here
      return next();
    }

    // SuperAdmins might also need doctor access in some cases
    if (user.user_Access && user.user_Access === 'SuperAdmin') {
      return next();
    }

    return res.status(403).json({ 
      success: false,
      message: "Doctor access required" 
    });
  } catch (error) {
    console.error("Doctor authorization error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

module.exports = doctorRoleCheck;