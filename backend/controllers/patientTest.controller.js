const hospitalModel = require("../models/index.model");
const mongoose = require('mongoose');
const utils = require("../utils/utilsIndex")

const createPatientTest = async (req, res) => {
    try {
        const {
            patient_MRNo,
            patient_CNIC,
            patient_Name,
            patient_ContactNo,
            patient_Gender,
            patient_Age,
            referredBy,
            selectedTests,
            discount = 0,
            labNotes,
            performedBy,
            isExternalPatient = false
        } = req.body;

        // Validate required fields
        if ((!patient_MRNo && !isExternalPatient) || !selectedTests || !selectedTests.length) {
            return res.status(400).json({
                success: false,
                message: isExternalPatient
                    ? 'Complete details for external patients and at least one test are required'
                    : 'Patient MRNo and at least one test are required',
                requiredFields: ['selectedTests']
            });
        }

        let patient;
        let generatedMRNo;
        let tokenNumber;

        // For external patients (no MRNo)
        if (isExternalPatient) {
            if (!patient_Name || !patient_ContactNo || !patient_Gender || !patient_Age) {

                return res.status(400).json({
                    success: false,
                    message: 'For external patients, name, contact number, gender, and age are required'
                });
            }
            // Generate new MRNo and token
            const currentDate = new Date().toISOString().split('T')[0];
            generatedMRNo = await utils.generateUniqueMrNo(currentDate);
            tokenNumber = await utils.generateUniqueToken(currentDate);

            // Create minimal patient record
            patient = {
                patient_MRNo: generatedMRNo,
                patient_CNIC: patient_CNIC || '',
                patient_Name,
                patient_ContactNo,
                patient_Gender,
                patient_Age,
                isExternal: true
            };
        }
        // For existing patients
        else {
            // Find patient in database
            patient = await hospitalModel.Patient.findOne({
                $or: [
                    { patient_MRNo },
                    { patient_CNIC }
                ]
            }).select('patient_MRNo patient_CNIC patient_Name patient_ContactNo patient_Gender patient_Age')

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient not found'
                });
            }

            // Get token for the day
            const currentDate = new Date().toISOString().split('T')[0];
            tokenNumber = await utils.generateUniqueToken(currentDate);
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
        }).select('testName testCode testPrice fields.name fields.unit fields.normalRange')


        if (tests.length !== selectedTests.length) {
            const foundTestIds = tests.map(t => t._id.toString());
            const missingTests = testIds
                .filter(id => !foundTestIds.includes(id.toString()))
                .map(id => id.toString());


            return res.status(404).json({
                success: false,
                message: 'One or more tests not found',
                missingTests
            });
        }

        // Calculate amounts
        const totalAmount = tests.reduce((sum, test) => sum + test.testPrice, 0);
        const finalAmount = totalAmount - discount;

        // Create patient test record
        const patientTest = new hospitalModel.PatientTest({
            patient_Detail: {
                patient_MRNo: patient.patient_MRNo || generatedMRNo,
                patient_CNIC: patient.patient_CNIC,
                patient_Name: patient.patient_Name,
                patient_ContactNo: patient.patient_ContactNo,
                patient_Gender: patient.patient_Gender,
                patient_Age: patient.patient_Age,
                referredBy: referredBy || 'Self',
                isExternal: isExternalPatient
            },
            selectedTests: selectedTests.map(test => {
                const testDoc = tests.find(t => t._id.equals(new mongoose.Types.ObjectId(test.test)));
                return {
                    test: test.test,
                    testDetails: {
                        testName: testDoc.testName,
                        testCode: testDoc.testCode,
                        testPrice: testDoc.testPrice,
                    },
                    sampleStatus: 'pending',
                    reportStatus: 'not_started',
                    testDate: new Date(),
                    statusHistory: [{
                        status: 'registered',
                        changedAt: new Date(),
                        changedBy: performedBy || 'system'
                    }]
                };
            }),
            totalAmount,
            discount,
            finalAmount,
            paymentStatus: 'pending',
            labNotes,
            performedBy,
            tokenNumber,
            isExternalPatient
        });

        await patientTest.save();

        // If external patient, create minimal patient record
        if (isExternalPatient && !patient._id) {
            await hospitalModel.Patient.create({
                patient_MRNo: generatedMRNo,
                patient_CNIC,
                patient_Name,
                patient_ContactNo,
                patient_Gender,
                patient_Age: patient_Age,
                isExternal: true,
                patient_HospitalInformation: {
                    token: tokenNumber,
                    referredBy: referredBy || 'External'
                }
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Lab test order created successfully',
            data: {
                patientTestId: patientTest._id,
                tokenNumber,
                patient: {
                    mrNo: patientTest.patient_Detail.patient_MRNo,
                    name: patientTest.patient_Detail.patient_Name,
                    contact: patientTest.patient_Detail.patient_ContactNo
                },
                tests: patientTest.selectedTests.map(t => ({
                    testId: t.test,
                    testName: t.testName,
                    status: t.status,
                    lastStatusChange: t.statusHistory[0].changedAt
                })),
                createdAt: patientTest.createdAt,
                totalTests: patientTest.selectedTests.length,
                status: 'created'
            }
        });

    } catch (error) {

        console.error('Error creating lab patient test:', error);

        // Handle duplicate key errors specifically
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Duplicate test order detected',
                error: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

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
        const testIds = patientTest.selectedTests?.map(t => t.test);

        const testDefinitions = await hospitalModel.TestManagment.find({
            _id: { $in: testIds }
        });

        return res.status(200).json({
            success: true,
            data: {
                patientTest,
                testDefinitions
            }
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

const getPatientTestByMRNo = async (req, res) => {
    try {
        const { mrNo } = req.params;
        console.log("Looking for MR No:", `"${mrNo}"`);

        const patientTest = await hospitalModel.PatientTest.findOne({
            "patient_Detail.patient_MRNo": mrNo.trim()
        }).lean();

        if (!patientTest) {
            return res.status(404).json({
                success: false,
                message: 'Patient test not found'
            });
        }
        console.log(`the patient test`, patientTest)
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
    getPatientTestByMRNo,
};