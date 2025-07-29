import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTestById, selectSelectedTest, selectGetByIdLoading, selectGetByIdError } from '../../../features/testManagment/testSlice';
import PropTypes from 'prop-types';

const TestsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedTest = useSelector(selectSelectedTest);
  const getByIdLoading = useSelector(selectGetByIdLoading);
  const getByIdError = useSelector(selectGetByIdError);

  React.useEffect(() => {
    if (id) {
      dispatch(getTestById(id));
    }
  }, [id, dispatch]);

  // Helper function to format range values
  const formatRangeValue = (value) => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'number') {
      return value % 1 === 0 ? value.toString() : value.toFixed(2);
    }
    return value.toString();
  };

  // Helper to convert Map to object if needed
  const convertRangesToObject = (ranges) => {
    if (!ranges) return {};
    return ranges instanceof Map ? Object.fromEntries(ranges) : ranges;
  };

  // Helper to format reference range text
  const getReferenceRangeText = (range) => {
    if (!range) return 'N/A';
    const ranges = convertRangesToObject(range);
    return Object.entries(ranges)
      .map(([label, values]) => {
        const rangeText = `${formatRangeValue(values.min)} - ${formatRangeValue(values.max)}`;
        return `${label}: ${rangeText} ${values.unit || ''}`.trim();
      })
      .join(' | ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50 to-teal-50">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl shadow-lg border border-slate-200 transition-all duration-200 hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back to Tests</span>
              </button>
              <div className="h-6 w-px bg-slate-300"></div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-600 to-teal-600 bg-clip-text text-transparent">
                  Test Details
                </h1>
                <p className="text-slate-600 text-sm">View comprehensive test information</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {getByIdLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-slate-600 text-lg">Loading test details...</p>
            </div>
          </div>
        ) : getByIdError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Test</h3>
            <p className="text-red-600">{getByIdError}</p>
          </div>
        ) : selectedTest ? (
          <div className="space-y-6">
            {/* Test Header Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-teal-600 p-6 text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{selectedTest.testName}</h2>
                    <div className="flex items-center space-x-4 text-primary-100">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20">
                        Code: {selectedTest.testCode}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20">
                        Rs {selectedTest.testPrice}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedTest.requiresFasting ? 'bg-orange-500/20 text-orange-100' : 'bg-green-500/20 text-green-100'
                        }`}>
                        {selectedTest.requiresFasting ? 'Fasting Required' : 'No Fasting'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Information Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Description</label>
                    <p className="text-slate-800 mt-1">{selectedTest.description || 'No description provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Instructions</label>
                    <p className="text-slate-800 mt-1">{selectedTest.instructions || 'No instructions provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Department</label>
                    <p className="text-slate-800 mt-1">{selectedTest.testDept || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Created Date</label>
                    <p className="text-slate-800 mt-1">
                      {selectedTest.createdAt ? new Date(selectedTest.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Report Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-teal-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Report Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Report Delivery Time</label>
                    <div className="mt-1">
                      {(() => {
                        const val = selectedTest.reportDeliveryTime;
                        if (!val) return <span className="text-slate-500">Not specified</span>;
                        const str = val.toLowerCase();
                        const dateMatch = str.match(/^(\d{4}-\d{2}-\d{2})/);
                        let dateObj = null;
                        if (dateMatch) {
                          dateObj = new Date(val);
                          if (!isNaN(dateObj.getTime())) {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const diffTime = dateObj.getTime() - today.getTime();
                            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                            let rel = '';
                            if (diffDays === 0) rel = '(today)';
                            else if (diffDays > 0) rel = `(in ${diffDays} day${diffDays !== 1 ? 's' : ''})`;
                            else rel = `(${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago)`;
                            return (
                              <div className="flex items-center space-x-2">
                                <span className="text-slate-800">{dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                <span className="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-1 rounded-full">{rel}</span>
                              </div>
                            );
                          }
                        }
                        if (str.includes('hour')) {
                          const match = str.match(/(\d+)/);
                          if (match) {
                            const hours = parseInt(match[1], 10);
                            if (!isNaN(hours)) {
                              const days = hours / 24;
                              const daysDisplay = Number.isInteger(days) ? days : days.toFixed(2);
                              return (
                                <div className="flex items-center space-x-2">
                                  <span className="text-slate-800">{val}</span>
                                  <span className="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-1 rounded-full">({daysDisplay} day{daysDisplay !== '1' ? 's' : ''})</span>
                                </div>
                              );
                            }
                          }
                          return <span className="text-slate-800">{val}</span>;
                        } else if (str.includes('day')) {
                          return <span className="text-slate-800">{val}</span>;
                        } else {
                          return <span className="text-slate-800">{val}</span>;
                        }
                      })()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Fasting Requirement</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedTest.requiresFasting
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                        }`}>
                        {selectedTest.requiresFasting ? 'Yes - Fasting Required' : 'No - No Fasting Required'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Fields Section - Table View */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-teal-600 p-6 text-white">
                <h3 className="text-xl font-bold flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Test Fields ({selectedTest.fields?.length || 0})
                </h3>
                <p className="text-primary-100 mt-1">Parameters and reference ranges for this test</p>
              </div>
              <div className="flex items-center ml-10 gap-30">
                <h1 className="font-bold p-4 bg-emerald-50 text-gray-900">{selectedTest.testName}</h1>
                <h1 className="font-bold  p-4 bg-emerald-50 text-gray-900">{selectedTest.testDept || 'N/A'}</h1>
              </div>

              <div className="p-6 overflow-x-auto">
                {selectedTest.fields && selectedTest.fields.length > 0 ? (
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>

                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Field Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Result
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reference Range
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedTest.fields.map((field, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {field.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                0
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {field.unit || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {getReferenceRangeText(field.normalRange)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">No Test Fields</h3>
                    <p className="text-slate-500">No fields have been defined for this test yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

TestsDetail.propTypes = {
  selectedTest: PropTypes.shape({
    testName: PropTypes.string.isRequired,
    testCode: PropTypes.string.isRequired,
    testPrice: PropTypes.number.isRequired,
    testDept: PropTypes.string,
    description: PropTypes.string,
    instructions: PropTypes.string,
    requiresFasting: PropTypes.bool,
    reportDeliveryTime: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        unit: PropTypes.string,
        normalRange: PropTypes.objectOf(
          PropTypes.shape({
            min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            unit: PropTypes.string,
            description: PropTypes.string
          })
        ),
        commonUnits: PropTypes.arrayOf(PropTypes.string),
        commonLabels: PropTypes.arrayOf(PropTypes.string)
      })
    )
  })
};

export default TestsDetail;