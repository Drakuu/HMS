
const user = require("./user.controller");
const doctor = require("./doctor.controller");
const patient = require("./patient.controller");
const admittedPatient = require("./admittedPatient.controller");
const appointment = require("./appointment.controller");
const staff = require("./staff.controller")
const Department = require("./departments.controller")
const rooms = require("./rooms.controller")
const inventory = require("./inventory.controller")
const ot = require("./ot.controller")
const ward = require("./ward.controller")
const medicine = require("./medicine.controller")

const controller = {

  user,
  doctor,
  patient,
  admittedPatient,
  appointment,
  staff,
  Department,
  rooms,
  inventory,
  ot,
  ward,
  medicine,

};

module.exports = controller;
