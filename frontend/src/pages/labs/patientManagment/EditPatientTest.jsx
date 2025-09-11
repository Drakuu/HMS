import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPatientTestById,
  fetchAllTests,
  updatepatientTest,
} from '../../../features/patientTest/patientTestSlice';
import { Button, ButtonGroup } from '../../../components/common/Buttons';
import { FormSection } from '../../../components/common/FormSection';
import PatientInfoForm from './PatientIno';
import TestInformationForm from './TestInfo';

// Helpers
const getId = (v) => {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (v.$oid) return v.$oid;
  if (v.$id) return v.$id;
  return String(v);
};

const ymd = (d) => {
  if (!d) return new Date().toISOString().slice(0, 10);
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? new Date().toISOString().slice(0, 10)
    : dt.toISOString().slice(0, 10);
};

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const EditPatientTest = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const testList = useSelector((state) => state.patientTest.tests);
  const patientTestById = useSelector(
    (state) => state.patientTest.patientTestById
  );

  const [patient, setPatient] = useState({
    MRNo: '',
    CNIC: '',
    Name: '',
    ContactNo: '',
    Gender: '',
    Age: '',
    ReferredBy: '',
    Guardian: '',
    MaritalStatus: '',
  });

  const [selectedTestId, setSelectedTestId] = useState('');
  const [testRows, setTestRows] = useState([]);

  const [meta, setMeta] = useState({
    isExternalPatient: false,
    tokenNumber: '',
    paymentStatus: 'unpaid',
  });

  const [billing, setBilling] = useState({
    totalAmount: 0,
    discountAmount: 0,
    advanceAmount: 0,
    remainingAmount: 0,
    cancelledAmount: 0,
    refundableAmount: 0,
    paidAfterReport: 0,
  });

  const [dob, setDob] = useState(null);
  const [additionalPayment, setAdditionalPayment] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [totalPayments, setTotalPayments] = useState(0);

  useEffect(() => {
    dispatch(fetchPatientTestById(id));
    dispatch(fetchAllTests());
  }, [dispatch, id]);

  useEffect(() => {
    if (!patientTestById) return;

    const rec = patientTestById.patientTest || patientTestById;
    const detail = rec.patient_Detail || {};

    setPatient({
      MRNo: detail.patient_MRNo || '',
      CNIC: detail.patient_CNIC || '',
      Name: detail.patient_Name || '',
      ContactNo: detail.patient_ContactNo || '',
      Gender: detail.patient_Gender || '',
      Age: detail.patient_Age || '',
      ReferredBy: detail.referredBy || '',
      Guardian: detail.patient_Guardian || '',
      MaritalStatus: detail.maritalStatus || '',
    });

    // Build rows from record
    const rows = (rec.selectedTests || []).map((t, idx) => {
      const td = t.testDetails || {};
      const price = Number(td.testPrice ?? 0);
      const disc = Number(td.discountAmount ?? 0);
      const paid = Number(td.advanceAmount ?? 0);
      const final = Math.max(0, price - disc);
      const remaining = Number(td.remainingAmount ?? Math.max(0, final - paid));

      return {
        srNo: idx + 1,
        testId: getId(t.test),
        testName: td.testName || '',
        testCode: td.testCode || '',
        sampleDate: ymd(td.testDate || t.testDate),
        reportDate: '',
        amount: price,
        discount: disc,
        finalAmount: final,
        paid: paid,
        remaining: remaining,
        sampleStatus: td.sampleStatus || t.sampleStatus || 'pending',
        reportStatus: td.reportStatus || t.reportStatus || 'not_started',
        testStatus: t.testStatus || 'registered',
        statusHistory: t.statusHistory || [],
        notes: t.notes || '',
      };
    });

    setTestRows(rows);

    // Recalculate totals from rows to keep UI consistent
    const sumDiscount = rows.reduce((s, r) => s + (r.discount || 0), 0);
    const sumPaid = rows.reduce((s, r) => s + (r.paid || 0), 0);
    const sumFinal = rows.reduce((s, r) => s + (r.finalAmount || 0), 0);
    const sumRemaining = Math.max(0, sumFinal - sumPaid);

    let paymentStatus = 'unpaid';
    if (sumRemaining === 0 && sumPaid > 0) paymentStatus = 'paid';
    else if (sumPaid > 0) paymentStatus = 'partial';

    setMeta({
      isExternalPatient: !!rec.isExternalPatient,
      tokenNumber: rec.tokenNumber ?? '',
      paymentStatus,
    });

    setBilling({
      totalAmount: sumFinal,
      discountAmount: sumDiscount,
      advanceAmount: sumPaid,
      remainingAmount: sumRemaining,
      cancelledAmount: rec.cancelledAmount ?? 0,
      refundableAmount: rec.refundableAmount ?? 0,
      paidAfterReport: rec.paidAfterReport ?? 0,
    });

    // Seed history (optional)
    const initialPayments = [];
    if (sumPaid > 0) {
      initialPayments.push({
        date: new Date().toISOString(),
        amount: sumPaid,
        type: 'initial',
        description: 'Initial payment',
      });
    }
    setPaymentHistory(initialPayments);
    setTotalPayments(sumPaid);
    setAdditionalPayment(0);
  }, [patientTestById]);

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => navigate(-1);

  const handleTestAdd = () => {
    if (!selectedTestId) return;
    const selected = testList.find((t) => t._id === selectedTestId);
    if (!selected) return;

    const price = Number(selected.testPrice || 0);
    const disc = Number(selected.discountAmount || 0);
    const final = Math.max(0, price - disc);

    setTestRows((prev) => [
      ...prev,
      {
        srNo: prev.length + 1,
        testId: selected._id,
        testName: selected.testName || '',
        testCode: selected.testCode || '',
        sampleDate: ymd(new Date()),
        reportDate: '',
        amount: price,
        discount: disc,
        finalAmount: final,
        paid: 0,
        remaining: final,
        sampleStatus: 'pending',
        reportStatus: 'not_started',
        testStatus: 'registered',
        statusHistory: [],
        notes: '',
      },
    ]);

    setSelectedTestId('');
  };

  const handleTestRowChange = (i, field, value) => {
    const rows = [...testRows];

    if (['amount', 'discount', 'paid'].includes(field)) {
      const num = Math.max(0, Number(value));
      rows[i][field] = num;

      const price = Number(rows[i].amount || 0);
      const disc = Number(rows[i].discount || 0);
      const paid = Number(rows[i].paid || 0);
      const final = Math.max(0, price - disc);

      rows[i].finalAmount = final;
      rows[i].remaining = Math.max(0, final - paid);
    } else {
      rows[i][field] = value;
    }

    setTestRows(rows);

    const totalAmount = rows.reduce((s, r) => s + (r.finalAmount || 0), 0);
    const totalPaid = rows.reduce((s, r) => s + (r.paid || 0), 0);
    const totalDisc = rows.reduce((s, r) => s + (r.discount || 0), 0);
    const remaining = Math.max(0, totalAmount - totalPaid);

    setBilling((b) => ({
      ...b,
      totalAmount,
      discountAmount: totalDisc,
      advanceAmount: totalPaid,
      remainingAmount: remaining,
    }));

    setMeta((m) => ({
      ...m,
      paymentStatus:
        remaining === 0 && totalPaid > 0
          ? 'paid'
          : totalPaid > 0
          ? 'partial'
          : 'unpaid',
    }));
  };

  const handleRemoveRow = (i) => {
    const updated = testRows
      .filter((_, idx) => idx !== i)
      .map((row, idx) => ({ ...row, quantity: idx + 1 }));
    setTestRows(updated);
  };

  const handleAdditionalPaymentChange = (e) => {
    const value = Math.max(0, Number(e.target.value));
    setAdditionalPayment(value);
  };

  const applyAdditionalPayment = () => {
    if (additionalPayment <= 0) return;

    const rows = [...testRows];
    let remainingPayment = additionalPayment;

    for (let i = 0; i < rows.length && remainingPayment > 0; i++) {
      if (rows[i].remaining > 0) {
        const paymentToApply = Math.min(remainingPayment, rows[i].remaining);
        rows[i].paid += paymentToApply;
        rows[i].remaining -= paymentToApply;
        remainingPayment -= paymentToApply;
      }
    }

    setTestRows(rows);

    const totalAmount = rows.reduce((s, r) => s + (r.finalAmount || 0), 0);
    const totalPaid = rows.reduce((s, r) => s + (r.paid || 0), 0);
    const totalDisc = rows.reduce((s, r) => s + (r.discount || 0), 0);
    const remaining = Math.max(0, totalAmount - totalPaid);

    setBilling((b) => ({
      ...b,
      totalAmount,
      discountAmount: totalDisc,
      advanceAmount: totalPaid,
      remainingAmount: remaining,
    }));

    setMeta((m) => ({
      ...m,
      paymentStatus:
        remaining === 0 && totalPaid > 0
          ? 'paid'
          : totalPaid > 0
          ? 'partial'
          : 'unpaid',
    }));

    setPaymentHistory((h) => [
      ...h,
      {
        date: new Date().toISOString(),
        amount: additionalPayment,
        type: 'additional',
        description: 'Remaining payment',
      },
    ]);
    setTotalPayments((tp) => tp + additionalPayment);
    setAdditionalPayment(0);
  };

  // helpers in AddPatienttest.jsx
  // helpers in EditPatientTest.jsx
  const toNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const round2 = (n) => Math.round(n * 100) / 100;

  const applyOverallDiscount = (requestedDiscount) => {
    const rows = [...testRows];
    if (rows.length === 0) return;

    const amounts = rows.map((r) => Math.max(0, toNum(r.amount)));
    const totalAmount = amounts.reduce((s, n) => s + n, 0);

    let remaining = Math.min(
      Math.max(0, toNum(requestedDiscount)),
      totalAmount
    );

    // If nothing to apply, still normalize rows AND update billing/meta
    if (totalAmount === 0 || remaining === 0) {
      const fixed = rows.map((r, i) => {
        const amount = amounts[i];
        const discount = Math.min(amount, Math.max(0, toNum(r.discount)));
        const final = round2(Math.max(0, amount - discount));
        const paid = round2(toNum(r.paid));
        return {
          ...r,
          amount,
          discount,
          finalAmount: final,
          paid,
          remaining: round2(Math.max(0, final - paid)),
        };
      });
      setTestRows(fixed);

      // 🔧 keep Billing Details & Payment Status in sync
      const sumFinal = fixed.reduce((s, r) => s + (r.finalAmount || 0), 0);
      const sumPaid = fixed.reduce((s, r) => s + (r.paid || 0), 0);
      const sumDisc = fixed.reduce((s, r) => s + (r.discount || 0), 0);
      const sumRemain = Math.max(0, sumFinal - sumPaid);

      setBilling((b) => ({
        ...b,
        totalAmount: sumFinal,
        discountAmount: sumDisc,
        advanceAmount: sumPaid,
        remainingAmount: sumRemain,
      }));
      setMeta((m) => ({
        ...m,
        paymentStatus:
          sumRemain === 0 && sumPaid > 0
            ? 'paid'
            : sumPaid > 0
            ? 'partial'
            : 'unpaid',
      }));
      return;
    }

    // proportional spread
    const targets = amounts.map((a) =>
      totalAmount > 0 ? (remaining * a) / totalAmount : 0
    );
    const discounts = new Array(rows.length).fill(0);
    let assigned = 0;

    for (let i = 0; i < rows.length; i++) {
      const cap = amounts[i];
      const want = round2(targets[i]);
      const give = Math.min(cap, want);
      discounts[i] = give;
      assigned += give;
    }

    let leftover = round2(remaining - assigned);
    while (leftover > 0.000001) {
      let progressed = false;
      for (let i = 0; i < rows.length && leftover > 0.000001; i++) {
        const room = round2(amounts[i] - discounts[i]);
        if (room <= 0.000001) continue;
        const give = round2(Math.min(room, leftover, 0.01));
        discounts[i] = round2(discounts[i] + give);
        leftover = round2(leftover - give);
        progressed = true;
      }
      if (!progressed) break;
    }

    const out = rows.map((r, i) => {
      const amount = amounts[i];
      const discount = Math.min(amount, round2(discounts[i]));
      const final = round2(Math.max(0, amount - discount));
      const paid = round2(toNum(r.paid));
      return {
        ...r,
        amount,
        discount,
        finalAmount: final,
        paid,
        remaining: round2(Math.max(0, final - paid)),
      };
    });

    setTestRows(out);

    // 🔧 keep Billing Details & Payment Status in sync
    const sumFinal = out.reduce((s, r) => s + (r.finalAmount || 0), 0);
    const sumPaid = out.reduce((s, r) => s + (r.paid || 0), 0);
    const sumDisc = out.reduce((s, r) => s + (r.discount || 0), 0);
    const sumRemain = Math.max(0, sumFinal - sumPaid);

    setBilling((b) => ({
      ...b,
      totalAmount: sumFinal,
      discountAmount: sumDisc,
      advanceAmount: sumPaid,
      remainingAmount: sumRemain,
    }));
    setMeta((m) => ({
      ...m,
      paymentStatus:
        sumRemain === 0 && sumPaid > 0
          ? 'paid'
          : sumPaid > 0
          ? 'partial'
          : 'unpaid',
    }));
  };

  // B) Apply overall paid (never reduce existing paid)
  const applyOverallPaid = (overallPaidRaw) => {
    const overallPaid = Math.max(0, Number(overallPaidRaw) || 0);

    setTestRows((prev) => {
      // Recompute finalAmount but KEEP existing paid as-is
      const rows = prev.map((r) => {
        const amount = Math.max(0, Number(r.amount) || 0);
        const discount = Math.min(amount, Math.max(0, Number(r.discount) || 0));
        const finalAmount = Math.max(0, amount - discount);
        const paid = Number(r.paid) || 0; // <-- don't clamp or reset
        return { ...r, finalAmount, paid };
      });

      const currSumPaid = rows.reduce((s, r) => s + (Number(r.paid) || 0), 0);

      // If the requested overallPaid is <= current sum, do NOT shrink paid.
      if (overallPaid <= currSumPaid) {
        return rows.map((r) => ({
          ...r,
          remaining: Math.max(
            0,
            Math.round((r.finalAmount - (Number(r.paid) || 0)) * 100) / 100
          ),
        }));
      }

      // Otherwise, distribute ONLY the extra over current sum across rows (first→last)
      let extra = overallPaid - currSumPaid;

      const next = rows.map((r) => {
        if (extra <= 0 || r.finalAmount === 0) {
          return {
            ...r,
            remaining: Math.max(
              0,
              Math.round((r.finalAmount - (Number(r.paid) || 0)) * 100) / 100
            ),
          };
        }
        const headroom = Math.max(0, r.finalAmount - (Number(r.paid) || 0));
        const add = Math.min(headroom, extra);
        const newPaid = Math.round(((Number(r.paid) || 0) + add) * 100) / 100;
        extra -= add;

        return {
          ...r,
          paid: newPaid,
          remaining: Math.max(
            0,
            Math.round((r.finalAmount - newPaid) * 100) / 100
          ),
        };
      });

      return next;
    });
  };

  // ===== Derived totals for passing to TestInformationForm =====
  const totalAmountCalc = testRows.reduce((s, r) => s + (r.amount || 0), 0);
  const totalDiscountCalc = testRows.reduce((s, r) => s + (r.discount || 0), 0);
  const totalFinalAmountCalc = testRows.reduce(
    (s, r) => s + (r.finalAmount || 0),
    0
  );
  const totalPaidCalc = testRows.reduce((s, r) => s + (r.paid || 0), 0);
  const overallRemainingCalc = Math.max(
    0,
    totalFinalAmountCalc - totalPaidCalc
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sumDiscount = testRows.reduce((s, r) => s + (r.discount || 0), 0);
    const sumPaid = testRows.reduce((s, r) => s + (r.paid || 0), 0);
    const sumFinal = testRows.reduce((s, r) => s + (r.finalAmount || 0), 0);
    const sumRemain = Math.max(0, sumFinal - sumPaid);

    let paymentStatus = 'unpaid';
    if (sumRemain === 0 && sumPaid > 0) paymentStatus = 'paid';
    else if (sumPaid > 0) paymentStatus = 'partial';

    const payload = {
      isExternalPatient: meta.isExternalPatient,
      tokenNumber: meta.tokenNumber,
      patient_Detail: {
        patient_MRNo: patient.MRNo || '',
        patient_CNIC: patient.CNIC || '',
        patient_Name: patient.Name || '',
        patient_ContactNo: patient.ContactNo || '',
        patient_Gender: patient.Gender || '',
        patient_Age: patient.Age || '',
        referredBy: patient.ReferredBy || '',
        patient_Guardian: patient.Guardian || '',
        maritalStatus: patient.MaritalStatus || '',
      },
      selectedTests: testRows.map((r) => ({
        test: r.testId,
        testStatus: r.testStatus || 'registered',
        testDetails: {
          testName: r.testName,
          testCode: r.testCode,
          testPrice: Number(r.amount || 0),
          discountAmount: Number(r.discount || 0),
          advanceAmount: Number(r.paid || 0),
          remainingAmount: Math.max(
            0,
            Number(r.finalAmount || 0) - Number(r.paid || 0)
          ),
          sampleStatus: r.sampleStatus || 'pending',
          reportStatus: r.reportStatus || 'not_started',
          testDate: r.sampleDate
            ? new Date(r.sampleDate).toISOString()
            : new Date().toISOString(),
        },
        statusHistory: r.statusHistory || [],
        notes: r.notes || '',
      })),
      totalAmount: sumFinal,
      discountAmount: sumDiscount,
      advanceAmount: sumPaid,
      remainingAmount: sumRemain,
      totalPaid: sumPaid,
      paymentStatus, // client view — server should still recompute
      paidAfterReport: billing.paidAfterReport || 0,
      cancelledAmount: billing.cancelledAmount || 0,
      refundableAmount: billing.refundableAmount || 0,
      performedBy: 'current_user',
    };
   
    try {
      await dispatch(updatepatientTest({ id, updateData: payload })).unwrap();
      toast.success('Patient test updated successfully');
      navigate(-1);
    } catch (err) {
      console.error('Full error object:', err);
      toast.error(
        `Error updating patient test: ${err.message || err.payload?.message}`
      );
    }
  };

  const amountAfterDiscount = Math.max(
    0,
    (patientTestById?.patientTest?.totalAmount ??
      patientTestById?.totalAmount ??
      0) - (billing?.discountAmount ?? 0)
  );

  // put inside EditPatientTest component
  const handleFormKeyDown = (e) => {
    if (e.key !== 'Enter') return;

    const el = e.target;
    const tag = el.tagName; // 'INPUT' | 'TEXTAREA' | 'SELECT' | ...
    const type = (el.type || '').toLowerCase();

    // allow Enter inside textarea or on explicit buttons
    const allow = tag === 'TEXTAREA' || type === 'button' || type === 'submit';

    if (!allow) {
      e.preventDefault(); // stops implicit form submit
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleFormKeyDown}
      className="p-6 bg-white rounded shadow-md space-y-10"
    >
      <div className=" -ml-6  bg-teal-600 py-6 text-white text-3xl font-bold shadow">
        <h1 className="ml-4">Edit Patient Test</h1>
      </div>

      <FormSection
        title="Patient Information"
        bgColor="bg-primary-700 text-white"
      >
        <PatientInfoForm
          mode="edit"
          patient={patient}
          dob={dob}
          handlePatientChange={handlePatientChange}
          handleSearch={() => {}}
          handleDobChange={setDob}
          setMode={() => {}}
        />
      </FormSection>

      <FormSection title="Test Information" bgColor="bg-primary-700 text-white">
        <TestInformationForm
          testList={testList}
          selectedTestId={selectedTestId}
          setSelectedTestId={setSelectedTestId}
          testRows={testRows}
          handleTestAdd={handleTestAdd}
          handleTestRowChange={handleTestRowChange}
          handleRemoveRow={handleRemoveRow}
          totalAmount={totalAmountCalc}
          totalDiscount={totalDiscountCalc}
          totalFinalAmount={totalFinalAmountCalc}
          totalPaid={totalPaidCalc}
          overallRemaining={overallRemainingCalc}
          applyOverallPaid={applyOverallPaid}
          applyOverallDiscount={applyOverallDiscount}
          paidBoxValue={totalPaidCalc}
          discountBoxValue={totalDiscountCalc}
          mode="edit"
        />
      </FormSection>

      {/* Payment Summary */}
      <FormSection title="Payment Summary" bgColor="bg-primary-700 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-2">Billing Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-medium">
                  {formatCurrency(billing.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(billing.discountAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Paid:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(totalPayments)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span>Remaining Balance:</span>
                <span
                  className={`font-medium ${
                    billing.remainingAmount > 0
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {formatCurrency(billing.remainingAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-2">Payment Status</h3>
            <div className="flex items-center justify-between mb-4">
              <span>Current Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  meta.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : meta.paymentStatus === 'partial'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {meta.paymentStatus.toUpperCase()}
              </span>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Remaining Payment
              </label>
              <input
                type="number"
                readOnly
                value={Number(billing.remainingAmount || 0).toFixed(2)}
                className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700"
              />
              <p className="mt-1 text-xs text-gray-500">
                This updates automatically as you type in “Set Total Paid”.
              </p>
            </div>

            {billing.remainingAmount > 0 && (
              <div className="mt-4">
                <label
                  htmlFor="additionalPayment"
                  className="block text-sm font-medium text-gray-700"
                >
                  Additional Payment
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="number"
                    id="additionalPayment"
                    name="additionalPayment"
                    value={additionalPayment}
                    onChange={(e) => {
                      const v = Math.max(0, Number(e.target.value));
                      setAdditionalPayment(v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault(); // don’t submit the form
                        if (
                          additionalPayment > 0 &&
                          additionalPayment <= billing.remainingAmount
                        ) {
                          applyAdditionalPayment(); // run your Apply logic
                        }
                      }
                    }}
                    min="0"
                    max={billing.remainingAmount}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter amount"
                  />

                  <Button
                    type="button"
                    variant="primary"
                    onClick={applyAdditionalPayment}
                    disabled={
                      additionalPayment <= 0 ||
                      additionalPayment > billing.remainingAmount
                    }
                    className="rounded-l-none"
                  >
                    Apply
                  </Button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Maximum: Rs. {Number(billing.remainingAmount || 0).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>

        {paymentHistory.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Payment History</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-md">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Description
                      </th>
                      <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paymentHistory.map((payment, index) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {payment.description}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                          <span className="text-green-600 font-medium">
                            +{formatCurrency(payment.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}

                    <tr className="bg-gray-50 font-medium">
                      <td
                        colSpan="2"
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right"
                      >
                        Discount:
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right">
                        {' '}
                        {formatCurrency(billing.discountAmount)}
                      </td>
                    </tr>
                    <tr className="bg-gray-50 font-medium">
                      <td
                        colSpan="2"
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right"
                      >
                        Total Amount:
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right">
                        {' '}
                        {formatCurrency(amountAfterDiscount)}
                      </td>
                    </tr>
                    <tr className="bg-gray-50 font-medium">
                      <td
                        colSpan="2"
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right"
                      >
                        Total Payments:
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right">
                        {formatCurrency(totalPayments)}
                      </td>
                    </tr>

                    <tr className="bg-gray-50 font-medium">
                      <td
                        colSpan="2"
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right"
                      >
                        Remaining Payments:
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right">
                        {formatCurrency(billing.remainingAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </FormSection>

      <ButtonGroup className="justify-end">
        <Button type="button" variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Update
        </Button>
      </ButtonGroup>
    </form>
  );
};

export default EditPatientTest;
