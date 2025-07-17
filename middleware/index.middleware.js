const adminRoleCheck = require("./adminRoleCheck.middleware");
const doctorRoleCheck = require("./doctorRoleCheck.middleware");
const nurseRoleCheck = require("./nurseRoleCheck.middleware");
const passportAuth = require("./passportAuth.middleware");
const superAdminRoleCheck = require("./superAdminRoleCheck.middleware");

const middleware = {
  adminRoleCheck,
  doctorRoleCheck,
  nurseRoleCheck,
  passportAuth,
  superAdminRoleCheck
};

module.exports = middleware;