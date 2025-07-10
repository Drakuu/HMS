const hospitalModel = require("../models/index.model");  // Adjust the path to your Doctor model

// Function to generate a unique ID based on a sequential counter
async function generateUniqueAdmissionNo() {
  try {    
    const count = await hospitalModel.AdmittedPatient.countDocuments();
   
    // Generate the ID using the incremented count
    const patien_AdmissionNo = `${count + 1}`; 
    return patien_AdmissionNo;
  } catch (error) {
    console.error("Error generating unique ID:", error);
    throw new Error("Unable to generate a unique ID.");
  }
}

module.exports = generateUniqueAdmissionNo;
