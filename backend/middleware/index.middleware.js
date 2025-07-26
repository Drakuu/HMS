const passportAuth = require("./passportAuth.middleware");
const { 
  checkRole,
  adminOnly,
  doctorOnly,
  nurseOnly,
  receptionistOnly,
  labOnly,
  radiologyOnly,
  patientOnly,
  clinicalStaff,
  diagnosticStaff,
  frontOffice
} = require("./roleMiddleware");

const middleware = {
  passportAuth,
  checkRole,
  adminOnly,
  doctorOnly,
  nurseOnly,
  receptionistOnly,
  labOnly,
  radiologyOnly,
  patientOnly,
  clinicalStaff,
  diagnosticStaff,
  frontOffice
};

module.exports = middleware;