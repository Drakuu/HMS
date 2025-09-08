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
const PatientTest = require("./patientTest.model")
const TestManagment = require('./testmanagement.model')
const Appointment = require("./appointment.model")
const TestResult = require("./testResult.model")
const Staff = require('./staff.model')
const Refund = require("./refundopd.model")
const RadiologyReport = require("./RadiologyReport");


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
    PatientTest,
    TestManagment,
    Appointment,
    TestResult,
    Refund,
    Staff,

    RadiologyReport

    
};

module.exports = Hospital;
