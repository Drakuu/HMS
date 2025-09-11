const CriticalResult = require("../models/criticalResult.model")

// ✅ Create a new Critical Result
const createCriticalResult = async (req, res) => {
  try {
    const newResult = new CriticalResult(req.body);
    await newResult.save();
    res.status(201).json({ success: true, data: newResult });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all Critical Results
const getAllCriticalResults = async (req, res) => {
  try {
    const results = await CriticalResult.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Critical Result by ID
const getCriticalResultById = async (req, res) => {
  try {
    const result = await CriticalResult.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Critical Result
const updateCriticalResult = async (req, res) => {
  try {
    const updated = await CriticalResult.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete Critical Result
const deleteCriticalResult = async (req, res) => {
  try {
    const deleted = await CriticalResult.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }
    res.status(200).json({ success: true, message: "Result deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCriticalResult,
  getAllCriticalResults,
  getCriticalResultById,
  updateCriticalResult,
  deleteCriticalResult,
}