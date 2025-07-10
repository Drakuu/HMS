const Test = require('../models/testmanagement.model');

const createTest = async (req, res) => {
  try {
    const {
      testName,
      testCode,
      description,
      instructions,
      testPrice,
      requiresFasting,
      reportDeliveryTime,
      normalRange,
      
      fields
    } = req.body;

    if (!testName || !testCode || !testPrice) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const newTest = new Test({
      testName,
      testCode,
      description,
      instructions,
      testPrice,
      requiresFasting,
      reportDeliveryTime,
      normalRange,
      
      fields
    });

    await newTest.save();
    res.status(201).json({ message: 'Test created successfully', test: newTest });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getTests = async (req, res) => {

  try {
    const tests = await Test.find().sort({ createdAt: -1 });
    
    res.status(200).json(tests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tests', error: err.message });
  }
};

const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.status(200).json(test);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve test', error: err.message });
  }
};

const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const test = await Test.findById(id);
    if (!test) return res.status(404).json({ message: "Test not found" });

    // Apply updates to test
    Object.keys(updateData).forEach(key => {
      test[key] = updateData[key];
    });

    await test.save();
    res.status(200).json({ message: "Test updated successfully", test });
  } catch (err) {
    res.status(500).json({ message: "Failed to update test", error: err.message });
  }
};


const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTest = await Test.findByIdAndDelete(id);

    if (!deletedTest) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.status(200).json({ message: "Test deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete test", error: err.message });
  }
};


module.exports = {
  createTest,
  getTests,
  getTestById,
  updateTest,
  deleteTest
};



