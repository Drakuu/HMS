import React, { useRef } from "react";
import { XIcon, DownloadIcon, PrinterIcon } from "lucide-react";

const Pdfexpense = ({ data, onClose }) => {
  const printRef = useRef();

  if (!data) return null;

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;

    // Reload the page to restore functionality
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Export Expense Report</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="font-medium">Doctor: {data.doctor}</p>
          <p>Total Expenses: PKR {data.summary.total.toFixed(2)}</p>
          <p>Number of Entries: {data.summary.count}</p>
        </div>

        <div className="flex justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center"
          >
            <PrinterIcon className="h-4 w-4 mr-1" />
            Print Report
          </button>
        </div>

        {/* Hidden content for printing */}
        <div ref={printRef} style={{ display: 'none' }}>
          <h1>Hospital Expenses Summary</h1>
          <h2>Doctor: {data.doctor}</h2>

          <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Welfare</th>
                <th>OT</th>
                <th>Other</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.summary.expenses.map((expense, index) => (
                <tr key={index}>
                  <td>{new Date(expense.createdAt || expense.date).toLocaleDateString()}</td>
                  <td>{expense.description || 'N/A'}</td>
                  <td>PKR {expense.doctorWelfare.toFixed(2)}</td>
                  <td>PKR {expense.otExpenses.toFixed(2)}</td>
                  <td>PKR {expense.otherExpenses.toFixed(2)}</td>
                  <td>PKR {(expense.doctorWelfare + expense.otExpenses + expense.otherExpenses).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Summary</h3>
          <p>Doctor Welfare: PKR {data.summary.welfare.toFixed(2)}</p>
          <p>OT Expenses: PKR {data.summary.ot.toFixed(2)}</p>
          <p>Other Expenses: PKR {data.summary.other.toFixed(2)}</p>
          <p><strong>Total: PKR {data.summary.total.toFixed(2)}</strong></p>
          <p>Number of Entries: {data.summary.count}</p>
          <p>Generated on: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Pdfexpense;