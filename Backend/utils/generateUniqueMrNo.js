const Appointment = require("../models/appointment.model");
const Patient = require("../models/patient.model");

async function generateUniqueMrNo(appointmentDate) {
  try {
    // Use provided date or current date
    const dateObj = appointmentDate ? new Date(appointmentDate) : new Date();
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const datePrefix = `${year}${month}${day}`;

    // Check both Appointment and Patient collections for existing MRNOs with this prefix
    const [appointmentCount, patientCount] = await Promise.all([
      Appointment.countDocuments({
        appointmentMRNO: new RegExp(`^${datePrefix}-`)
      }),
      Patient.countDocuments({
        patient_MRNo: new RegExp(`^${datePrefix}-`)
      })
    ]);

    const totalCount = appointmentCount + patientCount;
    const mrNo = `${datePrefix}-${String(totalCount + 1).padStart(4, '0')}`;
    return mrNo;
  } catch (error) {
    console.error("Error generating unique MR No:", error);
    throw error;
  }
}

module.exports = generateUniqueMrNo;