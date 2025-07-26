const checkRole = (requiredAccess = [], options = {}) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user || !user.user_Access) {
        return res.status(403).json({
          success: false,
          message: "Authentication required"
        });
      }

      // Admin always bypasses all checks
      if (user.user_Access === 'Admin') {
        return next();
      }

      // Handle multiple allowed roles
      if (Array.isArray(requiredAccess)) {
        if (requiredAccess.includes(user.user_Access)) {
          return next();
        }
      } 
      // Handle single role string
      else if (user.user_Access === requiredAccess) {
        return next();
      }

      // Custom error message or default
      const errorMessage = options.message || 
        `Access denied. Required permissions: ${Array.isArray(requiredAccess) ? requiredAccess.join(', ') : requiredAccess}`;

      return res.status(403).json({
        success: false,
        message: errorMessage
      });

    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };
};

// Pre-defined specific role checkers
module.exports = {
  adminOnly: checkRole('Admin', { message: "Admin access required" }),
  doctorOnly: checkRole('Doctor', { message: "Doctor access required" }),
  nurseOnly: checkRole('Nurse', { message: "Nurse access required" }),
  receptionistOnly: checkRole('Receptionist', { message: "Receptionist access required" }),
  labOnly: checkRole('Lab', { message: "Lab access required" }),
  radiologyOnly: checkRole('Radiology', { message: "Radiology access required" }),
  patientOnly: checkRole('Patient', { message: "Patient access required" }),
  
  // Common combinations
  clinicalStaff: checkRole(['Doctor', 'Nurse'], { 
    message: "Clinical staff access required" 
  }),
  diagnosticStaff: checkRole(['Lab', 'Radiology'], {
    message: "Diagnostic staff access required"
  }),
  frontOffice: checkRole(['Receptionist', 'Admin'], {
    message: "Front office access required"
  }),
  
  // Flexible multi-role checker
  checkRole
};