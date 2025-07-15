const hospitalModel = require("../models/index.model");
const mongoose = require("mongoose");

const submitTestResults = async (req, res) => {
    try {
        const { patientTestId, testId } = req.params;
        const { results, performedBy, notes, status = 'draft' } = req.body;

        console.log(`Received request for patientTestId: ${patientTestId}, testId: ${testId}`);

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(patientTestId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid patientTestId format'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid testId format'
            });
        }

        // 1. Validate the patient test exists
        const patientTest = await hospitalModel.PatientTest.findOne({
            _id: new mongoose.Types.ObjectId(patientTestId),
            isDeleted: false
        });

        if (!patientTest) {
            return res.status(404).json({
                success: false,
                message: 'Patient test record not found'
            });
        }

        // Find the specific test in the patient's selectedTests
        const testToUpdate = patientTest.selectedTests.find(t =>
            t.test.toString() === testId
        );

        if (!testToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'Test not found in patient record'
            });
        }

        // 2. Get test details for normal ranges
        const testDefinition = await hospitalModel.TestManagment.findById(
            testToUpdate.test
        );

        if (!testDefinition) {
            return res.status(404).json({
                success: false,
                message: 'Test definition not found'
            });
        }

        // 3. Prepare results with normal range checks
        const preparedResults = results.map(result => {
            const fieldDef = testDefinition.fields.find(f => f.name === result.fieldName);
            if (!fieldDef) {
                throw new Error(`Field ${result.fieldName} not found in test definition`);
            }

            const gender = patientTest.patient_Detail.patient_Gender.toLowerCase();
            const normalRange = fieldDef.normalRange[gender] || fieldDef.normalRange;

            return {
                fieldName: result.fieldName,
                value: result.value,
                unit: fieldDef.unit,
                normalRange: {
                    min: normalRange.min,
                    max: normalRange.max
                },
                isNormal: checkIfNormal(result.value, normalRange),
                notes: result.notes || '',
                reportedAt: new Date()
            };
        });

        // 4. Create or update test result
        let testResult = await hospitalModel.TestResult.findOne({
            patientTestId: patientTest._id,
            testId: testToUpdate.test
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
                notes
            });
        } else {
            testResult.results = preparedResults;
            testResult.status = status;
            testResult.performedBy = performedBy;
            testResult.notes = notes;
        }

        await testResult.save();

        // 5. Update patient test status if completed
        if (status === 'completed' || status === 'verified') {
            testToUpdate.reportStatus = status === 'verified' ? 'completed' : 'draft';

            testToUpdate.statusHistory.push({
                status: status === 'verified' ? 'reported' : 'processing',
                changedAt: new Date(),
                changedBy: performedBy
            });

            await patientTest.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Test results saved successfully',
            data: {
                testResult,
                patientDetails: {
                    name: patientTest.patient_Detail.patient_Name,
                    mrNo: patientTest.patient_Detail.patient_MRNo
                }
            }
        });

    } catch (error) {
        console.error('Error submitting test results:', error);
        return res.status(500).json({
            success: false,
            message: 'Error submitting test results',
            error: error.message
        });
    }
};

function checkIfNormal(value, normalRange) {
    try {
        const numericValue = parseFloat(value);
        return numericValue >= normalRange.min && numericValue <= normalRange.max;
    } catch (e) {
        console.error('Error checking normal range:', e);
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
                path: 'patientTestId',
                select: 'patient_Detail'
            })
            .populate({
                path: 'testId',
                select: 'testName testCode',
                model: 'TestManagment'
            })
            .lean();

        // Enhance results with patient details
        const enhancedResults = results.map(result => ({
            ...result,
            patientDetails: {
                source: result.patientTestId?.patient_Detail ? 'PatientTest' : 'Not available',
                ...(result.patientTestId?.patient_Detail || {})
            }
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
                    totalPages: Math.ceil(total / limit)
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

const getPatientByResultId = async (req, res) => {
    try {
        const { resultId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(resultId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid result ID format'
            });
        }

        // Find the test result with proper population
        const testResult = await hospitalModel.TestResult.findOne({
            _id: resultId,
            isDeleted: false
        })
        .populate({
            path: 'patientTestId',
            select: 'patient_Detail'
        })
        .populate({
            path: 'testId',
            select: 'testName testCode',
            model: 'TestManagment'
        })
        .lean();

        if (!testResult) {
            return res.status(404).json({
                success: false,
                message: 'Test result not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                testResult,
                patientDetails: {
                    source: testResult.patientTestId?.patient_Detail ? 'PatientTest' : 'Not available',
                    ...(testResult.patientTestId?.patient_Detail || {})
                }
            }
        });

    } catch (error) {
        console.error('Error fetching patient by result ID:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching patient details',
            error: error.message
        });
    }
};

module.exports = {
    submitTestResults,
    getAllTestResults,
    getPatientByResultId,

};