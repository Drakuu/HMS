import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import PrintTestReport from './PrintTestReport';
import {
  FiChevronLeft,
  FiSave,
  FiPrinter,
  FiAlertCircle,
  FiInfo,
  FiX,
  FiSearch,
} from 'react-icons/fi';
import { fetchPatientTestById } from '../../../features/patientTest/patientTestSlice';
import { updatePatientTestResults } from '../../../features/testResult/TestResultSlice';
import PatientInfoSection from './PatientInfoSection';
import TestResultsForm from './TestResultsForm';

const UpdateReport = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { patientTestById, status, error } = useSelector(
    (state) => state.patientTest
  );
  // console.log('patient test', patientTestById);

  const [initialValues, setInitialValues] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPrintOptionsModal, setShowPrintOptionsModal] = useState(false);
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    results: {},
    status: 'completed',
    notes: '',
    performedBy: '',
  });
  const [activeTestIndex, setActiveTestIndex] = useState(0);

  const [localStatuses, setLocalStatuses] = useState({});

  const [statusByTest, setStatusByTest] = useState({});
  // Get all selected tests
  const selectedTests = patientTestById?.patientTest?.selectedTests || [];
  // Get all test definitions
  const testDefinitions = patientTestById?.testDefinitions || [];
  // seed once tests load
  useEffect(() => {
    if (selectedTests.length) {
      const seed = {};
      selectedTests.forEach((t) => {
        // default is "pending" if nothing known
        const server = getCurrentStatus(t.statusHistory); // may be 'registered'/'processing'/etc
        seed[t.test] = server || 'pending';
      });
      setStatusByTest(seed);
    }
  }, [selectedTests]);

  useEffect(() => {
    dispatch(fetchPatientTestById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedTests.length > 0) {
      const seed = {};
      selectedTests.forEach((t) => {
        seed[t.test] = getCurrentStatus(t.statusHistory);
      });
      setStatusByTest(seed);
    }
  }, [selectedTests]);

  // Extract patient data
  const patientData = patientTestById?.patientTest
    ? {
        patientName: patientTestById.patientTest.patient_Detail?.patient_Name,
        gender: patientTestById.patientTest.patient_Detail?.patient_Gender,
        age: patientTestById.patientTest.patient_Detail?.patient_Age,
        mrNumber: patientTestById.patientTest.patient_Detail?.patient_MRNo,
        cnic: patientTestById.patientTest.patient_Detail?.patient_CNIC,
        contactNo:
          patientTestById.patientTest.patient_Detail?.patient_ContactNo,
        testDate: patientTestById.patientTest.createdAt,
        referredBy: patientTestById.patientTest.patient_Detail?.referredBy,
        paymentStatus: patientTestById.patientTest.paymentStatus,
        finalAmount: patientTestById.patientTest.finalAmount,
        tokenNumber: patientTestById.patientTest.tokenNumber,
      }
    : null;

  // Initialize form data with test fields for all tests and pre-populate existing values
  useEffect(() => {
    if (selectedTests.length > 0 && testDefinitions.length > 0) {
      const initialResults = {};
      const initialVals = {};

      selectedTests.forEach((test) => {
        const testDefinition = testDefinitions.find(
          (td) => td._id === test.test
        );
        const testFields = testDefinition?.fields || [];

        initialResults[test.test] = testFields.map((field) => ({
          fieldName: field.name,
          value: field.value || '',
          notes: field.note || '',
          unit: field.unit || '',
          normalRange: field.normalRange || null,
          fieldId: field._id,
        }));

        initialVals[test.test] = testFields.map((field) => ({
          value: field.value || '',
          notes: field.note || '',
        }));
      });

      setFormData((prev) => ({
        ...prev,
        results: initialResults,
      }));

      setInitialValues(initialVals);
    }
  }, [selectedTests, testDefinitions]);

  const getCurrentStatus = (statusHistory) => {
    if (!statusHistory || statusHistory.length === 0) return 'registered';
    const sortedHistory = [...statusHistory].sort(
      (a, b) => new Date(b.changedAt) - new Date(a.changedAt)
    );
    return sortedHistory[0].status;
  };

  const preparePrintData = (testIds) => {
    if (!patientTestById) return null;

    const patientData = {
      printData: patientTestById,
    };

    const testsToPrint =
      testIds.length > 0
        ? selectedTests.filter((test) => testIds.includes(test.test))
        : selectedTests;

    const testResults = testsToPrint.map((test) => {
      const testDefinition = testDefinitions.find((td) => td._id === test.test);
      const currentResults = formData.results[test.test] || [];
      return {
        testName: test.testDetails.testName,
        fields: currentResults.map((result) => ({
          fieldName: result.fieldName,
          value: result.value,
          unit: result.unit,
          normalRange: result.normalRange,
          notes: result.notes,
        })),
        notes: formData.notes,
      };
    });

    return { patientData, testResults };
  };

  const proceedWithPrint = async (testIds) => {
    try {
      for (const tid of testIds) {
        const def = testDefinitions.find((td) => td._id === tid);
        if (!def || !Array.isArray(def.fields)) {
          console.warn('Skipping (no fields):', tid);
          continue;
        }

        const rows = formData?.results?.[tid] || [];
        const updateData = {
          results: rows
            .filter((r) => r?.fieldName?.trim()?.length)
            .map((r) => ({
              fieldName: r.fieldName,
              value: r.value,
              notes: r.notes,
              testId: tid, // 👈 important
            })),
          status: statusByTest[tid] ?? 'pending',
          notes: formData.notes ?? '',
        };

        await dispatch(
          updatePatientTestResults({
            patientTestId: id,
            testId: tid,
            updateData,
          })
        ).unwrap();
      }

      // Prepare and print the report
      const printData = preparePrintData(testIds);
      if (!printData) return;

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups for printing');
        return;
      }

      const printContent = ReactDOMServer.renderToStaticMarkup(
        <PrintTestReport
          patientTest={printData.patientData.printData.patientTest}
          testDefinitions={printData.testResults}
        />
      );

      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Test Report</title>
            <style>
              @page {
                size: A4;
                margin: 5mm 10mm;
              }
              
              body {
                margin: 0;
                padding: 5mm;
                color: #333;
                width: 190mm;
                height: 277mm;
                position: relative;
                font-size: 13px;
                line-height: 1.3;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                font-family: Arial, sans-serif;
              }

              .header {
                text-align: center;
                margin-bottom: 10px;
                border-bottom: 2px solid #2b6cb0;
                padding-bottom: 10px;
              }

              .hospital-name {
                font-size: 24px;
                font-weight: bold;
                color: #2b6cb0;
                margin-bottom: 5px;
              }

              .hospital-subtitle {
                font-size: 14px;
                color: #555;
                margin-bottom: 5px;
              }

              .patient-info {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
              }

              .patient-info td {
                padding: 3px 5px;
                vertical-align: top;
              }

              .patient-info .label {
                font-weight: bold;
                width: 120px;
              }

              .test-section {
                margin-bottom: 20px;
              }

              .test-title {
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 5px;
                color: #2b6cb0;
              }

              .test-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10px;
              }

              .test-table th {
                background-color: #f0f0f0;
                border: 1px solid #ddd;
                padding: 5px;
                text-align: left;
                font-weight: bold;
              }

              .test-table td {
                border: 1px solid #ddd;
                padding: 5px;
              }

              .footer {
                position: absolute;
                bottom: 10mm;
                width: 100%;
                display: flex;
                justify-content: space-between;
              }

              .signature {
                text-align: center;
                width: 150px;
                border-top: 1px solid #000;
                padding-top: 5px;
                margin-top: 30px;
                font-size: 12px;
              }

              .normal-range {
                font-size: 11px;
                color: #666;
              }

              .abnormal {
                color: red;
                font-weight: bold;
              }

              @media print {
                body {
                  padding: 0;
                  margin: 0;
                  width: 210mm;
                  height: 297mm;
                }
              }
            </style>
          </head>
          <body>${printContent}</body>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      alert(`Failed to save and print: ${error.message || 'Unknown error'}`);
    }
  };

  const handlePrint = () => {
    // Initialize selectedTestIds with all test IDs by default
    setSelectedTestIds(selectedTests.map((test) => test.test));
    setSearchQuery('');
    setShowPrintOptionsModal(true);
  };

  const handleTestSelection = (testId) => {
    setSelectedTestIds((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTestIds(selectedTests.map((test) => test.test));
  };

  const handleDeselectAll = () => {
    setSelectedTestIds([]);
  };

  const handleSelectRegistered = () => {
    const registeredTestIds = selectedTests
      .filter((test) => getCurrentStatus(test.statusHistory) === 'registered')
      .map((test) => test.test);
    setSelectedTestIds(registeredTestIds);
  };

  const handlePrintOption = () => {
    setShowPrintOptionsModal(false);
    if (selectedTestIds.length === 0) {
      alert('Please select at least one test to print.');
      return;
    }
    if (patientData?.paymentStatus !== 'paid') {
      setShowConfirmModal(true);
      return;
    }
    proceedWithPrint(selectedTestIds);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    const failures = [];
    for (const t of selectedTests) {
      const tid = t.test;
      const def = testDefinitions.find((td) => td._id === tid);
      if (!def || !Array.isArray(def.fields)) {
        console.warn('Skipping (no fields):', tid);
        continue;
      }

      const rows = formData?.results?.[tid] || [];

      const updateData = {
        results: rows
          .filter((r) => r?.fieldName?.trim()?.length)
          .map((r) => ({
            fieldName: r.fieldName,
            value: r.value,
            notes: r.notes,
            testId: tid, // 👈 important
          })),
        status: statusByTest[tid] ?? 'pending',
        notes: formData.notes ?? '',
      };

      try {
        await dispatch(
          updatePatientTestResults({
            patientTestId: id,
            testId: tid,
            updateData,
          })
        ).unwrap();
      } catch (err) {
        console.error('PATCH failed for', tid, err);
        failures.push({ tid, msg: err?.message });
      }
    }

    if (failures.length) {
      alert(
        'Some tests failed:\n' +
          failures
            .map((f) => `• ${f.tid}: ${f.msg || 'Unknown error'}`)
            .join('\n')
      );
      return;
    }

    alert('Test results updated successfully!');
    navigate(-1);
  };

  // Confirmation Modal Component for Payment
  const ConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-transform duration-300 ease-in-out scale-95 animate-scale-up">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Payment Pending
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            The payment is pending. Are you sure you want to print before
            payment?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
            >
              Confirm Print
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Print Options Modal Component with Test Selection
  const PrintOptionsModal = ({ isOpen, onClose, onPrint }) => {
    if (!isOpen) return null;

    const filteredTests = selectedTests.filter((test) =>
      test.testDetails.testName
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-transform duration-300 ease-in-out scale-95 animate-scale-up">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Select Tests to Print
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
          <div className="relative mb-4">
            <FiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium transition-colors"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors"
            >
              Deselect All
            </button>
            {/* <button
              onClick={handleSelectRegistered}
              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm font-medium transition-colors"
            >
              Registered Tests
            </button> */}
          </div>
          <div className="mb-6 max-h-64 overflow-y-auto pr-2">
            {filteredTests.length > 0 ? (
              filteredTests.map((test) => (
                <div key={test.test} className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id={`test-${test.test}`}
                    checked={selectedTestIds.includes(test.test)}
                    onChange={() => handleTestSelection(test.test)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label
                    htmlFor={`test-${test.test}`}
                    className="ml-3 text-sm text-gray-700 hover:text-gray-900 cursor-pointer"
                  >
                    {test.testDetails.testName}
                    <span className="ml-2 text-xs text-gray-400">
                      ({getCurrentStatus(test.statusHistory)})
                    </span>
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">
                No tests match your search.
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onPrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={selectedTestIds.length === 0}
            >
              Print Selected Tests
            </button>
          </div>
        </div>
      </div>
    );
  };
  // Save ONLY the current test's results

  // put this in UpdateReport.jsx (replace your saveCurrentTest)
  const saveCurrentTest = async (currentTestId) => {
    const def = testDefinitions.find((td) => td._id === currentTestId);
    if (!def || !Array.isArray(def.fields)) {
      console.warn('Skipping update: no fields for test', currentTestId);
      return;
    }

    const rows = formData?.results?.[currentTestId] || [];

    const updateData = {
      results: rows
        .filter((r) => r?.fieldName?.trim()?.length)
        .map((r) => ({
          fieldName: r.fieldName,
          value: r.value,
          notes: r.notes,
          testId: currentTestId, // 👈 important for backend filtering
        })),
      status: statusByTest[currentTestId] ?? 'pending',
      notes: formData.notes ?? '',
    };

    await dispatch(
      updatePatientTestResults({
        patientTestId: id,
        testId: currentTestId, // 👈 send a single id
        updateData,
      })
    ).unwrap();

    setLocalStatuses((prev) => ({
      ...prev,
      [currentTestId]: updateData.status,
    }));
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br bg-primary-50 bg-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  console.log('formData in updated', formData);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Error Loading Report
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!patientTestById || !patientData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br bg-primary-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <FiInfo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Report Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested report could not be loaded.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 transform hover:scale-105"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br bg-primary-50 p-4 md:p-6">
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          proceedWithPrint(selectedTestIds);
          setShowConfirmModal(false);
        }}
      />
      <PrintOptionsModal
        isOpen={showPrintOptionsModal}
        onClose={() => setShowPrintOptionsModal(false)}
        onPrint={handlePrintOption}
      />
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-primary-50 rounded-lg transition-all duration-200"
          >
            <FiChevronLeft className="mr-2 w-5 h-5" /> Back to Reports
          </button>

          <div className="flex items-center space-x-3">
            <div className="text-right mr-4">
              <p className="text-sm text-gray-500">Token Number</p>
              <p className="text-xl font-bold text-blue-600">
                #{patientData.tokenNumber}
              </p>
            </div>

            <button
              className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-md"
              onClick={handlePrint}
            >
              <FiPrinter className="mr-2 w-4 h-4" /> Save & Print
            </button>

            <button
              onClick={handleSubmit}
              className="flex items-center px-6 py-2 bg-gradient-to-r bg-primary-600 bg-primary-700 text-white rounded-lg hover:bg-primary-700 hover:bg-primary-800 transition-all duration-200 shadow-md transform hover:scale-105"
            >
              <FiSave className="mr-2 w-4 h-4" /> Save Results
            </button>
          </div>
        </div>

        {/* Main Report Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Lab Header */}
          <div className="bg-gradient-to-r bg-primary-600 bg-primary-200 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Al-Shahbaz Modern Diagnostic Center
                  </h1>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-opacity-20 rounded-full text-sm font-medium">
                      ISO Certified Laboratory
                    </span>
                    <span className="px-3 py-1 bg-opacity-20 rounded-full text-sm font-medium">
                      Quality Assured
                    </span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <div className="bg-opacity-20 rounded-lg p-4">
                    <p className="text-sm opacity-90">MR Number</p>
                    <p className="text-xl font-bold">
                      {patientData.mrNumber || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Info Section */}
          <PatientInfoSection
            patientData={patientData}
            selectedTests={selectedTests}
            testDefinitions={testDefinitions}
            activeTestIndex={activeTestIndex}
            setActiveTestIndex={setActiveTestIndex}
            localStatuses={localStatuses}
            statusByTest={statusByTest}
          />

          {/* Test Results Form */}
          {selectedTests.length > 0 && (
            <TestResultsForm
              selectedTests={selectedTests}
              testDefinitions={testDefinitions}
              activeTestIndex={activeTestIndex}
              setActiveTestIndex={setActiveTestIndex}
              formData={formData}
              setFormData={setFormData}
              initialValues={initialValues}
              patientData={patientData}
              statusByTest={statusByTest}
              setStatusByTest={setStatusByTest}
              onSave={async (_form, currentTestId) => {
                await saveCurrentTest(currentTestId);
              }}
            />
          )}
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="flex mt-5 items-center px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md transform hover:scale-105"
          >
            <FiSave className="mr-2 w-4 h-4" /> Save Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateReport;
