const hospitalModel = require("../models/index.model");  // Adjust the path to your Doctor model

// Function to generate a unique ID based on the name
async function generateUniqueDoctorId(name) {
  try {    
    const count = await hospitalModel.Doctor.countDocuments();
    const namePrefix = name.substring(0, 2).toUpperCase();
   
    const doctorId = `${namePrefix}-${count + 1}`; 
    return doctorId;
  } catch (error) {
    console.error("Error generating unique ID:", error);
    throw new Error("Unable to generate a unique ID.");
  }
}

module.exports = generateUniqueDoctorId;
