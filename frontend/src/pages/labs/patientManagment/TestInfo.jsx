import React from 'react';
import { toast } from 'react-toastify';
import Select from 'react-select';

const TestInformationForm = ({
  testList,
  selectedTestId,
  setSelectedTestId,
  testRows,
  handleTestAdd,
  handleTestRowChange,
  handleRemoveRow,
  totalAmount,
  totalDiscount,
  totalPaid,
  overallRemaining,
  applyOverallDiscount,
  applyOverallPaid,
  mode,
  paidBoxValue,
  discountBoxValue,
}) => {
  // integers only
  const asInt = (v, max = 9_999_999) => {
    const s = String(v ?? '').trim();
    if (s === '') return 0;
    const n = Number.parseInt(s.replace(/[^\d-]/g, ''), 10);
    if (!Number.isFinite(n)) return 0;
    return Math.min(Math.max(n, 0), max);
  };
  const fmtInt = (v) => {
    const n = Number.isFinite(v) ? v : asInt(v);
    return Number.isFinite(n) ? n.toLocaleString() : '—';
  };

  // normalize testList
  const list = Array.isArray(testList) ? testList : [];
  const isLoadingTests = testList === undefined;
  const noTestsAvailable = Array.isArray(testList) && testList.length === 0;

  // overall boxes (local state mirrors parent and commits on blur/Enter)
  const [paidBox, setPaidBox] = React.useState('');
  const [discountBox, setDiscountBox] = React.useState('');

  React.useEffect(() => {
    if (paidBoxValue !== undefined && paidBoxValue !== null) {
      setPaidBox(String(paidBoxValue));
    }
  }, [paidBoxValue]);

  React.useEffect(() => {
    if (discountBoxValue !== undefined && discountBoxValue !== null) {
      setDiscountBox(String(discountBoxValue));
    }
  }, [discountBoxValue]);

  const handleAddTestWithValidation = (tId) => {
    try {
      const id = tId ?? selectedTestId;
      if (!id) return toast.error('Please select a test to add');

      const selected = list.find((t) => t?._id === id);
      if (!selected) return toast.error('Selected test not found');

      const exists = testRows.some((row) => row.testId === id);
      if (exists) return toast.warning('This test is already added');

      handleTestAdd(id);
      setSelectedTestId('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add test. Please try again.');
    }
  };

  const handleRowChangeWithValidation = (i, field, value) => {
    try {
      const numeric = ['amount', 'discount', 'paid'];
      if (numeric.includes(field)) {
        let v = asInt(value);
        const row = testRows[i] ?? {};
        const currAmount = asInt(row.amount ?? 0);
        const currDiscount = asInt(row.discount ?? 0);

        const nextAmount = field === 'amount' ? v : currAmount;
        const nextDiscount = field === 'discount' ? v : currDiscount;

        if (field === 'discount' && v > nextAmount) v = nextAmount;

        const nextFinal = Math.max(0, nextAmount - nextDiscount);
        if (field === 'paid' && v > nextFinal) v = nextFinal;

        handleTestRowChange(i, field, v);
        return;
      }

      if (['sampleDate', 'reportDate'].includes(field)) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        if (value && new Date(value) < todayStart) {
          toast.warning('Date cannot be in the past');
          return;
        }
      }

      handleTestRowChange(i, field, value);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update test. Please try again.');
    }
  };

  const handleRemoveRowWithConfirmation = (i) => {
    try {
      if (window.confirm('Are you sure you want to remove this test?')) {
        handleRemoveRow(i);
        toast.success('Test removed successfully');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove test. Please try again.');
    }
  };

  const rowFinal = (row) => {
    const amt = asInt(row?.amount ?? 0);
    const dis = Math.min(asInt(row?.discount ?? 0), amt);
    return Math.max(0, amt - dis);
  };
  const rowRemaining = (row) => {
    const fin = rowFinal(row);
    const paid = Math.min(asInt(row?.paid ?? 0), fin);
    return Math.max(0, fin - paid);
  };

  const options = list
    .filter((t) => !testRows.some((r) => r.testId === t._id))
    .map((t) => ({
      value: t._id,
      label: `${t.testName || 'Unnamed Test'} - Rs ${fmtInt(t.testPrice || 0)}`,
    }));

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <Select
          className="w-full"
          styles={{ container: (base) => ({ ...base, width: '100%' }) }}
          value={options.find((o) => o.value === selectedTestId) || null}
          onChange={(option) => {
            if (option) {
              setSelectedTestId(option.value);
              handleAddTestWithValidation(option.value); // auto-add
            }
          }}
          options={options}
          isLoading={isLoadingTests}
          placeholder={
            isLoadingTests
              ? 'Loading tests...'
              : noTestsAvailable
              ? 'Not available. First create the test.'
              : 'Search or select a test...'
          }
          isDisabled={isLoadingTests || noTestsAvailable}
        />

        <button
          type="button"
          className={`px-4 py-2 text-white rounded ${
            !selectedTestId || isLoadingTests
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-700 hover:bg-primary-800'
          }`}
          onClick={() => handleAddTestWithValidation()}
          disabled={!selectedTestId || isLoadingTests}
        >
          {isLoadingTests ? 'Loading...' : 'Add'}
        </button>
      </div>

      {testRows.length > 0 ? (
        <div className="w-full">
          <div className="overflow-x-auto min-w-full">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  {['#','Test','Sample Date','Report Date','Amount','Discount','Final','Paid','Remaining','Action'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left">{h}</th>
                  ))}
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
                        onChange={(e) => handleRowChangeWithValidation(i, 'sampleDate', e.target.value)}
                        className="border p-1 rounded w-full"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </td>

                    <td className="border px-3 py-2 min-w-[120px]">
                      <input
                        type="date"
                        value={r.reportDate}
                        onChange={(e) => handleRowChangeWithValidation(i, 'reportDate', e.target.value)}
                        className="border p-1 rounded w-full"
                        min={r.sampleDate || new Date().toISOString().split('T')[0]}
                      />
                    </td>

                    {/* Amount (int) */}
                    <td className="border px-3 py-2 min-w-[100px]">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={r.amount}
                        onChange={(e) => handleRowChangeWithValidation(i, 'amount', e.target.value)}
                        onBlur={(e) => handleRowChangeWithValidation(i, 'amount', asInt(e.currentTarget.value))}
                        inputMode="numeric"
                        onWheel={(e) => e.currentTarget.blur()}
                        className="border p-1 rounded w-full"
                      />
                    </td>

                    {/* Discount (int) */}
                    <td className="border px-3 py-2 min-w-[100px]">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={r.discount}
                        onChange={(e) => handleRowChangeWithValidation(i, 'discount', e.target.value)}
                        onBlur={(e) => handleRowChangeWithValidation(i, 'discount', asInt(e.currentTarget.value))}
                        inputMode="numeric"
                        onWheel={(e) => e.currentTarget.blur()}
                        className="border p-1 rounded w-full"
                      />
                    </td>

                    {/* Final (derived) */}
                    <td className="border px-3 py-2 min-w-[80px] font-medium">
                      {fmtInt(rowFinal(r))}
                    </td>

                    {/* Paid (int) */}
                    <td className="border px-3 py-2 min-w-[100px]">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={r.paid}
                        onChange={(e) => handleRowChangeWithValidation(i, 'paid', e.target.value)}
                        onBlur={(e) => handleRowChangeWithValidation(i, 'paid', asInt(e.currentTarget.value))}
                        inputMode="numeric"
                        onWheel={(e) => e.currentTarget.blur()}
                        className="border p-1 rounded w-full"
                      />
                    </td>

                    {/* Remaining (derived) */}
                    <td className="border px-3 py-2 min-w-[100px] font-medium">
                      {fmtInt(rowRemaining(r))}
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

          {/* Summary */}
          <div className="mt-4 bg-gray-100 p-3 rounded">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <span className="font-medium">Total Tests:</span> {testRows.length}
              </div>

              <div>
                <span className="font-medium">Total Amount:</span> Rs. {fmtInt(totalAmount)}
              </div>

              {/* TOTAL DISCOUNT (commit on blur/Enter) */}
              <div className="col-span-2 flex items-center gap-2">
                <label className="font-medium whitespace-nowrap">Total Discount:</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="border p-1 rounded w-32"
                  value={discountBox}
                  onChange={(e) => {
                    // local only while typing
                    setDiscountBox(e.currentTarget.value);
                  }}
                  onBlur={(e) => {
                    const v = asInt(e.currentTarget.value);
                    setDiscountBox(String(v));
                    applyOverallDiscount?.(v); // commit
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const v = asInt(e.currentTarget.value);
                      setDiscountBox(String(v));
                      applyOverallDiscount?.(v);
                      e.currentTarget.blur();
                    }
                  }}
                  inputMode="numeric"
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>

              {/* TOTAL PAID (commit on blur/Enter) */}
              <div className="col-span-2 flex items-center gap-2">
                <label className="font-medium whitespace-nowrap">Total Paid:</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="border p-1 rounded w-32"
                  value={paidBox}
                  onChange={(e) => {
                    // local only while typing
                    setPaidBox(e.currentTarget.value);
                  }}
                  onBlur={(e) => {
                    const v = asInt(e.currentTarget.value);
                    setPaidBox(String(v));
                    applyOverallPaid?.(v); // commit
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const v = asInt(e.currentTarget.value);
                      setPaidBox(String(v));
                      applyOverallPaid?.(v);
                      e.currentTarget.blur();
                    }
                  }}
                  inputMode="numeric"
                  onWheel={(e) => e.currentTarget.blur()}
                  disabled={mode === 'edit'}
                />
              </div>

              <div>
                <span className="font-medium">Remaining:</span> Rs. {fmtInt(overallRemaining)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No tests added yet</p>
          <p className="text-sm text-gray-400 mt-1">Select tests from the dropdown above</p>
        </div>
      )}
    </div>
  );
};

export default TestInformationForm;
