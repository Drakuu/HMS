const User = require("./user.model");
const Doctor = require("./doctor.model");
const Patient = require("./patient.model");
const staff = require("./staff.model")
const Department = require("./department.model")
const counter = require("./counter.model")
const Staff = require('./staff.model')
const Refund = require("./refundopd.model")

const Hospital = {
    User,
    Doctor,
    Patient,
    staff,
    Department,
    counter,
    Refund,
    Staff,
};

module.exports = Hospital;
