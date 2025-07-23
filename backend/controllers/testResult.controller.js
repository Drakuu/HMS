const hospitalModel = require("../models/index.model");
const mongoose = require("mongoose");

const submitTestResults = async (req, res) => {
  const { patientTestId, testId } = req.params;
  const testIdArray = testId.split(','); // Split comma-separated string into array
  
  try {
    const { results: testResults, notes, status = "draft" } = req.body; // Renamed to testResults
    console.log("The user are ", req.user); 
    const performedBy = req.user.user_Name // Replace with actual user ID from auth

    // Validate ObjectId format for patientTestId
    if (!mongoose.Types.ObjectId.isValid(patientTestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patientTestId format",
      });
    }

    // Validate all testIds
    for (const id of testIdArray) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: `Invalid testId format: ${id}`,
        });
      }
    }

    // 1. Validate the patient test exists
    const patientTest = await hospitalModel.PatientTest.findOne({
      _id: new mongoose.Types.ObjectId(patientTestId),
      isDeleted: false,
    });

    if (!patientTest) {
      return res.status(404).json({
        success: false,
        message: "Patient test record not found",
      });
    }

    // Process each testId separately with its own results
    const updatePromises = testIdArray.map(async (testId) => {
      // Find the specific test in the patient's selectedTests
      const testToUpdate = patientTest.selectedTests.find(
        (t) => t.test.toString() === testId
      );

      if (!testToUpdate) {
        throw { testId, message: "Test not found in patient record" };
      }

      // 2. Get test details for normal ranges
      const testDefinition = await hospitalModel.TestManagment.findById(testId);
      if (!testDefinition) {
        throw { testId, message: "Test definition not found" };
      }

      // Filter results for this specific test
      const filteredResults = Array.isArray(testResults) 
        ? testResults.filter(result => result.testId === testId || !result.testId)
        : [];

      // 3. Prepare results with normal range checks only for fields that exist in this test
      const preparedResults = testDefinition.fields.map((fieldDef) => {
        // Find if there's a result for this field
        const result = filteredResults.find(r => r.fieldName === fieldDef.name);
        
        if (!result || !result.value || result.value === "") {
          return null; // Skip fields without values
        }

        const gender = patientTest.patient_Detail.patient_Gender.toLowerCase();
        const normalRange = fieldDef.normalRange[gender] || fieldDef.normalRange;

        return {
          fieldName: fieldDef.name,
          value: result.value,
          unit: fieldDef.unit,
          normalRange: {
            min: normalRange.min,
            max: normalRange.max,
          },
          isNormal: checkIfNormal(result.value, normalRange),
          notes: result.notes || "",
          reportedAt: new Date(),
        };
      }).filter(Boolean); // Remove null entries

      // 4. Create or update test result
      let testResult = await hospitalModel.TestResult.findOne({
        patientTestId: patientTest._id,
        testId: testToUpdate.test,
      });

      if (!testResult) {
        testResult = new hospitalModel.TestResult({
          patientTestId: patientTest._id,
          testId: testToUpdate.test,
          patientId: patientTest.patient_Detail.patient_MRNo,
          patientGender: patientTest.patient_Detail.patient_Gender.toLowerCase(),
          results: preparedResults,
          status,
          performedBy,
          notes,
        });
      } else {
        testResult.results = preparedResults;
        testResult.status = status;
        testResult.performedBy = performedBy;
        testResult.notes = notes;
      }

      await testResult.save();

      testToUpdate.statusHistory.push({
        status: status,
        changedAt: new Date(),
        changedBy: performedBy,
      });

      return {
        testId,
        success: true,
        testResult,
      };
    });

    const operationResults = await Promise.allSettled(updatePromises);
    
    // Check for any rejected promises (errors)
    const errors = operationResults.filter(r => r.status === 'rejected');
    if (errors.length > 0) {
      console.error("Errors updating some tests:", errors);
      // You might want to handle partial failures differently
    }

    await patientTest.save();

    return res.status(200).json({
      success: true,
      message: "Test results saved successfully",
      data: {
        testResults: operationResults.map(r => r.value || { error: r.reason.message, testId: r.reason.testId }),
        patientDetails: {
          name: patientTest.patient_Detail.patient_Name,
          mrNo: patientTest.patient_Detail.patient_MRNo,
        },
      },
    });
  } catch (error) {
    console.error("Error submitting test results:", error);
    return res.status(500).json({
      success: false,
      message: "Error submitting test results",
      error: error.message,
    });
  }
};

function checkIfNormal(value, normalRange) {
  try {
    const numericValue = parseFloat(value);
    return numericValue >= normalRange.min && numericValue <= normalRange.max;
  } catch (e) {
    console.error("Error checking normal range:", e);
    return false;
  }
}

const getAllTestResults = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, patientId } = req.query;
    const skip = (page - 1) * limit;

    // Build query object
    const query = { isDeleted: false };
    if (status) query.status = status;
    if (patientId) query.patientId = patientId;

    // Get results with proper population
    const results = await hospitalModel.TestResult.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "patientTestId",
        select: "patient_Detail",
      })
      .populate({
        path: "testId",
        select: "testName testCode",
        model: "TestManagment",
      })
      .lean();

    // Enhance results with patient details
    const enhancedResults = results.map((result) => ({
      ...result,
      patientDetails: {
        source: result.patientTestId?.patient_Detail
          ? "PatientTest"
          : "Not available",
        ...(result.patientTestId?.patient_Detail || {}),
      },
    }));

    const total = await hospitalModel.TestResult.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        results: enhancedResults,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching test results:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching test results",
      error: error.message,
    });
  }
};

const getPatientByResultId = async (req, res) => {
  try {
    const { resultId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(resultId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid result ID format",
      });
    }

    // Find the test result with proper population
    const testResult = await hospitalModel.TestResult.findOne({
      _id: resultId,
      isDeleted: false,
    })
      .populate({
        path: "patientTestId",
        select: "patient_Detail",
      })
      .populate({
        path: "testId",
        select: "testName testCode",
        model: "TestManagment",
      })
      .lean();

    if (!testResult) {
      return res.status(404).json({
        success: false,
        message: "Test result not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        testResult,
        patientDetails: {
          source: testResult.patientTestId?.patient_Detail
            ? "PatientTest"
            : "Not available",
          ...(testResult.patientTestId?.patient_Detail || {}),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching patient by result ID:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching patient details",
      error: error.message,
    });
  }
};

const getSummaryByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate && !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least a startDate or endDate'
      });
    }

    // Construct query
    let query = {};

    if (startDate && !endDate) {
      const sDate = new Date(startDate);
      query.createdAt = {
        $gte: new Date(sDate.setHours(0, 0, 0, 0)),
        $lt: new Date(sDate.setHours(23, 59, 59, 999))
      };
    } else if (startDate && endDate) {
      const sDate = new Date(startDate);
      const eDate = new Date(endDate);
      query.createdAt = {
        $gte: new Date(sDate.setHours(0, 0, 0, 0)),
        $lte: new Date(eDate.setHours(23, 59, 59, 999))
      };
    }
// console.log(`the endDate ${endDate} and startDate ${startDate}`)
    // Find matching patients
    const patients = await hospitalModel.PatientTest.find(query)
      .sort({ createdAt: 1 })
      .lean();

    // Collect all patientTestIds
    const patientTestIds = patients.map(patient => patient._id.toString());

const testIds = patients.flatMap(patient =>
  (patient.selectedTests || []).map(test => test.test.toString())
);


    // Find matching test results
    const testResults = await hospitalModel.TestResult.find({
      isDeleted: false,
      patientTestId: { $in: patientTestIds },
      testId: { $in: testIds }
    }).lean();

    // Optional: Group testResults by patientTestId
    const testResultsMap = {};
    testResults.forEach(result => {
      const id = result.patientTestId.toString();
      if (!testResultsMap[id]) testResultsMap[id] = [];
      testResultsMap[id].push(result);
    });

    // Combine patient and test results
    const responseData = patients.map(patient => ({
      ...patient,
      testResults: testResultsMap[patient._id.toString()] || []
    }));
// console.log("responseData: ", responseData)
    return res.status(200).json({
      success: true,
      count: responseData.length,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching patient tests:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};




module.exports = {
  submitTestResults,
  getAllTestResults,
  getPatientByResultId,
  getSummaryByDate,
};
