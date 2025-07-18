import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ReactDOMServer from "react-dom/server";
import PrintTestReport from "./PrintTestReport";
import {
  FiChevronLeft,
  FiSave,
  FiPrinter,
  FiPlus,
  FiTrash2,
  FiUser,
  FiCalendar,
  FiClipboard,
  FiInfo,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { fetchPatientTestById } from "../../../features/patientTest/patientTestSlice";
import { updatePatientTestResults } from "../../../features/testResult/TestResultSlice";

const UpdateReport = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { patientTestById, status, error } = useSelector(
    (state) => state.patientTest
  );
  const [formData, setFormData] = useState({
    results: {},
    status: "completed",
    notes: "",
    performedBy: "",
  });

  const [activeTestIndex, setActiveTestIndex] = useState(0);

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

  // Get all selected tests
  const selectedTests = patientTestById?.patientTest?.selectedTests || [];

  // Get all test definitions
  const testDefinitions = patientTestById?.testDefinitions || [];

  const preparePrintData = () => {
    if (!patientTestById) return null;

    const patientData = {
      printData: patientTestById,
    };

    const testResults = selectedTests.map((test) => {
      const testDefinition = testDefinitions.find((td) => td._id === test.test);
      const currentResults = formData.results[test.test] || [];

      return {
        testName: test.testDetails.testName,
        fields: currentResults.map((result) => ({
          fieldName: result.fieldName,
          value: result.value,
          unit: result.unit,
          normalRange: result.normalRange
            ? {
                min: result.normalRange.min,
                max: result.normalRange.max,
              }
            : null,
          notes: result.notes,
        })),
        notes: formData.notes,
      };
    });

    return { patientData, testResults };
  };

  const handlePrint = () => {
    const printData = preparePrintData();
    if (!printData) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups for printing");
      return;
    }

    // console.log("the updateprint from is: ",printData )
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
  };

  // Initialize form data with test fields for all tests
useEffect(() => {
  if (selectedTests.length > 0 && testDefinitions.length > 0) {
    const initialResults = {};
    selectedTests.forEach((test) => {
      const testDefinition = testDefinitions.find(
        (td) => td._id === test.test
      );
      const testFields = testDefinition?.fields || [];

      initialResults[test.test] = testFields.map((field) => ({
        fieldName: field.name,
        value: "",
        notes: "",
        unit: field.unit || "",
        normalRange: field.normalRange || null,
        fieldId: field._id,
      }));
    });

    setFormData((prev) => ({
      ...prev,
      results: initialResults,
    }));
  }
}, [selectedTests, testDefinitions]);

  useEffect(() => {
    dispatch(fetchPatientTestById(id));
  }, [dispatch, id]);

  const getNormalRangeForGender = (normalRange) => {
    if (!normalRange || !patientData?.gender) return null;

    const gender = patientData.gender.toLowerCase();
    return normalRange[gender] || null;
  };

  const isValueNormal = (value, normalRange) => {
    if (!normalRange || !value) return null;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;

    const genderRange = getNormalRangeForGender(normalRange);
    if (!genderRange) return null;

    return numValue >= genderRange.min && numValue <= genderRange.max;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "registered":
        return "bg-primary-100 text-blue-800";
      case "in_progress":
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "verified":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

const handleChange = (e, index, testId) => {
  const { name, value } = e.target;

  if (name.startsWith("results.")) {
    const [_, fieldIndex, subField] = name.split(".");
    setFormData((prev) => {
      const updatedResults = [...(prev.results[testId] || [])];
      updatedResults[fieldIndex] = {
        ...updatedResults[fieldIndex],
        [subField]: value,
      };

      return {
        ...prev,
        results: {
          ...prev.results,
          [testId]: updatedResults,
        },
      };
    });
  } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};

const addResultField = (testId) => {
  setFormData((prev) => ({
    ...prev,
    results: {
      ...prev.results,
      [testId]: [
        ...(prev.results[testId] || []),
        {
          fieldName: "",
          value: "",
          notes: "",
          unit: "",
          normalRange: null,
          fieldId: null, // or generate a unique ID if needed
        },
      ],
    },
  }));
};

const removeResultField = (index, testId) => {
  setFormData((prev) => ({
    ...prev,
    results: {
      ...prev.results,
      [testId]: (prev.results[testId] || []).filter((_, i) => i !== index),
    },
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // Transform the form data to match the expected structure
    const requestData = {
      results: Object.values(formData.results).flatMap((testResult) =>
        testResult.map((field) => ({
          fieldName: field.fieldName,
          value: field.value,
          notes: field.notes,
        }))
      ),
      status: formData.status,
      notes: formData.notes, // Overall report notes
      performedBy: formData.performedBy,
    };
const testId = Array.isArray(selectedTests)
  ? selectedTests.map(test => test.test)
  : selectedTests?.test;
    await dispatch(
      updatePatientTestResults({
        patientTestId: id,
        testId: testId,
        updateData: requestData,
      })
    ).unwrap();

    alert("Test results updated successfully!");
    navigate(-1);
  } catch (error) {
    alert(`Failed to update results: ${error.message || "Unknown error"}`);
  }
};

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br bg-primary-50 bg-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br bg-primary-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
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
              <FiPrinter className="mr-2 w-4 h-4" /> Print
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
          <div className="bg-gradient-to-r bg-primary-600  bg-primary-200 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Al-Shahbaz Modern Diagnostic Center
                  </h1>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1  bg-opacity-20 rounded-full text-sm font-medium">
                      ISO Certified Laboratory
                    </span>
                    <span className="px-3 py-1  bg-opacity-20 rounded-full text-sm font-medium">
                      Quality Assured
                    </span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <div className=" bg-opacity-20 rounded-lg p-4">
                    <p className="text-sm opacity-90">MR Number</p>
                    <p className="text-xl font-bold">
                      {patientData.mrNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="p-8  bg-primary-50">
            <div className="flex items-center mb-6">
              <FiUser className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-800">
                Patient & Test Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Patient Details Card */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FiUser className="w-4 h-4 mr-2 text-blue-600" />
                  Patient Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Name</span>
                    <p className="font-medium text-gray-800">
                      {patientData.patientName}
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <span className="text-sm text-gray-500">Gender</span>
                      <p className="font-medium text-gray-800">
                        {patientData.gender}
                      </p>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-gray-500">Age</span>
                      <p className="font-medium text-gray-800">
                        {patientData.age}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">CNIC</span>
                    <p className="font-medium text-gray-800">
                      {patientData.cnic}
                    </p>
                  </div>
                </div>
              </div>

              {/* Test Navigation Card */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FiClipboard className="w-4 h-4 mr-2 text-green-600" />
                  Test Selection
                </h3>
                <div className="space-y-3">
                  {selectedTests.map((test, index) => {
                    const testDefinition = testDefinitions.find(
                      (td) => td._id === test.test
                    );
                    return (
                      <button
                        key={test.test}
                        onClick={() => setActiveTestIndex(index)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                          activeTestIndex === index
                            ? "bg-blue-100 border border-blue-300"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">
                            {test.testDetails.testName}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              activeTestIndex === index
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {test.testDetails.reportStatus
                              ?.replace("_", " ")
                              .toUpperCase() || "PENDING"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {testDefinition?.requiresFasting && (
                            <span className="text-orange-500 flex items-center">
                              <FiAlertCircle className="mr-1" /> Fasting
                              Required
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status & Timing Card */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FiCalendar className="w-4 h-4 mr-2 text-purple-600" />
                  Status & Timing
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Test Date</span>
                    <p className="font-medium text-gray-800">
                      {new Date(patientData.testDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Current Status
                    </span>
                    <div className="flex items-center mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedTests[activeTestIndex]?.testDetails
                            ?.reportStatus
                        )}`}
                      >
                        {selectedTests[
                          activeTestIndex
                        ]?.testDetails?.reportStatus
                          ?.replace("_", " ")
                          .toUpperCase() || "PENDING"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Delivery Time</span>
                    <p className="font-medium text-gray-800">
                      {testDefinitions.find(
                        (td) => td._id === selectedTests[activeTestIndex]?.test
                      )?.reportDeliveryTime || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Payment Status
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        patientData.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {patientData.paymentStatus?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Results Form */}
          {selectedTests.length > 0 && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiClipboard className="w-6 h-6 text-blue-600 mr-3" />
                  Test Results:{" "}
                  {selectedTests[activeTestIndex]?.testDetails?.testName}
                </h2>
              </div>

              {/* Results Fields */}
              <div className="space-y-6">
                {formData.results[selectedTests[activeTestIndex]?.test]?.map(
                  (result, index) => {
                    const normalRange = getNormalRangeForGender(
                      result.normalRange
                    );
                    const isNormal = isValueNormal(
                      result.value,
                      result.normalRange
                    );

                    return (
                      <div
                        key={index}
                        className="bg-gradient-to-r bg-primary-50 rounded-xl p-6 shadow-md"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Field Name
                            </label>
                            <input
                              type="text"
                              name={`results.${index}.fieldName`}
                              value={result.fieldName}
                              onChange={(e) =>
                                handleChange(
                                  e,
                                  index,
                                  selectedTests[activeTestIndex].test
                                )
                              }
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              placeholder="e.g. Hemoglobin"
                              disabled
                              required
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Result
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                name={`results.${index}.value`}
                                value={result.value}
                                onChange={(e) =>
                                  handleChange(
                                    e,
                                    index,
                                    selectedTests[activeTestIndex].test
                                  )
                                }
                                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                                  isNormal === true
                                    ? "border-green-300 bg-green-50"
                                    : isNormal === false
                                    ? "border-red-300 bg-red-50"
                                    : "border-gray-300"
                                }`}
                                placeholder="12.5"
                                required
                              />
                              {isNormal !== null && (
                                <div className="absolute right-2 top-2">
                                  {isNormal ? (
                                    <FiCheckCircle className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <FiAlertCircle className="w-5 h-5 text-red-500" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Unit
                            </label>
                            <input
                              type="text"
                              name={`results.${index}.unit`}
                              value={result.unit}
                              onChange={(e) =>
                                handleChange(
                                  e,
                                  index,
                                  selectedTests[activeTestIndex].test
                                )
                              }
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              placeholder="g/dL"
                              disabled
                              required
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Normal Range
                            </label>
                            <div className="text-sm text-gray-600 bg-white rounded-lg px-3 py-2 border">
                              {normalRange ? (
                                <span className="font-medium text-blue-600">
                                  {normalRange.min} - {normalRange.max}
                                </span>
                              ) : (
                                <span className="text-gray-400">
                                  Not defined
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                          </label>
                          <textarea
                            rows={3}
                            name={`results.${index}.notes`}
                            value={result.notes}
                            onChange={(e) =>
                              handleChange(
                                e,
                                index,
                                selectedTests[activeTestIndex].test
                              )
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Optional notes"
                            required
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Status and Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="verified">Verified</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                {/* <div className="bg-white rounded-xl p-6 shadow-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Performed By
                  </label>
                  <input
                    type="text"
                    name="performedBy"
                    value={formData.performedBy}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Technician name"
                    required
                  />
                </div> */}
                {/* Add Overall Notes Field */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Report Notes
                  </label>
                  <textarea
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter overall report notes"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer with Signatures */}
          <div className="bg-primary-100 p-8 border-t">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Approval Signatures
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 text-center shadow-md">
                <div className="h-20 border-b-2 border-gray-300 mb-4 flex items-end justify-center">
                  <span className="text-gray-400 text-sm pb-2">
                    Digital Signature
                  </span>
                </div>
                <p className="font-semibold text-gray-800">Pathologist</p>
                <p className="text-sm text-gray-600">Dr. Rabia Sadaf</p>
                <p className="text-xs text-gray-500 mt-1">PMDC: 12345-P</p>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-md">
                <div className="h-20 border-b-2 border-gray-300 mb-4 flex items-end justify-center">
                  <span className="text-gray-400 text-sm pb-2">
                    Digital Signature
                  </span>
                </div>
                <p className="font-semibold text-gray-800">Lab Technician</p>
                <p className="text-sm text-gray-600">
                  {formData.performedBy || "Not specified"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  License: LT-2024-001
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-md">
                <div className="h-20 border-b-2 border-gray-300 mb-4 flex items-end justify-center">
                  <span className="text-gray-400 text-sm pb-2">
                    Quality Seal
                  </span>
                </div>
                <p className="font-semibold text-gray-800">Quality Control</p>
                <p className="text-sm text-gray-600">Al-Shahbaz Diagnostics</p>
                <p className="text-xs text-gray-500 mt-1">ISO 15189:2012</p>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                This report has been electronically generated and is valid
                without signature.
              </p>
              <p className="mt-1">
                For queries, contact: +92-51-1234567 |
                info@alshahbazdiagnostics.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateReport;
