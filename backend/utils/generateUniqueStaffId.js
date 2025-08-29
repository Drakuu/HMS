const hospitalModel = require("../models/index.model");

async function generateUniqueStaffId(user_Access, name) {
  try {
    // Validate inputs
    if (!user_Access || typeof user_Access !== 'string') {
      throw new Error('Staff type must be a valid string');
    }
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw new Error('Name must be a valid string with at least 2 characters');
    }

    // Clean the name
    const cleanedName = name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^a-zA-Z ]/g, '')
      .trim();

    // Get prefix from first name part
    const firstNamePart = cleanedName.split(' ')[0];
    const firstTwoLetters = firstNamePart.substring(0, 2).toUpperCase();

    if (firstTwoLetters.length < 2) {
      throw new Error('Name must contain at least 2 alphabetic characters in the first name');
    }

    // Create type prefix (first letter of staff type)
    const typePrefix = user_Access.substring(0, 1).toUpperCase();
    const validPrefixes = ['R', 'L', 'N']; // Receptionist, Lab, Nurse
    if (!validPrefixes.includes(typePrefix)) {
      typePrefix = 'S'; // Default prefix for other staff types
    }

    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const staffId = `${typePrefix}${firstTwoLetters}-${randomSuffix}`;

      const exists = await hospitalModel.User.findOne({ user_Identifier: staffId });
      if (!exists) {
        return staffId;
      }

      attempts++;
    }

    throw new Error('Failed to generate unique ID after multiple attempts');

  } catch (error) {
    console.error("Error generating staff ID:", error);
    throw new Error("Unable to generate a staff ID: " + error.message);
  }
}

module.exports = generateUniqueStaffId;