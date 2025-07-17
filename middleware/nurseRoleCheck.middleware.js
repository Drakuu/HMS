const nurseRoleCheck = async (req, res, next) => {
  try {
    const user = req.user;

    // Check if staff member is a nurse
    if (user.staffType && user.staffType === 'Nurse') {
      // Additional nurse-specific checks can go here
      return next();
    }

    // SuperAdmins might also need nurse access in some cases
    if (user.user_Access && user.user_Access === 'SuperAdmin') {
      return next();
    }

    return res.status(403).json({ 
      success: false,
      message: "Nurse access required" 
    });
  } catch (error) {
    console.error("Nurse authorization error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

module.exports = nurseRoleCheck;