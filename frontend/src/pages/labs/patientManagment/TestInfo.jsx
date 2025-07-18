import React from 'react';

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
  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <select
          value={selectedTestId}
          onChange={(e) => setSelectedTestId(e.target.value)}
          className="border p-2 rounded flex-1"
        >
          <option value="">Select a Test</option>
          {testList?.map((o) => (
            <option key={o._id} value={o._id}>
              {o.testName} - Rs {o.testPrice}
            </option>
          ))}
        </select>

        <button 
          type="button" 
          className="px-4 py-2 bg-primary-700 text-white rounded"
          onClick={handleTestAdd}
        >
          Add
        </button>
      </div>

      {testRows.length > 0 && (
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
                        onChange={e => handleTestRowChange(i, 'sampleDate', e.target.value)} 
                        className="border p-1 rounded w-full" 
                      />
                    </td>
                    <td className="border px-3 py-2 min-w-[120px]">
                      <input 
                        type="date" 
                        value={r.reportDate} 
                        onChange={e => handleTestRowChange(i, 'reportDate', e.target.value)} 
                        className="border p-1 rounded w-full" 
                      />
                    </td>
                    <td className="border px-3 py-2 min-w-[100px]">
                      <input 
                        type="number" 
                        min="0" 
                        value={r.amount} 
                        onChange={e => handleTestRowChange(i, 'amount', e.target.value)} 
                        className="border p-1 rounded w-full" 
                      />
                    </td>
                    <td className="border px-3 py-2 min-w-[100px]">
                      <input 
                        type="number" 
                        min="0" 
                        value={r.discount} 
                        onChange={e => handleTestRowChange(i, 'discount', e.target.value)} 
                        className="border p-1 rounded w-full" 
                      />
                    </td>
                    <td className="border px-3 py-2 min-w-[80px] font-medium">{r.finalAmount}</td>
                    <td className="border px-3 py-2 min-w-[100px]">
                      <input 
                        type="number" 
                        min="0" 
                        value={r.paid} 
                        onChange={e => handleTestRowChange(i, 'paid', e.target.value)} 
                        className="border p-1 rounded w-full" 
                      />
                    </td>
                    <td className="border px-3 py-2 min-w-[100px] font-medium">
                      {Math.max(0, r.finalAmount - (r.paid || 0))}
                    </td>
                    <td className="border px-3 py-2 min-w-[80px]">
                      <button 
                        type="button" 
                        onClick={() => handleRemoveRow(i)} 
                        className="text-red-600 hover:text-red-800 font-medium"
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
                <span className="font-medium">Total Amount:</span> Rs. {totalAmount}
              </div>
              <div>
                <span className="font-medium">Remaining:</span> Rs. {overallRemaining}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestInformationForm;