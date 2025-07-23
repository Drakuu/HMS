const hospitalModel = require("../models/index.model");
const mongoose = require("mongoose");

const getAllTestBills = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, patientId } = req.query;
        const skip = (page - 1) * limit;

        // Build query object
        const query = { isDeleted: false };
        if (status) query.status = status;
        if (patientId) {
            query.patientTestId = new mongoose.Types.ObjectId(patientId);
        }

        // Get test results with population
        const testResults = await hospitalModel.TestResult.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate({
                path: 'patientTestId',
                select: 'patient_Detail totalAmount discount finalAmount paymentStatus labNotes tokenNumber, advancePayment, refunded'
            })
            .populate({
                path: 'testId',
                select: 'testName testCode testPrice',
                model: 'TestManagment'
            })
            .lean();

        if (!testResults || testResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No test results found'
            });
        }

        // Enhance results with billing info and patient details
        const enhancedResults = testResults.map(result => {
            const patientTest = result.patientTestId || {};
            return {
                ...result,
                testDetails: {
                    name: result.testId?.testName,
                    code: result.testId?.testCode,
                    price: result.testId?.testPrice
                },
                billingInfo: {
                    totalAmount: patientTest.totalAmount,
                    discount: patientTest.discount,
                    finalAmount: patientTest.finalAmount,
                    advanceAmount: patientTest.advancePayment,
                    paymentStatus: patientTest.paymentStatus,
                    labNotes: patientTest.labNotes,
                    tokenNumber: patientTest.tokenNumber,
                    Refunded: patientTest.refunded,
                },
                patientDetails: patientTest.patient_Detail || {}
            };
        });

        // Get unique patientTestIds for counting
        const patientTestIds = [...new Set(testResults.map(r => r.patientTestId?._id.toString()))];

        // Count total documents (using the same query)
        const total = await hospitalModel.TestResult.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                results: enhancedResults,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                },
                summary: {
                    totalPatients: patientTestIds.length,
                    totalTests: enhancedResults.length,
                    completedTests: enhancedResults.filter(t => t.status === 'completed').length,
                    pendingTests: enhancedResults.filter(t => t.status !== 'completed').length
                }
            }
        });

    } catch (error) {
        console.error('Error fetching test results:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching test results',
            error: error.message
        });
    }
};

const getTestBillsByPatientTestId = async (req, res) => {
    try {
        const { patientTestId } = req.params;
        // console.log('the patient id is ', patientTestId);

        // Validate the ID format first
        if (!mongoose.isValidObjectId(patientTestId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid patientTestId format'
            });
        }

        // 1. First get all test results for this patientTestId
        const testResults = await hospitalModel.TestResult.find({
            patientTestId: new mongoose.Types.ObjectId(patientTestId),
            isDeleted: false
        })
        .populate({
            path: 'testId',
            select: 'testName testCode testPrice',
            model: 'TestManagment'
        })
        .lean();

        if (!testResults || testResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No test results found for this patientTestId'
            });
        }

        // 2. Get the PatientTest document using the first test result's patientTestId
        const patientTest = await hospitalModel.PatientTest.findById(patientTestId)
            .select('patient_Detail totalAmount discount finalAmount paymentStatus labNotes tokenNumber, advancePayment')
            .lean();

        if (!patientTest) {
            return res.status(404).json({
                success: false,
                message: 'Patient test record not found'
            });
        }

        // 3. Enhance the test results with additional details
        const enhancedResults = testResults.map(result => ({
            ...result,
            testDetails: {
                name: result.testId?.testName,
                code: result.testId?.testCode,
                price: result.testId?.testPrice
            }
        }));

        return res.status(200).json({
            success: true,
            data: {
                patient: patientTest.patient_Detail || {},
                billingSummary: {
                    totalAmount: patientTest.totalAmount,
                    discount: patientTest.discount,
                    finalAmount: patientTest.finalAmount,
                    paymentStatus: patientTest.paymentStatus,
                    labNotes: patientTest.labNotes,
                    tokenNumber: patientTest.tokenNumber,
                    advanceAmount: patientTest.advancePayment,
                },
                testResults: enhancedResults,
                summary: {
                    totalTests: enhancedResults.length,
                    completedTests: enhancedResults.filter(t => t.status === 'completed').length,
                    pendingTests: enhancedResults.filter(t => t.status !== 'completed').length
                }
            }
        });

    } catch (error) {
        console.error('Error fetching test results:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching test results',
            error: error.message
        });
    }
};

const refundAmountbylab = async (req, res) => {
    const { patientId } = req.params;
    const { refundAmount, refundReason } = req.body;
    // console.log("TJe req.bodyreq.body: ", refundAmount,refundReason )
    const loginuser=req.user
    // console.log("The user is ", loginuser);
    try {
        const performedByid = loginuser.id
        const performedByname = loginuser.user_Name
        // Validate input parameters
        if (!mongoose.isValidObjectId(patientId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid patientId format'
            });
        }

        if (!refundAmount || isNaN(refundAmount) || refundAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid refund amount is required'
            });
        }

        if (!refundReason || !performedByid) {
            return res.status(400).json({
                success: false,
                message: 'Refund reason and performedByid are required'
            });
        }

        // Find the patient test record
        const patientTest = await hospitalModel.PatientTest.findOne({
            _id: patientId,
            isDeleted: false
        });

        if (!patientTest) {
            return res.status(404).json({
                success: false,
                message: 'Patient test record not found'
            });
        }

        // Add the refund record
        const updatedPatientTest = await hospitalModel.PatientTest.findByIdAndUpdate(
            patientId,
            {
                $push: {
                    refunded: {
                        performedByid,
                        performedByname,
                        refundAmount,
                        refundReason
                    }
                }
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Refund record added successfully',
            data: {
                refundRecord: updatedPatientTest.refunded[updatedPatientTest.refunded.length - 1], // Return the last added refund
                totalRefunds: updatedPatientTest.refunded.length
            }
        });

    } catch (error) {
        console.error('Error processing refund:', error);
        return res.status(500).json({
            success: false,
            message: 'Error processing refund',
            error: error.message
        });
    }
};

module.exports = {
    getAllTestBills,
    getTestBillsByPatientTestId,
    refundAmountbylab
};