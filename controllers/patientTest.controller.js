const hospitalModel = require("../models/index.model");
const mongoose = require('mongoose');

const createPatientTest = async (req, res) => {
    try {
        const {
            patient_MRNo,
            patient_CNIC,
            referredBy,
            selectedTests,
            discount = 0,
            labNotes,
            performedBy
        } = req.body;

        // Validate required fields
        if (!patient_MRNo || !patient_CNIC || !selectedTests || !selectedTests.length) {
            return res.status(400).json({
                success: false,
                message: 'Patient MRNo, CNIC and at least one test are required',
                requiredFields: ['patient_MRNo', 'patient_CNIC', 'selectedTests']
            });
        }

        // Find patient
        const patient = await hospitalModel.Patient.findOne({
            $or: [
                { patient_MRNo },
                { patient_CNIC }
            ]
        }).select('patient_MRNo patient_CNIC patient_Name patient_ContactNo patient_Gender patient_Age');

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Validate and prepare selected tests
        const testIds = selectedTests.map(t => {
            if (!mongoose.Types.ObjectId.isValid(t.test)) {
                throw new Error(`Invalid test ID format: ${t.test}`);
            }
            return new mongoose.Types.ObjectId(t.test);
        });
        const tests = await hospitalModel.TestManagment.find({
            _id: { $in: testIds }
        }).select('testName testCode testPrice fields.name fields.unit fields.normalRange');

        console.log('Found tests:', tests);

        // console.log('Searching for test IDs:', testIds);
        // console.log('First test ID type:', typeof testIds[0], testIds[0]);

        if (tests.length !== selectedTests.length) {
            const foundTestIds = tests.map(t => t._id.toString());
            const missingTests = testIds
                .filter(id => !foundTestIds.includes(id.toString()))
                .map(id => id.toString());

            return res.status(404).json({
                success: false,
                message: 'One or more tests not found',
                missingTests,
                debug: {
                    collection: 'testmanagments',
                    searchedIds: testIds.map(id => id.toString()),
                    foundIds: foundTestIds
                }
            });
        }

        // Calculate amounts
        const totalAmount = tests.reduce((sum, test) => sum + test.testPrice, 0);
        const finalAmount = totalAmount - (totalAmount * (discount / 100));

        // Create lab patient record
        const patientTest = new hospitalModel.PatientTest({
            patient_Detail: {
                patient_MRNo: patient.patient_MRNo,
                patient_CNIC: patient.patient_CNIC,
                patient_Name: patient.patient_Name,
                patient_ContactNo: patient.patient_ContactNo,
                patient_Gender: patient.patient_Gender,
                patient_Age: patient.patient_Age,
                referredBy: referredBy || 'Self'
            },
            selectedTests: selectedTests.map(test => {
                // Find the full test document for this test ID
                const testDoc = tests.find(t => t._id.equals(new mongoose.Types.ObjectId(test.test)));

                if (!testDoc) {
                    throw new Error(`Test details not found for test ID: ${test.test}`);
                }
                return {
                    test: test.test,
                    testDetails: {  // Add test details
                        testName: testDoc.testName,
                        testCode: testDoc.testCode,
                        testPrice: testDoc.testPrice,
                        fields: testDoc.fields.map(field => ({
                            name: field.name,
                            unit: field.unit,
                            normalRange: field.normalRange
                        }))
                    },
                    results: [],
                    status: 'pending',
                    notes: test.notes || '',
                    testDate: new Date(), // You might want to set this
                    resultDate: null
                };
            }),
            totalAmount,
            discount,
            finalAmount,
            paymentStatus: 'pending',
            labNotes,
            performedBy
        });

        await patientTest.save();

        return res.status(201).json({
            success: true,
            message: 'Lab test order created successfully',
            data: {
                patientTestId: patientTest._id,
                patient: patientTest.patient_Detail,
                tests: tests.map(test => ({
                    testName: test.testName,
                    testCode: test.testCode,
                    testPrice: test.testPrice,
                    fields: test.fields.map(field => ({
                        name: field.name,
                        unit: field.unit,
                        normalRange: field.normalRange
                    }))
                })),
                totalTests: patientTest.selectedTests.length,
                totalAmount,
                discount,
                finalAmount,
                status: 'created'
            }
        });

    } catch (error) {
        console.error('Error creating lab patient test:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

const getAllPatientTests = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (page - 1) * limit;

        let query = { isDeleted: false };
        
        if (search) {
            query = {
                ...query,
                $or: [
                    { 'patient_Detail.patient_MRNo': { $regex: search, $options: 'i' } },
                    { 'patient_Detail.patient_Name': { $regex: search, $options: 'i' } },
                    { 'patient_Detail.patient_CNIC': { $regex: search, $options: 'i' } }
                ]
            };
        }

        const patientTests = await hospitalModel.PatientTest.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await hospitalModel.PatientTest.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                patientTests,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            }
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

const getPatientTestById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid patient test ID format'
            });
        }

        const patientTest = await hospitalModel.PatientTest.findOne({
            _id: id,
            isDeleted: false
        }).lean();

        if (!patientTest) {
            return res.status(404).json({
                success: false,
                message: 'Patient test not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: patientTest
        });

    } catch (error) {
        console.error('Error fetching patient test:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const softDeletePatientTest = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid patient test ID format'
            });
        }

        const patientTest = await hospitalModel.PatientTest.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { $set: { isDeleted: true } },
            { new: true }
        );

        if (!patientTest) {
            return res.status(404).json({
                success: false,
                message: 'Patient test not found or already deleted'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Patient test soft deleted successfully',
            data: {
                patientTestId: patientTest._id,
                deletedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Error soft deleting patient test:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
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
                message: 'Patient test not found or not deleted'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Patient test restored successfully'
        });

    } catch (error) {
        console.error('Error restoring patient test:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    createPatientTest,
    getAllPatientTests,
    getPatientTestById,
   restorePatientTest,
softDeletePatientTest,
};