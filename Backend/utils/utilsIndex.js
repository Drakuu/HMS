const generateUniqueUserId = require("./generateUniqueUserId.utils");
const generateUniqueDoctorId = require("./generateUniqueDoctorId");
const generateUniqueMrNo = require("./generateUniqueMrNo");  
const generateUniqueAdmissionNo = require("./generaetUniqueAdmissionNo");
const generateUniqueToken = require("./generateUniqueToken");

const utils = {
  generateUniqueUserId,
  generateUniqueDoctorId,
  generateUniqueMrNo,
  generateUniqueAdmissionNo,
  generateUniqueToken,

};

module.exports = utils;
