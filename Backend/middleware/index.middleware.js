const adminRoleCheck = require("./adminRoleCheck.middleware");
const hrRoleCheck = require("./hrRoleCheck.middleware");
const salesRoleCheck = require("./salesRoleCheck.middleware");

const middleware = {
  adminRoleCheck,
  hrRoleCheck,
  salesRoleCheck,
};

module.exports = middleware;
