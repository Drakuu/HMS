const hospitalModel = require("../models/index.model");

async function generateUniqueMrNo(appointmentDate) {
  try {
    const dateObj = appointmentDate ? new Date(appointmentDate) : new Date();
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const datePrefix = `${year}${month}${day}`;

    const [appointmentCount, patientCount, patientTestCount, radiologyReportCount] = await Promise.all([
      hospitalModel.Appointment.countDocuments({ appointmentMRNO: new RegExp(`^${datePrefix}-`) }),
      hospitalModel.Patient.countDocuments({ patient_MRNo: new RegExp(`^${datePrefix}-`) }),
      hospitalModel.PatientTest.countDocuments({ "patient_Detail.patient_MRNo": new RegExp(`^${datePrefix}-`) }),
      hospitalModel.RadiologyReport.countDocuments({ patientMRNO: new RegExp(`^${datePrefix}-`) })
    ]);

    const totalCount = appointmentCount + patientCount + patientTestCount + radiologyReportCount;
    const mrNo = `${datePrefix}-${String(totalCount + 1).padStart(4, '0')}`;
    return mrNo;

  } catch (error) {
    console.error("Error generating unique MR No:", error);
    throw error;
  }
}

module.exports = generateUniqueMrNo;
