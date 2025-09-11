import React, { useState, useEffect } from 'react';
import { FaTimes, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  processRefund,
  processRadiologyRefund,
  fetchRadiologyBills,
  getAllTestBills,
} from '../../../features/labBill/LabBillSlice';

const RefundForm = ({ bill, onClose, onSubmit }) => {
  const dispatch = useDispatch();

  const [selectedTests, setSelectedTests] = useState([]);
  const [refundData, setRefundData] = useState({
    refundReason: '',
    customRefundAmount: '',
  });

  const [refundCalculation, setRefundCalculation] = useState({
    grossPaid: 0, // reconstructed gross
    netPaid: 0, // reported after prior refunds
    totalPreviousRefunds: 0,
    actualRefundable: 0,
  });

  const [errorMessage, setErrorMessage] = useState(null);

  const isRadiology = bill?.isRadiology || false;

  // ---------- helpers ----------
  const toNum = (v) => (Number.isFinite(+v) ? +v : 0);

  // Read "refunds" list from wherever it might live
  const getRefundedList = (b) => {
    if (Array.isArray(b?.refunded)) return b.refunded;
    if (Array.isArray(b?.billingInfo?.refunded)) return b.billingInfo.refunded;
    if (Array.isArray(b?.refunds)) return b.refunds; // legacy/alt key
    return [];
  };

  // Try multiple keys for the amount returned in each refund record
  const readRefundAmount = (r) =>
    toNum(
      r?.refundAmount ??
        r?.amount ??
        r?.value ??
        r?.paidBack ??
        r?.data?.refundAmount
    );

  const handleTestSelection = (test) => {
    setSelectedTests((prev) => {
      const isSelected = prev.some((t) => t.testId === test.testId);
      return isSelected
        ? prev.filter((t) => t.testId !== test.testId)
        : [...prev, test];
    });
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();

    if (!refundData.refundReason) {
      setErrorMessage('Please provide a refund reason');
      return;
    }

    if (selectedTests.length === 0) {
      setErrorMessage(
        `Please select ${
          isRadiology ? 'the radiology procedure' : 'tests'
        } to refund`
      );
      return;
    }

    const customAmount = parseFloat(refundData.customRefundAmount) || 0;

    if (customAmount > 0) {
      if (isNaN(customAmount) || customAmount <= 0) {
        setErrorMessage('Invalid refund amount');
        return;
      }
      if (customAmount > refundCalculation.actualRefundable) {
        setErrorMessage(
          'Refund amount cannot exceed the actual refundable amount'
        );
        return;
      }
    }

    try {
      const refundPayload = isRadiology
        ? {
            refundAmount: customAmount || refundCalculation.actualRefundable,
            refundReason: refundData.refundReason,
          }
        : {
            testIds: selectedTests.map((test) => test.testId),
            refundReason: refundData.refundReason,
            customRefundAmount: customAmount || undefined,
          };

      if (isRadiology) {
        await dispatch(
          processRadiologyRefund({
            patientId: bill._id, // keep as in your existing flow
            refundData: refundPayload,
          })
        ).unwrap();
        await dispatch(fetchRadiologyBills()).unwrap();
      } else {
        await dispatch(
          processRefund({
            patientId: bill._id,
            refundData: refundPayload,
          })
        ).unwrap();
        await dispatch(getAllTestBills()).unwrap();
      }

      onSubmit(refundPayload, isRadiology);
      onClose();
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to process refund');
    }
  };

  // ---------- corrected calculations (gross vs net) ----------
  useEffect(() => {
    if (!bill) return;

    const refundedList = getRefundedList(bill);

    const totalPreviousRefunds = refundedList.reduce(
      (sum, r) => sum + readRefundAmount(r),
      0
    );

    const lastRefund = refundedList.length
      ? refundedList[refundedList.length - 1]
      : null;

    // Reported "paid" in your UI can be gross or net depending on how backend updates it.
    // We treat it as "reported/net" and reconstruct gross to avoid double-subtraction.
    const reportedPaid =
      toNum(bill?.billingInfo?.totalPaid) ||
      toNum(bill?.totalPaid) ||
      toNum(lastRefund?.totalPaid) ||
      0;

    // Build a gross figure:
    // Radiology: advance + paidAfterReport is usually the true gross.
    const radiologyGross =
      toNum(bill?.advanceAmount) + toNum(bill?.paidAfterReport);

    // Lab: if you ever store an explicit gross, use it; else reconstruct gross = reported(net) + prior refunds.
    const labGross =
      toNum(bill?.billingInfo?.totalPaidGross) ||
      reportedPaid + totalPreviousRefunds;

    const grossPaid =
      (isRadiology ? radiologyGross : labGross) ||
      reportedPaid + totalPreviousRefunds;

    // Optional ceiling if backend provides a cap
    const refundableCap = toNum(bill?.refundableAmount) || Infinity;

    // Available left = grossPaid − totalPreviousRefunds
    const availableLeft = Math.max(0, grossPaid - totalPreviousRefunds);
    const maxRefundable = Math.min(availableLeft, refundableCap);

    const customAmount = toNum(refundData.customRefundAmount) || 0;

    const actualRefundable =
      customAmount > 0
        ? Math.max(0, Math.min(customAmount, maxRefundable))
        : maxRefundable;

    setRefundCalculation({
      grossPaid,
      netPaid: reportedPaid,
      totalPreviousRefunds,
      actualRefundable,
    });
  }, [bill, refundData.customRefundAmount]); // eslint-disable-line react-hooks/exhaustive-deps

  const isRefundable =
    refundCalculation.actualRefundable > 0 && selectedTests.length > 0;

  if (!bill) return null;

  // ---------- radiology template names ----------
  const getTemplateNames = () => {
    if (!bill?.templateName) return ['Radiology Procedure'];
    if (Array.isArray(bill.templateName)) {
      return bill.templateName.map(
        (name) => name?.replace?.('.html', '') || 'Radiology Procedure'
      );
    }
    return [bill.templateName?.replace?.('.html', '') || 'Radiology Procedure'];
  };

  const templateNames = getTemplateNames();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl min-h-[80vh] max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-teal-600 text-white">
          <div>
            <h3 className="text-2xl font-bold">Process Refund</h3>
            <p className="text-sm opacity-90">
              {isRadiology
                ? 'Select radiology procedure to refund'
                : 'Select tests to refund'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-2 rounded-full"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Patient/MR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">Patient</p>
              <p className="font-semibold text-gray-800">
                {bill?.patientDetails?.patient_Name ||
                  bill?.patientId?.name ||
                  bill?.patientName ||
                  'Unknown'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">MR Number</p>
              <p className="font-semibold text-gray-800">
                {bill?.patientDetails?.patient_MRNo ||
                  bill?.patientId?.mrNo ||
                  bill?.patientMRNO ||
                  'N/A'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleRefundSubmit}>
            {/* Selection table */}
            <div className="mb-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  {isRadiology
                    ? 'Select Procedure to Refund'
                    : 'Select Tests to Refund'}
                  <span className="text-gray-500 ml-1">
                    (Refund will be processed from total paid amount)
                  </span>
                </label>

                <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {isRadiology ? 'Procedure Name' : 'Test Name'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Advance
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Discount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remaining
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isRadiology ? (
                        // Radiology: one row representing the whole procedure set
                        <tr
                          key={bill._id}
                          className={`transition-colors ${
                            selectedTests.some((t) => t.testId === bill._id)
                              ? 'bg-teal-50'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedTests.some(
                                (t) => t.testId === bill._id
                              )}
                              onChange={() =>
                                handleTestSelection({
                                  testId: bill._id,
                                  name: templateNames.join(', '),
                                  price: bill.totalAmount || 0,
                                  advanceAmount: bill.advanceAmount || 0,
                                  discountAmount: bill.discount || 0,
                                  remainingAmount: bill.remainingAmount || 0,
                                  status: bill.paymentStatus || 'pending',
                                })
                              }
                              className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                              disabled={
                                bill?.paymentStatus === 'cancelled' ||
                                bill?.paymentStatus === 'refunded'
                              }
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {templateNames.join(', ')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            Rs. {(bill?.totalAmount || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            Rs. {(bill?.advanceAmount || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            Rs. {(bill?.discount || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            Rs. {(bill?.remainingAmount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ) : (
                        // Lab: multiple tests
                        (bill?.tests || []).map((test) => (
                          <tr
                            key={test.testId}
                            className={`transition-colors ${
                              selectedTests.some(
                                (t) => t.testId === test.testId
                              )
                                ? 'bg-teal-50'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedTests.some(
                                  (t) => t.testId === test.testId
                                )}
                                onChange={() => handleTestSelection(test)}
                                className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {test.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              Rs. {(test.price || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              Rs. {(test.advanceAmount || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              Rs. {(test.discountAmount || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              Rs. {(test.remainingAmount || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Calculation summary (updated to show Gross + Net) */}
            <div className="mb-6 space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h4 className="font-medium text-gray-700 flex items-center">
                <FaMoneyBillWave className="text-teal-600 mr-2" />
                Refund Calculation
              </h4>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total paid (gross):</span>
                  <span className="font-medium">
                    Rs. {(refundCalculation.grossPaid || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Total previously refunded:
                  </span>
                  <span className="font-medium">
                    Rs.{' '}
                    {(
                      refundCalculation.totalPreviousRefunds || 0
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Paid now (net after refunds):
                  </span>
                  <span className="font-medium">
                    Rs. {(refundCalculation.netPaid || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-700 font-semibold">
                    Actual refundable amount:
                  </span>
                  <span
                    className={`font-bold text-lg ${
                      (refundCalculation.actualRefundable || 0) > 0
                        ? 'text-teal-600'
                        : 'text-gray-500'
                    }`}
                  >
                    Rs.{' '}
                    {(refundCalculation.actualRefundable || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom amount */}
            <div className="mb-6">
              <label
                htmlFor="customRefundAmount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Custom Refund Amount (Optional)
              </label>
              <input
                id="customRefundAmount"
                name="customRefundAmount"
                type="number"
                min="0"
                value={refundData.customRefundAmount}
                onChange={(e) =>
                  setRefundData({
                    ...refundData,
                    customRefundAmount: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter custom refund amount..."
              />
            </div>

            {/* Reason */}
            <div className="mb-6">
              <label
                htmlFor="refundReason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Reason for Refund
              </label>
              <textarea
                id="refundReason"
                name="refundReason"
                value={refundData.refundReason}
                onChange={(e) =>
                  setRefundData({
                    ...refundData,
                    refundReason: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                rows="4"
                placeholder="Enter refund reason..."
                required
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium ${
                  selectedTests.length === 0
                    ? 'bg-red-200 text-red-600 cursor-not-allowed hover:bg-red-200'
                    : isRefundable
                    ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md'
                    : 'bg-red-200 text-red-600 hover:bg-red-500 hover:text-white'
                }`}
                disabled={
                  selectedTests.length === 0 || !refundData.refundReason
                }
              >
                {isRefundable ? (
                  <>
                    <FaMoneyBillWave />
                    Refund Rs.{' '}
                    {(refundCalculation.actualRefundable || 0).toLocaleString()}
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Mark as Cancelled
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RefundForm;
