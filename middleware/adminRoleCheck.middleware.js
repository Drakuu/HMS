const adminRoleCheck = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.staffType && ['Admin', 'Receptionist'].includes(user.staffType)) {
      return next();
    }

    return res.status(403).json({ 
      success: false,
      message: "Admin or Receptionist access required" 
    });
  } catch (error) {
    console.error("Authorization error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

module.exports = adminRoleCheck;