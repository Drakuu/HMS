const hospitalModel = require("../models/index.model");
const mongoose = require("mongoose");
const utils = require("../utils/utilsIndex");

const createPatientTest = async (req, res) => {
  try {
    const {
      patient_MRNo,
      patient_CNIC,
      patient_Name,
      patient_Guardian,
      patient_ContactNo,
      patient_Gender,
      patient_Age,
      referredBy,
      selectedTests,
      labNotes,
      performedBy,
      isExternalPatient = false,
      totalAmount,
      advanceAmount,
    } = req.body;

    if (
      (!patient_MRNo && !isExternalPatient) ||
      !selectedTests ||
      !selectedTests.length
    ) {
      return res.status(400).json({
        success: false,
        message: isExternalPatient
          ? "Complete details for external patients and at least one test are required"
          : "Patient MRNo and at least one test are required",
        requiredFields: ["selectedTests"],
      });
    }

    let patient = {};
    let generatedMRNo;
    let tokenNumber;

    if (isExternalPatient) {
      if (
        !patient_Name ||
        !patient_ContactNo ||
        !patient_Gender ||
        !patient_Age
      ) {
        return res.status(400).json({
          success: false,
          message:
            "For external patients, name, contact number, gender, and age are required",
        });
      }

      const currentDate = new Date().toISOString().split("T")[0];
      generatedMRNo = await utils.generateUniqueMrNo(currentDate);
      tokenNumber = await utils.generateUniqueToken(currentDate);
      patient = {
        patient_MRNo: generatedMRNo,
        patient_CNIC: patient_CNIC || "",
        patient_Name,
        patient_Guardian,
        patient_ContactNo,
        patient_Gender,
        patient_Age,
        isExternal: true,
      };
    } else {
      const fPatient = await hospitalModel.Patient.findOne({
        $or: [{ patient_MRNo }, { patient_CNIC }],
      }).select(
        "patient_MRNo patient_CNIC patient_Name patient_Guardian patient_ContactNo patient_Gender patient_Age"
      );
      const dPatient = await hospitalModel.PatientTest.findOne({
        $or: [{ "patient_Detail.patient_MRNo": patient_MRNo }, { "patient_Detail.patient_CNIC": patient_CNIC }],
      }).select(
        "patient_MRNo patient_CNIC patient_Name patient_Guardian patient_ContactNo patient_Gender patient_Age"
      );
      let foundPatient = fPatient || dPatient;
      if (!foundPatient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }

      patient = foundPatient;
      const currentDate = new Date().toISOString().split("T")[0];
      tokenNumber = await utils.generateUniqueToken(currentDate);
    }

    const testIds = selectedTests.map((t) => {
      if (!mongoose.Types.ObjectId.isValid(t.test)) {
        throw new Error(`Invalid test ID format: ${t.test}`);
      }
      return new mongoose.Types.ObjectId(t.test);
    });

    const tests = await hospitalModel.TestManagment.find({
      _id: { $in: testIds },
    }).select("testName testCode testPrice");

    if (tests.length !== selectedTests.length) {
      const foundTestIds = tests.map((t) => t._id.toString());
      const missingTests = testIds
        .filter((id) => !foundTestIds.includes(id.toString()))
        .map((id) => id.toString());

      return res.status(404).json({
        success: false,
        message: "One or more tests not found",
        missingTests,
      });
    }

    const calculatedTotalAmount = selectedTests.reduce(
      (sum, test) =>
        sum +
        (test.testPrice ||
          tests.find((t) =>
            t._id.equals(new mongoose.Types.ObjectId(test.test))
          )?.testPrice ||
          0),
      0
    );

    const calculatedDiscountAmount = selectedTests.reduce(
      (sum, test) => sum + (test.discountAmount || 0),
      0
    );

    const calculatedAdvanceAmount =
      advanceAmount !== undefined
        ? advanceAmount
        : selectedTests.reduce(
            (sum, test) => sum + (test.advanceAmount || 0),
            0
          );

    const remainingAmount =
      calculatedTotalAmount -
      calculatedDiscountAmount -
      calculatedAdvanceAmount;

    let paymentStatus;
    if (remainingAmount <= 0) {
      paymentStatus = "paid";
    } else if (calculatedAdvanceAmount > 0) {
      paymentStatus = "partial";
    } else {
      paymentStatus = "pending";
    }

    const mappedTests = selectedTests.map((testInput) => {
      const testDoc = tests.find((t) =>
        t._id.equals(new mongoose.Types.ObjectId(testInput.test))
      );

      const testPrice = testInput.testPrice || testDoc.testPrice;
      const discountAmount = testInput.discountAmount || 0;
      const advanceAmount = testInput.advanceAmount || 0;
      const remainingAmount = testPrice - discountAmount - advanceAmount;

      return {
        test: testInput.test,
        testDetails: {
          testName: testDoc.testName,
          testCode: testDoc.testCode,
          testPrice,
          advanceAmount,
          discountAmount,
          remainingAmount,
          sampleStatus: "pending",
          reportStatus: "not_started",
        },
        testDate: new Date(),
        statusHistory: [
          {
            status: "registered",
            changedAt: new Date(),
            changedBy: performedBy || "system",
          },
        ],
      };
    });

    const patientTest = new hospitalModel.PatientTest({
      patient_Detail: {
        patient_MRNo: patient.patient_MRNo || generatedMRNo,
        patient_CNIC: patient.patient_CNIC,
        patient_Name: patient.patient_Name,
        patient_Guardian: patient.patient_Guardian,
        patient_ContactNo: patient.patient_ContactNo,
        patient_Gender: patient.patient_Gender,
        patient_Age: patient.patient_Age,
        referredBy: referredBy || "Self",
        isExternal: isExternalPatient,
      },
      selectedTests: mappedTests,
      totalAmount: calculatedTotalAmount,
      advanceAmount: calculatedAdvanceAmount,
      discountAmount: calculatedDiscountAmount,
      remainingAmount: remainingAmount,
      totalPaid: calculatedAdvanceAmount,
      paidAfterReport: 0,
      paymentStatus: paymentStatus,
      refunded: [],
      labNotes,
      performedBy,
      tokenNumber,
      isExternalPatient,
      history: [
        {
          action: "create",
          performedBy: performedBy || req.user.user_Name || "system",
        },
      ],
    });

    await patientTest.save();

    return res.status(201).json({
      success: true,
      message: "Lab test order created successfully",
      data: {
        patientTestId: patientTest._id,
        tokenNumber,
        patient: {
          mrNo: patientTest.patient_Detail.patient_MRNo,
          name: patientTest.patient_Detail.patient_Name,
          patient_Guardian: patientTest.patient_Detail.patient_Guardian,
          contact: patientTest.patient_Detail.patient_ContactNo,
        },
        tests: patientTest.selectedTests.map((t) => ({
          testId: t.test,
          testName: t.testDetails.testName,
          price: t.testDetails.testPrice,
          discount: t.testDetails.discountAmount,
          paid: t.testDetails.advanceAmount,
          remaining: t.testDetails.remainingAmount,
          status: t.testDetails.sampleStatus,
        })),
        financialSummary: {
          totalAmount: calculatedTotalAmount,
          totalDiscount: calculatedDiscountAmount,
          totalPaid: calculatedAdvanceAmount,
          totalRemaining: remainingAmount,
          paymentStatus: paymentStatus,
        },
        createdAt: patientTest.createdAt,
        totalTests: patientTest.selectedTests.length,
        status: "created",
      },
    });
  } catch (error) {
    console.error("Error creating lab patient test:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate test order detected",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllPatientTests = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { isDeleted: false };

    if (search) {
      query.$or = [
        { "patient_Detail.patient_MRNo": { $regex: search, $options: "i" } },
        { "patient_Detail.patient_Name": { $regex: search, $options: "i" } },
        { "patient_Detail.patient_CNIC": { $regex: search, $options: "i" } },
      ];
    }

    const patientTests = await hospitalModel.PatientTest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await hospitalModel.PatientTest.countDocuments(query);

    // Map over each patientTest and attach their own testDefinitions
    const patientTestsWithDefinitions = await Promise.all(
      patientTests.map(async (pt) => {
        const testCodes =
          pt.selectedTests
            ?.map((t) => t.testDetails?.testCode)
            .filter(Boolean) || [];

        const testDefinitions = await hospitalModel.TestManagment.find({
          testCode: { $in: testCodes },
        }).lean();

        const testResultIds = testDefinitions.map((test) =>
          test._id.toString()
        );

        const testResults = await hospitalModel.TestResult.find({
          testId: { $in: testResultIds },
        }).lean();

        // Create result lookup: testId -> fieldName -> result
        const resultLookup = {};
        for (const result of testResults) {
          const testId = result.testId.toString();
          if (!resultLookup[testId]) resultLookup[testId] = {};

          for (const res of result.results || []) {
            resultLookup[testId][res.fieldName] = {
              value: res.value || null,
              note: res.notes || null,
            };
          }
        }

        // Enrich each testDefinition
        const enrichedTestDefinitions = testDefinitions.map((td) => {
          const testId = td._id.toString();
          const resultsForThisTest = resultLookup[testId] || {};

          const enrichedFields = (td.fields || []).map((field) => {
            const matchedResult = resultsForThisTest[field.name] || {};
            return {
              ...field,
              value: matchedResult.value ?? null,
              note: matchedResult.note ?? null,
            };
          });

          return {
            ...td,
            fields: enrichedFields,
          };
        });

        return {
          ...pt,
          testDefinitions: enrichedTestDefinitions,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        patientTests: patientTestsWithDefinitions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching patient tests:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getPatientTestById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient test ID format",
      });
    }

    const patientTest = await hospitalModel.PatientTest.findOne({
      _id: id,
      isDeleted: false,
    }).lean();

    if (!patientTest) {
      return res.status(404).json({
        success: false,
        message: "Patient test not found",
      });
    }
    const testIds = patientTest.selectedTests?.map((t) => t.test);

    const testDefinitions = await hospitalModel.TestManagment.find({
      _id: { $in: testIds },
    }).lean();

    const testResultIds = testDefinitions.map((test) => test._id.toString());

    const testResults = await hospitalModel.TestResult.find({
      testId: { $in: testResultIds },
      patientTestId: id,
    }).lean();

    // Build result lookup: testId -> fieldName -> result info
    const resultLookup = {};
    for (const result of testResults) {
      const testId = result.testId.toString();
      if (!resultLookup[testId]) resultLookup[testId] = {};

      for (const res of result.results || []) {
        resultLookup[testId][res.fieldName] = {
          value: res.value ?? null,
          note: res.notes ?? null,
        };
      }
    }
    // console.log("The testDefinitions are: ", testDefinitions?.[0]?.fields?.[0] , resultLookup)
    // Enrich testDefinitions
    const enrichedTestDefinitions = testDefinitions.map((td) => {
      const testId = td._id.toString();
      const resultsForThisTest = resultLookup[testId] || {};

      const enrichedFields = (td.fields || []).map((field) => {
        const matchedResult = resultsForThisTest[field.name];
        return {
          ...field,
          value: matchedResult?.value ?? null,
          note: matchedResult?.note ?? null,
        };
      });

      return {
        ...td,
        fields: enrichedFields,
      };
    });

    // If you need to return this or continue using it:
    // console.log("Enriched Test Definitions", enrichedTestDefinitions?.[0]?.fields?.[0]);

    return res.status(200).json({
      success: true,
      data: {
        patientTest,
        testDefinitions: enrichedTestDefinitions,
      },
    });
  } catch (error) {
    console.error("Error fetching patient test:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getPatientTestByMRNo = async (req, res) => {
  try {
    const { mrNo } = req.params;

    // Try fetching from PatientTest
    const patienttest = await hospitalModel.PatientTest.findOne({
      $or: [
        { "patient_Detail.patient_MRNo": String(mrNo).trim() },
        { "patient_Detail.patient_CNIC": String(mrNo).trim() },
      ],
    }).lean();

    // Try fetching from Patient
    const patient = await hospitalModel.Patient.findOne({
      $or: [
        { patient_MRNo: String(mrNo).trim() },
        { patient_CNIC: String(mrNo).trim() },
      ],
    }).lean();

    if (!patienttest && !patient) {
      return res.status(404).json({
        success: false,
        message: "No patient test or patient found.",
      });
    }

    // Extract fields from PatientTest if exists
    if (patienttest) {
      const detail = patienttest.patient_Detail || {};
      return res.status(200).json({
        success: true,
        data: {
          cnic: detail.patient_CNIC || null,
          name: detail.patient_Name || null,
          patient_Guardian: detail.patient_Guardian || null,
          contactNo: detail.patient_ContactNo || null,
          maritalStatus: null, // not available in PatientTest
          age: detail.patient_Age || null,
          gender: detail.patient_Gender || null,
          DateOfBirth: null, // not available in PatientTest
          referredBy: detail.referredBy || null,
          mrno: detail.patient_MRNo || null,
        },
      });
    }

    // Otherwise extract from Patient
    if (patient) {
      return res.status(200).json({
        success: true,
        data: {
          cnic: patient.patient_CNIC || null,
          name: patient.patient_Name || null,
          patient_Guardian: patient.patient_Guardian || null,
          contactNo: patient.patient_ContactNo || null,
          maritalStatus: patient.patient_MaritalStatus || null,
          age: patient.patient_Age || null,
          gender: patient.patient_Gender || null,
          gaurdian: patient.patient_Guardian?.guardian_Name || null,
          mrno: patient.patient_MRNo || null,
          DateOfBirth: patient.patient_DateOfBirth || null,
          referredBy: patient.patient_HospitalInformation?.referredBy || null,
        },
      });
    }

  } catch (error) {
    console.error("Error fetching patient info:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const softDeletePatientTest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient test ID format",
      });
    }

    const patientTest = await hospitalModel.PatientTest.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        $set: { isDeleted: true },
        $push: {
          history: {
            action: "soft_delete",
            performedBy: req.user.user_Name || "system",
          },
        },
      },
      { new: true }
    );

    if (!patientTest) {
      return res.status(404).json({
        success: false,
        message: "Patient test not found or already deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient test soft deleted successfully",
      data: {
        patientTestId: patientTest._id,
        deletedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error soft deleting patient test:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const restorePatientTest = async (req, res) => {
  try {
    const { id } = req.params;

    const patientTest = await hospitalModel.PatientTest.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { $set: { isDeleted: false } },
      { new: true }
    );

    if (!patientTest) {
      return res.status(404).json({
        success: false,
        message: "Patient test not found or not deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient test restored successfully",
    });
  } catch (error) {
    console.error("Error restoring patient test:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const PatientTestStates = async (req, res) => {
  try {
    const PatientTest = hospitalModel.PatientTest;
    const TestResult = hospitalModel.TestResult;

    // Aggregate test statistics
    const stats = await PatientTest.aggregate([
      { $match: { isDeleted: false } },
      {
        $facet: {
          totalTests: [{ $count: "count" }],
          testStatus: [
            {
              $unwind: "$selectedTests",
            },
            {
              $group: {
                _id: null,
                completed: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$selectedTests.testDetails.reportStatus",
                          "completed",
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                pending: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$selectedTests.testDetails.sampleStatus",
                          "pending",
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                urgent: {
                  $sum: {
                    $cond: [
                      { $eq: ["$selectedTests.testDetails.testCode", "cns"] },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          revenue: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" },
                totalDiscount: { $sum: "$advanceAmount" },
                totalRemainingAmount: { $sum: "$remainingAmount" },
                totalAdvancePayment: { $sum: "$advancePayment" },
                totalPaidAfterReport: {
                  $sum: { $ifNull: ["$paidAfterReport", 0] },
                },
                pendingRevenue: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentStatus", "pending"] },
                      "$remainingAmount",
                      0,
                    ],
                  },
                },
                paidRevenue: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentStatus", "paid"] },
                      {
                        $add: [
                          "$advancePayment",
                          { $ifNull: ["$paidAfterReport", 0] },
                        ],
                      },
                      0,
                    ],
                  },
                },
                refundedRevenue: {
                  $sum: {
                    $reduce: {
                      input: "$refunded",
                      initialValue: 0,
                      in: { $add: ["$$value", "$$this.refundAmount"] },
                    },
                  },
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          totalTests: { $arrayElemAt: ["$totalTests.count", 0] },
          completedTests: { $arrayElemAt: ["$testStatus.completed", 0] },
          pendingTests: { $arrayElemAt: ["$testStatus.pending", 0] },
          urgentTests: { $arrayElemAt: ["$testStatus.urgent", 0] },

          // Revenue metrics
          totalRevenue: { $arrayElemAt: ["$revenue.totalRevenue", 0] },
          totalDiscount: { $arrayElemAt: ["$revenue.totalDiscount", 0] },
          totalRemainingAmount: {
            $arrayElemAt: ["$revenue.totalRemainingAmount", 0],
          },
          totalAdvancePayment: {
            $arrayElemAt: ["$revenue.totalAdvancePayment", 0],
          },
          totalPaidAfterReport: {
            $arrayElemAt: ["$revenue.totalPaidAfterReport", 0],
          },
          pendingRevenue: { $arrayElemAt: ["$revenue.pendingRevenue", 0] },
          paidRevenue: { $arrayElemAt: ["$revenue.paidRevenue", 0] },
          refundedRevenue: { $arrayElemAt: ["$revenue.refundedRevenue", 0] },

          // Calculated fields
          remainingRevenue: {
            $subtract: [
              { $arrayElemAt: ["$revenue.totalRemainingAmount", 0] },
              { $arrayElemAt: ["$revenue.paidRevenue", 0] },
            ],
          },
        },
      },
    ]);

    // Fetch alerts based on test status and payment issues
    const alerts = await PatientTest.aggregate([
      { $match: { isDeleted: false } },
      { $unwind: "$selectedTests" },
      {
        $lookup: {
          from: "testresults",
          localField: "_id",
          foreignField: "patientTestId",
          as: "testResults",
        },
      },
      {
        $project: {
          _id: 1,
          testId: "$selectedTests._id",
          testName: "$selectedTests.testDetails.testName",
          testCode: "$selectedTests.testDetails.testCode",
          sampleStatus: "$selectedTests.testDetails.sampleStatus",
          reportStatus: "$selectedTests.testDetails.reportStatus",
          testDate: "$selectedTests.testDate",
          patientName: "$patient_Detail.patient_Name",
          paymentStatus: 1,
          remainingAmount: 1,
          advancePayment: 1,
          paidAfterReport: 1,
        },
      },
      {
        $match: {
          $or: [
            { sampleStatus: "pending" },
            { reportStatus: { $ne: "completed" } },
            {
              $expr: {
                $and: [
                  { $eq: ["$paymentStatus", "pending"] },
                  { $gt: ["$remainingAmount", 0] },
                ],
              },
            },
            { testCode: "cns" },
          ],
        },
      },
    ]);

    // Process alerts
    const now = new Date();
    const processedAlerts = alerts
      .map((alert) => {
        const testDate = new Date(alert.testDate);
        const hoursDiff = Math.abs(now - testDate) / 36e5;
        let alertType = "";
        let priority = "medium";

        if (hoursDiff > 24 && alert.sampleStatus !== "collected") {
          alertType = `Sample for ${alert.testName} expired`;
          priority = "high";
        } else if (alert.testCode === "cns") {
          alertType = `Critical test pending: ${alert.testName}`;
          priority = "critical";
        } else if (
          alert.paymentStatus === "pending" &&
          alert.remainingAmount > 0
        ) {
          const paidAmount =
            (alert.advancePayment || 0) + (alert.paidAfterReport || 0);
          const remainingAmount = alert.remainingAmount - paidAmount;
          alertType = `Unpaid amount ${remainingAmount} for ${alert.patientName}`;
          priority = remainingAmount > 500 ? "high" : "medium";
        }

        return {
          id: `${alert._id}-${alert.testId}`,
          message: alertType,
          timeStatus:
            hoursDiff > 24 ? `${Math.floor(hoursDiff)} hours ago` : "Pending",
          priority,
          testType: alert.testName,
          patient: alert.patientName,
        };
      })
      .filter((alert) => alert.message);

    const result = {
      stats: {
        totalTests: stats[0]?.totalTests || 0,
        completedTests: stats[0]?.completedTests || 0,
        pendingTests: stats[0]?.pendingTests || 0,
        urgentTests: stats[0]?.urgentTests || 0,

        // Revenue metrics
        totalRevenue: stats[0]?.totalRevenue || 0,
        totalDiscount: stats[0]?.totalDiscount || 0,
        totalRemainingAmount: stats[0]?.totalRemainingAmount || 0,
        totalAdvancePayment: stats[0]?.totalAdvancePayment || 0,
        totalPaidAfterReport: stats[0]?.totalPaidAfterReport || 0,
        pendingRevenue: stats[0]?.pendingRevenue || 0,
        paidRevenue: stats[0]?.paidRevenue || 0,
        refundedRevenue: stats[0]?.refundedRevenue || 0,
        remainingRevenue: stats[0]?.remainingRevenue || 0,
      },
      alerts: processedAlerts,
      tests: await PatientTest.find({ isDeleted: false }).lean(),
    };

    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

const paymentAfterReport = async (req, res) => {
  const { patientId } = req.params;
  console.log("Processing payment after report for patient:", patientId);
  try {
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId is required",
      });
    }

    const patientTest = await hospitalModel.PatientTest.findById(patientId);
    if (!patientTest) {
      return res.status(404).json({
        success: false,
        message: "Patient test record not found",
      });
    }

    const oldRemaining = patientTest.remainingAmount;
    const newPaidAfterReport = patientTest.paidAfterReport + oldRemaining;
    const newTotalPaid = patientTest.totalPaid + oldRemaining;

    // Add history entry
    patientTest.history = patientTest.history || [];
    patientTest.history.push({
      action: "finalize_payment",
      performedBy: req.user.user_Name || "system",
    });

    const updatedPatientTest = await hospitalModel.PatientTest.findByIdAndUpdate(
      patientId,
      {
        $set: {
          paidAfterReport: newPaidAfterReport,
          totalPaid: newTotalPaid,
          remainingAmount: 0,
          paymentStatus: "paid",
          refundableAmount: 0,
          performedBy: req.user.user_Name || "system",
        },
      },
      { new: true }
    ).select("-__v -isDeleted -createdAt -updatedAt");

    return res.status(200).json({
      success: true,
      message: "Payment finalized successfully",
      data: {
        patientTest: updatedPatientTest,
        performedBy: updatedPatientTest.performedBy,
        financialStatus: {
          previousRemaining: oldRemaining,
          newPaidAfterReport: newPaidAfterReport,
          newTotalPaid: newTotalPaid,
          newRemaining: 0,
          paymentStatus: "paid",
        },
      },
    });
  } catch (error) {
    console.error("Error finalizing payment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updatePatientTest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient test ID format",
      });
    }

    const existingTest = await hospitalModel.PatientTest.findById(id);
    if (!existingTest) {
      return res.status(404).json({
        success: false,
        message: "Patient test not found",
      });
    }

    const hasNonRegisteredTests = existingTest.selectedTests.some(
      test => test.testStatus !== "registered"
    );
    if (hasNonRegisteredTests) {
      return res.status(400).json({
        success: false,
        message: "Cannot update - one or more tests have status other than 'registered'",
      });
    }

    const updateObj = {
      $set: {
        patient_Detail: {
          patient_MRNo: updateData.patient_Detail?.patient_MRNo || existingTest.patient_Detail.patient_MRNo,
          patient_CNIC: updateData.patient_Detail?.patient_CNIC || existingTest.patient_Detail.patient_CNIC,
          patient_Name: updateData.patient_Detail?.patient_Name || existingTest.patient_Detail.patient_Name,
          patient_Guardian: updateData.patient_Detail?.patient_Guardian || existingTest.patient_Detail.patient_Guardian,
          patient_ContactNo: updateData.patient_Detail?.patient_ContactNo || existingTest.patient_Detail.patient_ContactNo,
          patient_Gender: updateData.patient_Detail?.patient_Gender || existingTest.patient_Detail.patient_Gender,
          patient_Age: updateData.patient_Detail?.patient_Age || existingTest.patient_Detail.patient_Age,
          referredBy: updateData.patient_Detail?.referredBy || existingTest.patient_Detail.referredBy,
        },
        labNotes: updateData.labNotes || existingTest.labNotes,
        performedBy: updateData.performedBy || existingTest.performedBy,
      }
    };

    if (updateData.totalPaid !== undefined) {
      updateObj.$set.totalPaid = updateData.totalPaid;
    }
    if (updateData.paidAfterReport !== undefined) {
      updateObj.$set.paidAfterReport = updateData.paidAfterReport;
    }

    if (updateData.selectedTests && updateData.selectedTests.length > 0) {
      updateObj.$set.selectedTests = existingTest.selectedTests.map((existingTestItem, index) => {
        const updateTestItem = updateData.selectedTests[index] || {};
        return {
          ...existingTestItem.toObject(),
          testDetails: {
            ...existingTestItem.testDetails.toObject(),
            testName: updateTestItem.testDetails?.testName || existingTestItem.testDetails.testName,
            testPrice: updateTestItem.testDetails?.testPrice || existingTestItem.testDetails.testPrice,
            advanceAmount: updateTestItem.testDetails?.advanceAmount || existingTestItem.testDetails.advanceAmount,
            discountAmount: updateTestItem.testDetails?.discountAmount || existingTestItem.testDetails.discountAmount,
            remainingAmount: updateTestItem.testDetails?.remainingAmount || existingTestItem.testDetails.remainingAmount,
          },
          testDate: updateTestItem.testDate || existingTestItem.testDate,
        };
      });

      const totalAmount = updateObj.$set.selectedTests.reduce(
        (sum, test) => sum + (test.testDetails.testPrice || 0), 0
      );
      const discountAmount = updateObj.$set.selectedTests.reduce(
        (sum, test) => sum + (test.testDetails.discountAmount || 0), 0
      );
      const advanceAmount = updateObj.$set.selectedTests.reduce(
        (sum, test) => sum + (test.testDetails.advanceAmount || 0), 0
      );
      const remainingAmount = totalAmount - discountAmount - advanceAmount;

      updateObj.$set.totalAmount = totalAmount;
      updateObj.$set.discountAmount = discountAmount;
      updateObj.$set.advanceAmount = advanceAmount;
      updateObj.$set.totalPaid = advanceAmount;
      updateObj.$set.remainingAmount = remainingAmount;
    }

    // Add history entry
    updateObj.$push = {
      history: {
        action: "update",
        performedBy: req.user.user_Name || "system",
      },
    };

    const updatedTest = await hospitalModel.PatientTest.findByIdAndUpdate(
      id,
      updateObj,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Patient test updated successfully",
      data: updatedTest,
    });
  } catch (error) {
    console.error("Error updating patient test:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


module.exports = {
  createPatientTest,
  getAllPatientTests,
  getPatientTestById,
  restorePatientTest,
  softDeletePatientTest,
  getPatientTestByMRNo,
  PatientTestStates,
  paymentAfterReport,
  updatePatientTest,
};
