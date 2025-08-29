// TestResultsForm.js
import React from "react";
import {
  FiClipboard,
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
  FiHelpCircle,
} from "react-icons/fi";
import {
  getNormalRange,
  isValueNormal,
  formatNormalRange,
  getRangeLabel,
} from "../../../utils/rangeUtils";

const TestResultsForm = ({
  selectedTests,
  testDefinitions,
  activeTestIndex,
  formData,
  setFormData,
  initialValues,
  patientData,
}) => {

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


  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FiClipboard className="w-6 h-6 text-blue-600 mr-3" />
          Test Results:{" "}
          {selectedTests[activeTestIndex]?.testDetails?.testName}
        </h2>
        
        {/* Patient info summary */}
        {patientData && (
          <div className="text-sm text-gray-600 bg-blue-50 rounded-lg px-4 py-2">
            Patient: {patientData.name} | {patientData.gender} | {patientData.age} years
            {patientData.isPregnant && " | Pregnant"}
          </div>
        )}
      </div>

      {/* Results Fields */}
      <div className="space-y-6">
        {formData.results[selectedTests[activeTestIndex]?.test]?.map(
          (result, index) => {
            const isNormal = isValueNormal(
              result.value,
              result.normalRange,
              patientData
            );

            return (
              <div
                key={index}
                className="p-2 shadow-md"
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
                        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 
                          
                        `}
                        placeholder="Enter value"
                        required
                        // disabled={
                        //   !!initialValues[
                        //     selectedTests[activeTestIndex].test
                        //   ]?.[index]?.value
                        // }
                      />
                      {/* {result.value && (
                        <div className="absolute right-2 top-2">
                          <FiLock className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      {isNormal !== null && !result.value && (
                        <div className="absolute right-2 top-2">
                          {isNormal ? (
                            <FiCheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <FiAlertCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      )} */}
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
                      placeholder="Unit"
                      disabled
                      required
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Normal Range
                      <FiHelpCircle 
                        className="ml-1 w-4 h-4 text-gray-400" 
                        title="Based on patient data and available ranges"
                      />
                    </label>
                    <div 
                      className="text-sm text-gray-600 bg-white rounded-lg px-3 py-2 border min-h-[42px]"
                      title={formatNormalRange(result.normalRange, patientData)}
                    >
                      <div className="font-medium text-xs text-blue-600">
                        {getRangeLabel(result.normalRange, patientData)}
                      </div>
                      {formatNormalRange(result.normalRange, patientData).split(" | ")[0]}
                    </div>
                  </div>
                  
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="text-sm font-medium bg-white rounded-lg px-3 py-2 border">
                      {isNormal === true ? (
                        <span className="text-green-600">✓ Normal</span>
                      ) : isNormal === false ? (
                        <span className="text-red-600">✗ Abnormal</span>
                      ) : (
                        <span className="text-gray-500">Not evaluated</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Additional range information */}
                {result.normalRange && Object.keys(result.normalRange).length > 1 && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-500">
                    <div className="font-medium">Available ranges:</div>
                    {formatNormalRange(result.normalRange, patientData)}
                  </div>
                )}
                
             
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

        <div className="bg-white rounded-xl p-6 shadow-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Performed By
          </label>
          <input
            type="text"
            name="performedBy"
            value={formData.performedBy}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter technician name"
          />
        </div>

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
          />
        </div>
      </div>
    </div>
  );
};

export default TestResultsForm;