const hospitalModel = require("../models/index.model");

async function generateUniqueId(name, prefix, modelName) {
  try {
    // Determine which model to use
    const model = hospitalModel[modelName];
    
    if (!model) {
      throw new Error(`Invalid model name: ${modelName}`);
    }

    // Get count of existing documents
    const count = await model.countDocuments();
    
    // Extract initials (first 2 letters of first name + first 2 letters of last name)
    const [firstName, lastName] = name.split(' ');
    const initials = (
      (firstName ? firstName.substring(0, 2) : '') + 
      (lastName ? lastName.substring(0, 2) : '')
    ).toUpperCase();

    // Format the ID
    const idNumber = (count + 1).toString().padStart(4, '0');
    const uniqueId = `${prefix}-${initials}-${idNumber}`;

    return uniqueId;
  } catch (error) {
    console.error("Error generating unique ID:", error);
    throw new Error("Unable to generate a unique ID.");
  }
}

module.exports = generateUniqueId;