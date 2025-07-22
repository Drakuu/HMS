const hospitalModel = require("../models/index.model");

async function generateUniqueDoctorId(name) {
  try {
    // More flexible validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw new Error('Name must be a valid string with at least 2 characters');
    }

    // Clean the name - more permissive cleaning
    const cleanedName = name
      .trim() // Remove whitespace
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^a-zA-Z ]/g, '') // Remove special chars but keep letters and spaces
      .trim(); // Trim again after cleaning

    // Get prefix from first name part
    const firstNamePart = cleanedName.split(' ')[0];
    const firstTwoLetters = firstNamePart.substring(0, 2).toUpperCase();

    if (firstTwoLetters.length < 2) {
      throw new Error('Name must contain at least 2 alphabetic characters in the first name');
    }

    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const doctorId = `${firstTwoLetters}-${randomSuffix}`;

      const exists = await hospitalModel.User.findOne({ user_Identifier: doctorId });
      if (!exists) {
        return doctorId;
      }

      attempts++;
    }

    throw new Error('Failed to generate unique ID after multiple attempts');

  } catch (error) {
    console.error("Error generating unique ID:", error);
    throw new Error("Unable to generate a unique ID: " + error.message);
  }
}

module.exports = generateUniqueDoctorId;