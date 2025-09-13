
const user = require("./user.controller");
const doctor = require("./doctor.controller");
const patient = require("./patient.controller");
const appointment = require("./appointment.controller");
const staff = require("./staff.controller")
const Department = require("./departments.controller")
const Refund = require("./refundOpd.controller")
const Summary = require("./summary.controller")

const controller = {
  user,
  doctor,
  patient,
  appointment,
  staff,
  Department,
  Refund,
  Summary,
};

module.exports = controller;
