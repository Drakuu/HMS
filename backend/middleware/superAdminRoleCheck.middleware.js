const superAdminRoleCheck = async (req, res, next) => {
  try {
    const user = req.user;

    // Only allow users with SuperAdmin access
    if (user.user_Access && user.user_Access === "SuperAdmin") {
      return next();
    }

    return res.status(403).json({ 
      success: false,
      message: "SuperAdmin access required" 
    });
  } catch (error) {
    console.error("SuperAdmin authorization error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

module.exports = superAdminRoleCheck;