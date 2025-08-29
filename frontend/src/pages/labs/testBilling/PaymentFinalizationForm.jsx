import React, { useState } from "react";
import { FaTimes, FaMoneyBillWave } from "react-icons/fa";

const PaymentFinalizationForm = ({ bill, onClose, onConfirm, isProcessing }) => {
  const isRadiology = bill?.isRadiology || false;
  const totalAmount = isRadiology ? bill.totalAmount || 0 : bill.billingInfo?.totalAmount || 0;
  const totalPaid = isRadiology ? bill.totalPaid || 0 : bill.billingInfo?.totalPaid || 0;
  const remainingAmount = isRadiology ? bill.remainingAmount || 0 : bill.billingInfo?.remainingAmount || 0;
  const paymentStatus = isRadiology ? bill.paymentStatus : bill.billingInfo?.paymentStatus;
  const [customAmount, setCustomAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [error, setError] = useState(null);

  const isDisabled = paymentStatus === "paid" || remainingAmount <= 0 || !bill?._id;

  const handleConfirm = async () => {
    setError(null);
    if (customAmount) {
      const amount = parseFloat(customAmount);
      if (isNaN(amount) || amount <= 0) {
        setError("Invalid custom amount");
        return;
      }
      if (amount > remainingAmount) {
        setError("Custom amount cannot exceed remaining amount");
        return;
      }
      if (!refundReason) {
        setError("Refund reason is required for custom payment amounts");
        return;
      }
    }

    try {
      await onConfirm({
        billId: bill._id,
        isRadiology,
        customAmount: customAmount ? parseFloat(customAmount) : undefined,
        refundReason: customAmount ? refundReason : undefined,
      });
    } catch (err) {
      setError(err.message || "Failed to finalize payment");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Finalize Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Total Amount:</span>
            <span>Rs. {totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Amount Paid:</span>
            <span>Rs. {totalPaid < 0 ? 0 : totalPaid.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium text-gray-700">Remaining Amount:</span>
            <span className="text-teal-600 font-bold">
              Rs. {remainingAmount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="customAmount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Custom Payment Amount (Optional)
          </label>
          <input
            id="customAmount"
            name="customAmount"
            type="number"
            min="0"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            placeholder="Enter custom payment amount..."
            disabled={isDisabled}
          />
        </div>

        {customAmount && (
          <div className="mb-6">
            <label
              htmlFor="refundReason"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Refund Reason for Remaining Amount
            </label>
            <textarea
              id="refundReason"
              name="refundReason"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
              rows="3"
              placeholder="Enter reason for refunding remaining amount..."
              required
            />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {isDisabled
                  ? "This bill is already fully paid or invalid."
                  : customAmount
                  ? `Are you sure you want to finalize Rs. ${parseFloat(customAmount).toLocaleString()}? The remaining amount will be marked for refund.`
                  : `Are you sure you want to finalize this payment? This will mark the ${isRadiology ? "radiology procedure" : "bill"} as fully paid.`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium ${
              isDisabled || isProcessing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-teal-600 text-white hover:bg-teal-700 shadow-md"
            }`}
            disabled={isDisabled || isProcessing}
          >
            <FaMoneyBillWave />
            {isProcessing ? "Processing..." : customAmount ? "Confirm Custom Payment" : "Confirm Full Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFinalizationForm;