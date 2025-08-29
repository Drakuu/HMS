import React from 'react';
import { toast } from 'react-toastify';

const TestInformationForm = ({
  testList,
  selectedTestId,
  setSelectedTestId,
  testRows,
  handleTestAdd,
  handleTestRowChange,
  handleRemoveRow,
  totalAmount,
  overallRemaining
}) => {
  // console.log("📋 Test Information Form Data row:", testRows)
  // Safely normalize testList to always be an array
  const normalizedTestList = Array.isArray(testList) ? testList : [];
  const isLoadingTests = testList === undefined; // Only show loading when truly undefined
  const noTestsAvailable = Array.isArray(testList) && testList.length === 0;

  const handleAddTestWithValidation = () => {
    try {
      if (!selectedTestId) {
        toast.error("Please select a test to add");
        return;
      }

      const selectedTest = normalizedTestList.find(
        (t) => t?._id === selectedTestId
      );
      if (!selectedTest) {
        toast.error("Selected test not found");
        return;
      }

      const testExists = testRows.some((row) => row.testId === selectedTestId);
      if (testExists) {
        toast.warning("This test is already added");
        return;
      }

      handleTestAdd();
    } catch (error) {
      console.error("Error adding test:", error);
      toast.error("Failed to add test. Please try again.");
    }
  };

  const handleRowChangeWithValidation = (i, field, value) => {
    try {
      // Additional validation for numeric fields
      if (["amount", "discount", "paid"].includes(field)) {
        const numericValue = Number(value);

        if (isNaN(numericValue)) {
          toast.error("Please enter a valid number");
          return;
        }

        if (numericValue < 0) {
          toast.error("Value cannot be negative");
          return;
        }
      }

      // Additional date validation
      if (["sampleDate", "reportDate"].includes(field)) {
        if (value && new Date(value) < new Date().setHours(0, 0, 0, 0)) {
          toast.warning("Date cannot be in the past");
          return;
        }
      }

      // Proceed with change if validations pass
      handleTestRowChange(i, field, value);
    } catch (error) {
      console.error("Error updating test row:", error);
      toast.error("Failed to update test. Please try again.");
    }
  };

  const handleRemoveRowWithConfirmation = (i) => {
    try {
      // Confirm before removal
      if (window.confirm("Are you sure you want to remove this test?")) {
        handleRemoveRow(i);
        toast.success("Test removed successfully");
      }
    } catch (error) {
      console.error("Error removing test:", error);
      toast.error("Failed to remove test. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <select
          value={selectedTestId}
          onChange={(e) => setSelectedTestId(e.target.value)}
          className="border p-2 rounded flex-1"
          disabled={isLoadingTests}
        >
          <option value="">Select a Test</option>
          {isLoadingTests ? (
  <option value="" disabled>
    Loading tests...
  </option>
) : noTestsAvailable ? (
  <option value="" disabled>
    Not available. First create the test.
  </option>
) : (
  normalizedTestList
    .filter(test => !testRows.some(row => row.testId === test._id))
    .map(test =>
      test && test._id && (
        <option key={test._id} value={test._id}>
          {test.testName || "Unnamed Test"} - Rs {test.testPrice || 0}
        </option>
      )
    )
)}

        </select>

        <button
          type="button"
          className={`px-4 py-2 text-white rounded ${
            !selectedTestId || isLoadingTests
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary-700 hover:bg-primary-800"
          }`}
          onClick={handleAddTestWithValidation}
          disabled={!selectedTestId || isLoadingTests}
        >
          {isLoadingTests ? "Loading..." : "Add"}
        </button>
      </div>

      {testRows.length > 0 ? (
        <div className="w-full">
          <div className="overflow-x-auto min-w-full">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  {["#", "Test", "Sample Date", "Report Date", "Amount", "Discount", "Final", "Paid", "Remaining", "Action"].map(h =>
                    <th key={h} className="px-3 py-2 text-left">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {testRows.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 w-10">{r.quantity}</td>
                    <td className="border px-3 py-2 min-w-[150px]">{r.testName}</td>
                    <td className="border px-3 py-2 min-w-[120px]">
                      <input
                        type="date"
                        value={r.sampleDate}
                        onChange={e => handleRowChangeWithValidation(i, 'sampleDate', e.target.value)}
                        className="border p-1 rounded w-full"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </td>
                    <td className="border px-3 py-2 min-w-[120px]">
                      <input
                        type="date"
                        value={r.reportDate}
                        onChange={e => handleRowChangeWithValidation(i, 'reportDate', e.target.value)}
                        className="border p-1 rounded w-full"
                        min={r.sampleDate || new Date().toISOString().split("T")[0]}
                      />
                    </td>
                    <td className="border px-3 py-2 min-w-[100px]">
                      <input
                        type="number"
                        min="0"
                        value={r.amount}
                        onChange={e => handleRowChangeWithValidation(i, 'amount', e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="border px-3 py-2 min-w-[100px]">
                      <input
                        type="number"
                        min="0"
                        max={r.amount}
                        value={r.discount}
                        onChange={e => handleRowChangeWithValidation(i, 'discount', e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="border px-3 py-2 min-w-[80px] font-medium">{r.finalAmount.toLocaleString()}</td>
                    <td className="border px-3 py-2 min-w-[100px]">
                      <input
                        type="number"
                        min="0"
                        max={r.finalAmount}
                        value={r.paid}
                        onChange={e => handleRowChangeWithValidation(i, 'paid', e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="border px-3 py-2 min-w-[100px] font-medium">
                      {Math.max(0, r.finalAmount - (r.paid || 0)).toLocaleString()}
                    </td>
                    <td className="border px-3 py-2 min-w-[80px]">
                      <button
                        type="button"
                        onClick={() => handleRemoveRowWithConfirmation(i)}
                        className="text-red-600 hover:text-red-800 font-medium"
                        aria-label="Remove test"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 bg-gray-100 p-3 rounded">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <span className="font-medium">Total Tests:</span> {testRows.length}
              </div>
              <div>
                <span className="font-medium">Total Amount:</span> Rs. {totalAmount.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Remaining:</span> Rs. {overallRemaining.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No tests added yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Select tests from the dropdown above
          </p>
        </div>
      )}
    </div>
  );
};

export default TestInformationForm; 