const hospitalModel = require("../models/index.model");

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
      fields,
    } = req.body;

    if (!testName || !testCode || !testPrice) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const newTest = new hospitalModel.TestManagment({
      testName,
      testCode,
      description,
      instructions,
      testPrice,
      requiresFasting,
      reportDeliveryTime,
      fields,
    });

    await newTest.save();
    res.status(201).json({ message: "Test created successfully", test: newTest });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getTests = async (req, res) => {
  try {
    const tests = await hospitalModel.TestManagment.find().sort({ createdAt: -1 });
    if (tests.length === 0 || tests.every(test => test.isDeleted)) {
      return res.status(200).json({ message: 'No active tests found or all tests are deleted' });
    }

    const activeTests = tests.filter(test => !test.isDeleted);
    res.status(200).json(activeTests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tests', error: err.message });
  }
};

const getTestById = async (req, res) => {
  try {
    const test = await hospitalModel.TestManagment.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.status(200).json(test);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve test", error: err.message });
  }
};

const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      testName,
      testCode,
      description,
      instructions,
      testPrice,
      requiresFasting,
      reportDeliveryTime,
      fields,
    } = req.body;

    const test = await hospitalModel.TestManagment.findById(id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    test.testName = testName ?? test.testName;
    test.testCode = testCode ?? test.testCode;
    test.description = description ?? test.description;
    test.instructions = instructions ?? test.instructions;
    test.testPrice = testPrice ?? test.testPrice;
    test.requiresFasting = typeof requiresFasting === "boolean" ? requiresFasting : test.requiresFasting;
    test.reportDeliveryTime = reportDeliveryTime ?? test.reportDeliveryTime;

    if (fields && Array.isArray(fields)) {
      test.fields = fields;
    }

    await test.save();
    res.status(200).json({ message: "Test updated successfully", test });
  } catch (err) {
    res.status(500).json({ message: "Failed to update test", error: err.message });
  }
};

const deleteTest = async (req, res) => {
  try {
    const test = await hospitalModel.TestManagment.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });

    test.isDeleted = true;
    await test.save();

    res.status(200).json({ message: "Test soft deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to soft delete test", error: err.message });
  }
};

const recoverTest = async (req, res) => {
  try {
    const test = await hospitalModel.TestManagment.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });

    test.isDeleted = false;
    await test.save();

    res.status(200).json({ message: "Test recovered successfully", test });
  } catch (err) {
    res.status(500).json({ message: "Failed to recover test", error: err.message });
  }
};

module.exports = {
  createTest,
  getTests,
  getTestById,
  updateTest,
  deleteTest,
  recoverTest,
};  