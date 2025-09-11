// TestResultsForm.js
import React, { useEffect, useRef } from 'react';
import { FiClipboard, FiHelpCircle } from 'react-icons/fi';
import {
  isValueNormal,
  formatNormalRange,
  getRangeLabel,
} from '../../../utils/rangeUtils';
import { fetchPatientTestById } from '../../../features/patientTest/patientTestSlice';
import { useDispatch, useSelector } from 'react-redux';

const TestResultsForm = ({
  selectedTests,
  testDefinitions, // optional: used if you want to scaffold fields
  activeTestIndex,
  setActiveTestIndex, // <-- parent passes this now
  formData,
  setFormData,
  initialValues,
  patientData,
  statusByTest,
  setStatusByTest,
  onSave = async () => {}, // <-- parent passes this now
}) => {
  const currentTestId = selectedTests?.[activeTestIndex]?.test;
  const resultRows = formData?.results?.[currentTestId] || [];

  /** ---------- Change handlers ---------- */
  const handleChange = (e, index, testId) => {
    const { name, value } = e.target;

    if (name.startsWith('results.')) {
      const [_, fieldIndex, subField] = name.split('.');
      setFormData((prev) => {
        const updatedResults = [...(prev.results?.[testId] || [])];
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
      if (subField === 'value' && value.trim() !== '') {
        setStatusByTest((prev) => ({
          ...prev,
          [testId]: 'completed',
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const patientDataRecord = useSelector(
    (state) => state.patientTest.patientTestById
  );

  /** ---------- Keyboard navigation refs ---------- */
  const valueInputRefs = useRef([]);
  const performedByRef = useRef(null);
  const statusRef = useRef(null);
  const overallReportRef = useRef(null);

  const handleResultKeyDown = (e, i) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = valueInputRefs.current?.[i + 1];
      if (next && typeof next.focus === 'function') {
        next.focus();
      } else if (performedByRef.current) {
        performedByRef.current.focus();
      }
    }
  };

  const handleSimpleEnterNext = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current && typeof nextRef.current.focus === 'function') {
        nextRef.current.focus();
      }
    }
  };

  const handleTextareaEnterNext = (e, nextRef) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (nextRef?.current && typeof nextRef.current.focus === 'function') {
        nextRef.current.focus();
      }
    }
  };
  const total = selectedTests?.length ?? 0;
  const isLast = (activeTestIndex ?? 0) >= total - 1;

  /** ---------- Auto-focus first result on test switch ---------- */
  useEffect(() => {
    valueInputRefs.current = Array(resultRows.length);
    const id = setTimeout(() => {
      const first = valueInputRefs.current?.[0];
      if (first && typeof first.focus === 'function') first.focus();
    }, 0);
    return () => clearTimeout(id);
  }, [currentTestId, resultRows.length]);

  /** ---------- Save handlers ---------- */
  const handleSave = async () => {
    await onSave(formData, currentTestId);
  };

  /** ---------- Navigation helpers ---------- */
  const goToIndex = (index) => {
    if (index >= 0 && index < (selectedTests?.length ?? 0)) {
      setActiveTestIndex?.(index);
    }
  };

  /** ---------- Save + Navigate ---------- */
  const handleSaveAndNext = async () => {
    await handleSave();
    goToIndex((activeTestIndex ?? 0) + 1);
  };

  const handleSaveAndPrev = async () => {
    await handleSave();
    goToIndex((activeTestIndex ?? 0) - 1);
  };

  return (
    <div className="p-4 m-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FiClipboard className="w-6 h-6 text-blue-600 mr-3" />
          Test Results
        </h2>

        {/* Patient info summary */}
        {patientData && (
          <div className="text-sm text-gray-600 bg-blue-50 rounded-lg px-4 py-2">
            Patient: {patientData.patientName || patientData.name || 'N/A'} |{' '}
            {patientData.gender || 'N/A'} | {patientData.age || 'N/A'} years
            {patientData.isPregnant && ' | Pregnant'}
          </div>
        )}
      </div>
      <div className="bg-gray-50 shadow-md">
        <div className="font-medium text-xl p-4 border-b border-gray-300">
          <h1>{selectedTests?.[activeTestIndex]?.testDetails?.testName}</h1>
        </div>

        <div className="p-4">
          {/* Results Fields */}
          <div className="space-y-6">
            {resultRows.map((result, index) => {
              const isNormal = isValueNormal(
                result.value,
                result.normalRange,
                patientData
              );

              return (
                <div key={index} className="p-2">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field Name
                      </label>
                      <input
                        type="text"
                        name={`results.${index}.fieldName`}
                        value={result.fieldName}
                        onChange={(e) => handleChange(e, index, currentTestId)}
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
                            handleChange(e, index, currentTestId)
                          }
                          onKeyDown={(e) => handleResultKeyDown(e, index)}
                          ref={(el) => (valueInputRefs.current[index] = el)}
                          enterKeyHint="next"
                          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                          placeholder="Enter value"
                          required
                        />
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
                        onChange={(e) => handleChange(e, index, currentTestId)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Unit"
                        disabled
                        required
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Normal Range
                        <FiHelpCircle
                          className="ml-1 w-4 h-4 text-gray-400"
                          title="Based on patient data and available ranges"
                        />
                      </label>
                      <div
                        className="text-sm text-gray-600 bg-white rounded-lg px-3 py-2 border min-h-[42px]"
                        title={formatNormalRange(
                          result.normalRange,
                          patientData
                        )}
                      >
                        <div className="font-medium text-xs text-blue-600">
                          {getRangeLabel(result.normalRange, patientData)}
                        </div>
                        {
                          formatNormalRange(
                            result.normalRange,
                            patientData
                          ).split(' | ')[0]
                        }
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
                  {result.normalRange &&
                    Object.keys(result.normalRange || {}).length > 1 && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-500">
                        <div className="font-medium">Available ranges:</div>
                        {formatNormalRange(result.normalRange, patientData)}
                      </div>
                    )}
                </div>
              );
            })}
          </div>

          {/* Status and Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="rounded-xl p-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Performed By
              </label>
              <input
                type="text"
                name="performedBy"
                value={formData.performedBy || ''}
                onChange={handleChange}
                ref={performedByRef}
                onKeyDown={(e) => handleSimpleEnterNext(e, statusRef)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter technician name"
              />
            </div>

            <div className="rounded-xl p-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Status
              </label>
              <select
                name="status"
                value={statusByTest?.[currentTestId] || 'registered'}
                onChange={(e) =>
                  setStatusByTest((prev) => ({
                    ...prev,
                    [currentTestId]: e.target.value,
                  }))
                }
                ref={statusRef}
                onKeyDown={(e) => handleSimpleEnterNext(e, overallReportRef)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="pending">Registered</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="verified">Verified</option>
                <option value="cancelled">Cancelled</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="rounded-xl p-3 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Test Report
              </label>
              <textarea
                rows={3}
                name="notes" // ← was "overallReport"
                value={formData.notes || ''} // ← was formData.overallReport
                onChange={handleChange}
                ref={overallReportRef}
                onKeyDown={(e) => handleTextareaEnterNext(e, null)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Overall interpretation / impression (Shift+Enter for newline)"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveAndPrev}
              disabled={activeTestIndex <= 0}
              className="bg-primary-600 py-3 px-4 rounded-md text-white font-medium hover:bg-primary-700"
            >
              Back
            </button>

            {!isLast && (
              <button
                type="button"
                onClick={handleSaveAndNext}
                className="bg-gray-800 py-3 px-4 rounded-md text-white font-medium hover:bg-black"
                title="Save this test and move to the next one"
              >
                Save & Next
              </button>
            )}
          </div>
        </div>
      </div>{' '}
    </div>
  );
};

export default TestResultsForm;
