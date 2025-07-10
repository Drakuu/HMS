const hospitalModel = require("../models/index.model");  // Adjust the path to your Doctor model

// Function to generate a unique ID based on the name
async function generateUniqueDoctorId(name) {
  try {    
    if (!name || name.length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

     const namePrefix = name.substring(0, 2).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    const doctorId = `${namePrefix}-${randomSuffix}`;

    // Verify uniqueness
    const exists = await hospitalModel.Doctor.findOne({ doctor_Identifier: doctorId });
    if (exists) {
      return generateUniqueDoctorId(name); // Recursively generate new ID if exists
    }
    
    return doctorId;

  } catch (error) {
    console.error("Error generating unique ID:", error);
    throw new Error("Unable to generate a unique ID.");
  }
}

module.exports = generateUniqueDoctorId;
