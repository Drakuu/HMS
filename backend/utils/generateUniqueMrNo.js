const hospitalModel = require("../models/index.model");
const crypto = require('crypto');

async function generateUniqueMrNo(appointmentDate) {
  try {
    const dateObj = appointmentDate ? new Date(appointmentDate) : new Date();
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const datePrefix = `${year}${month}${day}`;

    // Generate cryptographically secure random 4-digit number
    const generateSecureRandomSuffix = () => {
      const randomBuffer = crypto.randomBytes(2); // 2 bytes = 16 bits
      const randomNumber = randomBuffer.readUInt16BE(0);
      return 1000 + (randomNumber % 9000); // Ensure 4-digit number (1000-9999)
    };

    let isUnique = false;
    let randomSuffix;
    let maxAttempts = 15; // Increased attempts for better chance
    let attempts = 0;

    while (!isUnique && attempts < maxAttempts) {
      attempts++;
      randomSuffix = generateSecureRandomSuffix();
      const mrNoToCheck = `${datePrefix}-${randomSuffix}`;

      // Check across all collections for uniqueness
      const [appointmentExists, patientExists, patientTestExists, radiologyReportExists] = await Promise.all([
        hospitalModel.Appointment.findOne({ appointmentMRNO: mrNoToCheck }).select('_id'),
        hospitalModel.Patient.findOne({ patient_MRNo: mrNoToCheck }).select('_id'),
        hospitalModel.PatientTest.findOne({ "patient_Detail.patient_MRNo": mrNoToCheck }).select('_id'),
        hospitalModel.RadiologyReport.findOne({ patientMRNO: mrNoToCheck }).select('_id')
      ]);

      isUnique = !appointmentExists && !patientExists && !patientTestExists && !radiologyReportExists;
    }

    if (!isUnique) {
      // Fallback to timestamp-based suffix if random generation fails
      const timestamp = Date.now() % 10000; // Last 4 digits of timestamp
      randomSuffix = String(timestamp).padStart(4, '0');

      // One final check for the fallback
      const mrNoToCheck = `${datePrefix}-${randomSuffix}`;
      const [appointmentExists, patientExists, patientTestExists, radiologyReportExists] = await Promise.all([
        hospitalModel.Appointment.findOne({ appointmentMRNO: mrNoToCheck }).select('_id'),
        hospitalModel.Patient.findOne({ patient_MRNo: mrNoToCheck }).select('_id'),
        hospitalModel.PatientTest.findOne({ "patient_Detail.patient_MRNo": mrNoToCheck }).select('_id'),
        hospitalModel.RadiologyReport.findOne({ patientMRNO: mrNoToCheck }).select('_id')
      ]);

      if (appointmentExists || patientExists || patientTestExists || radiologyReportExists) {
        // Ultimate fallback: use sequential with high starting point
        const totalCount = await getTotalDocumentCount(datePrefix);
        randomSuffix = String(1000 + totalCount).padStart(4, '0');
      }
    }

    const mrNo = `${datePrefix}-${randomSuffix}`;
    return mrNo;

  } catch (error) {
    console.error("Error generating unique MR No:", error);
    throw error;
  }
}

// Helper function to get total document count
async function getTotalDocumentCount(datePrefix) {
  const [appointmentCount, patientCount, patientTestCount, radiologyReportCount] = await Promise.all([
    hospitalModel.Appointment.countDocuments({ appointmentMRNO: new RegExp(`^${datePrefix}-`) }),
    hospitalModel.Patient.countDocuments({ patient_MRNo: new RegExp(`^${datePrefix}-`) }),
    hospitalModel.PatientTest.countDocuments({ "patient_Detail.patient_MRNo": new RegExp(`^${datePrefix}-`) }),
    hospitalModel.RadiologyReport.countDocuments({ patientMRNO: new RegExp(`^${datePrefix}-`) })
  ]);

  return appointmentCount + patientCount + patientTestCount + radiologyReportCount;
}

module.exports = generateUniqueMrNo;