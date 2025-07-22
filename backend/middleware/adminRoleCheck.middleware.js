const adminRoleCheck = async (req, res, next) => {
  try {
    const user = req.user;
// console.log('the user is ', user)
    if (user.user_Access && ['Admin', 'Receptionist'].includes(user.user_Access)) {
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