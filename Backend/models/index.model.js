const User = require("./user.model");
const Doctor = require("./doctor.model");
const Patient = require("./patient.model");
const AdmittedPatient = require("./admittedPatient.model")
const staff = require("./staff.model")
const Department = require("./department.model")
const Room = require("./rooms.model")
const inventory = require("./inventory.model")
const Operation = require("./ot.model")
const ward = require("./ward.model")
const counter = require("./counter.model")
const Medicine = require("./medicine.model")

const Hospital = {
  User,
  Doctor,
  Patient,
  AdmittedPatient,
  staff,
  Department,
  Room,
  inventory,
  Operation,
  ward,
  counter,
Medicine,


};

module.exports = Hospital;
