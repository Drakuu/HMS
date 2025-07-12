const hospitalModel = require("../models/index.model");

const submitTestResults = async (req, res) => {
    try {
        const { patientTestId, testId } = req.params;
        console.log(`the params are`, req.params)
        const { results, performedBy, notes, status = 'draft' } = req.body;

        console.log(`Received request for patientTestId: ${patientTestId}, testId: ${testId}`);

        // 1. Validate the patient test exists
        const patientTest = await hospitalModel.PatientTest.findOne({
            _id: patientTestId,
            'selectedTests._id': testId,
            isDeleted: false
        });

        console.log(`the patient test id `, patientTest)

        if (!patientTest) {
            return res.status(404).json({
                success: false,
                message: 'Test order not found'
            });
        }

        // Get the specific test being updated
        const testToUpdate = patientTest.selectedTests.id(testId);

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
            patientTestId,
            testId
        });

        if (!testResult) {
            testResult = new hospitalModel.TestResult({
                patientTestId,
                testId,
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

module.exports = {
    submitTestResults,
};