import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { SubmitLabTest } from "../../../features/patienttestSlice/labPatientTestSlice";
import { InputField } from "../../../components/common/FormFields";
import { Button, ButtonGroup } from "../../../components/common/Buttons";
import { FormSection } from "../../../components/common/FormSection";

const AddlabPatient = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.labTest);

  const [mode, setMode] = useState("existing");
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

  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [testRows, setTestRows] = useState([]);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    const dummyTests = [
      {
        _id: "6870fc67aa301067dd212ae9",
      },
    ];
    setAvailableTests(dummyTests);
  }, []);

  const handlePatientChange = (e) => {
    let { name, value } = e.target;
    if (name === "CNIC" && value.length > 12) return;
    if (name === "ContactNo" && value.length > 15) return;
    setPatient({ ...patient, [name]: value });
  };

  const handleSearch = () => {
    if (mode === "existing") {
      const pastTests = [
        {
          test: "Blood Test",
          quantity: 1,
          sampleDate: "2025-07-01",
          reportDate: "2025-07-02",
          amount: 500,
          discount: 50,
          finalAmount: 450,
          paid: 200,
        }
      ];
      setTestRows(pastTests);
    }
  };

  const handleTestAdd = () => {
    if (!selectedTestId) return;

    const selected = availableTests.find(t => t._id === selectedTestId);
    if (!selected) return;

    setTestRows(prev => [
      ...prev,
      {
        testId: selected._id,
        testName: selected.testName,
        quantity: prev.length + 1,
        sampleDate: "",
        reportDate: "",
        amount: selected.testPrice || 0,
        discount: 0,
        finalAmount: selected.testPrice || 0,
        paid: 0,
      },
    ]);
    setSelectedTestId("");
  };

  const handleTestRowChange = (i, field, value) => {
    const rows = [...testRows];
    const numericValue = Math.max(0, Number(value));
    if (field === 'amount' || field === 'discount' || field === 'paid') {
      rows[i][field] = numericValue;
      if (field !== 'paid') {
        rows[i].finalAmount = Math.max(0, rows[i].amount - rows[i].discount);
      }
    } else {
      rows[i][field] = value;
    }
    setTestRows(rows);
  };

  const handleRemoveRow = (i) => {
    const updatedRows = testRows.filter((_, idx) => idx !== i);
    const reNumbered = updatedRows.map((row, idx) => ({
      ...row,
      quantity: idx + 1
    }));
    setTestRows(reNumbered);
  };

  const totalAmount = testRows.reduce((sum, r) => sum + r.finalAmount, 0);
  const totalPaid = testRows.reduce((sum, r) => sum + (r.paid || 0), 0);
  const overallRemaining = Math.max(0, totalAmount - totalPaid);

  const handleSubmit = async (e, shouldPrint = false) => {
    e.preventDefault();
    const payload = {
      patient_MRNo: patient.MRNo,
      patient_CNIC: patient.CNIC,
      patient_Name: patient.Name,
      patient_ContactNo: patient.ContactNo,
      patient_Gender: patient.Gender,
      patient_Age: patient.Age,
      referredBy: patient.ReferredBy,
      isExternalPatient: mode === 'new',
      selectedTests: testRows.map(row => ({
        test: row.testId,
        notes: row.notes || ""
      })),
      discount: testRows.reduce((sum, r) => sum + (r.discount || 0), 0),
      performedBy: "admin"
    };
    console.log("The payload is",payload)

    console.log("✅ Payload being sent to backend:", payload);
    try {
      const result = await dispatch(SubmitLabTest(payload)).unwrap();
      setSubmissionResult(result?.data);
      setPatient({
        MRNo: '', CNIC: '', Name: '', ContactNo: '', Gender: '', Age: '',
        ReferredBy: '', Guardian: '', MaritalStatus: ''
      });
      setTestRows([]);
      if (shouldPrint) {
        window.print();
      }
    } catch (err) {
      setSubmissionResult({ error: err?.message || 'Submission failed' });
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 bg-white rounded shadow-md space-y-10">
      <div className="w-screen -ml-6 bg-teal-600 py-6 text-white text-3xl font-bold shadow">
        <h1 className="ml-4">Add Patient New Test</h1>
      </div>

      <FormSection title="Patient Information" bgColor="bg-green-700 text-white">
        <div className="flex gap-4 mb-4">
          <Button type="button" variant={mode === 'existing' ? 'primary' : 'secondary'} onClick={() => setMode("existing")}>Existing</Button>
          <Button type="button" variant={mode === 'new' ? 'primary' : 'secondary'} onClick={() => setMode("new")}>New</Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {mode === "existing" ? (
            <>
              <div className="col-span-3 flex gap-2 items-end">
                <InputField name="MRNo" label="MR Number" icon="idCard" value={patient.MRNo} onChange={handlePatientChange} required />
                <Button type="button" variant="primary" onClick={handleSearch}>Search</Button>
              </div>
              <InputField name="CNIC" label="CNIC" icon="idCard" value={patient.CNIC} onChange={handlePatientChange} />
              <InputField name="Name" label="Name" icon="user" value={patient.Name} onChange={handlePatientChange} />
              <InputField name="ContactNo" label="Contact No" icon="phone" value={patient.ContactNo} onChange={handlePatientChange} />
              <select name="Gender"  value={patient.Gender} onChange={handlePatientChange} className="border p-2 rounded">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Trans">Trans</option>
              </select>
              <InputField name="Age" label="Age" icon="calendar" value={patient.Age} onChange={handlePatientChange} />
              <InputField name="ReferredBy" label="Referred By" icon="userMd" value={patient.ReferredBy} onChange={handlePatientChange} />
            </>
          ) : (
            <>
              <InputField name="Name" label="Name" icon="user" value={patient.Name} onChange={handlePatientChange} />
              <InputField name="CNIC" label="CNIC" icon="idCard" value={patient.CNIC} onChange={handlePatientChange} />
              <InputField name="Guardian" label="Guardian Name" icon="user" value={patient.Guardian} onChange={handlePatientChange} />
              <select name="MaritalStatus" value={patient.MaritalStatus} onChange={handlePatientChange} className="border p-2 rounded">
                <option value="">Select Marital Status</option>
                <option value="Married">Married</option>
                <option value="Unmarried">Unmarried</option>
                <option value="Divorced">Divorced</option>
              </select>
              <select name="Gender" value={patient.Gender} onChange={handlePatientChange} className="border p-2 rounded">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Trans">Trans</option>
              </select>
              <InputField name="ContactNo" label="Contact No" icon="phone" value={patient.ContactNo} onChange={handlePatientChange} />
              <InputField name="ReferredBy" label="Referred By" icon="userMd" value={patient.ReferredBy} onChange={handlePatientChange} />
              <InputField name="Age" label="Age" icon="calendar" value={patient.Age} onChange={handlePatientChange} />
            </>
          )}
        </div>
     </FormSection>

      {/* Test Section */}
      <FormSection title="Test Information" bgColor="bg-green-700 text-white">
        <div className="flex gap-4 mb-4">
          <select
            value={selectedTestId}
            onChange={e => setSelectedTestId(e.target.value)}
            className="border p-2 rounded w-1/2"
          >
            <option value="">Select a Test</option>
            {availableTests.map(o => (
              <option key={o._id} value={o._id}>
                {o.testName} - Rs {o.testPrice}
              </option>
            ))}
          </select>
          <Button onClick={handleTestAdd} type="button" variant="primary">Add</Button>
        </div>

        {testRows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  {["#", "Test", "Sample Date", "Report Date", "Amount", "Discount", "Final", "Paid", "Remaining", "Action"].map(h =>
                    <th key={h} className="px-2 py-1">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {testRows.map((r, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{r.quantity}</td>
                    <td className="border px-2 py-1">{r.testName}</td>
                    <td className="border px-2 py-1"><input type="date" value={r.sampleDate} onChange={e => handleTestRowChange(i, 'sampleDate', e.target.value)} className="border p-1 rounded w-full" /></td>
                    <td className="border px-2 py-1"><input type="date" value={r.reportDate} onChange={e => handleTestRowChange(i, 'reportDate', e.target.value)} className="border p-1 rounded w-full" /></td>
                    <td className="border px-2 py-1"><input type="number" min="0" value={r.amount} onChange={e => handleTestRowChange(i, 'amount', e.target.value)} className="border p-1 rounded w-full" /></td>
                    <td className="border px-2 py-1"><input type="number" min="0" value={r.discount} onChange={e => handleTestRowChange(i, 'discount', e.target.value)} className="border p-1 rounded w-full" /></td>
                    <td className="border px-2 py-1">{r.finalAmount}</td>
                    <td className="border px-2 py-1"><input type="number" min="0" value={r.paid} onChange={e => handleTestRowChange(i, 'paid', e.target.value)} className="border p-1 rounded w-full" /></td>
                    <td className="border px-2 py-1">{Math.max(0, r.finalAmount - (r.paid || 0))}</td>
                    <td className="border px-2 py-1"><button type="button" onClick={() => handleRemoveRow(i)} className="text-red-600 hover:text-red-800">Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </FormSection>

      {/* Submission Section */}
      {submissionResult && (
        <div className="text-sm mt-4">
          {submissionResult?.error ? (
            <p className="text-red-600 font-semibold">Error: {submissionResult.error}</p>
          ) : (
            <div className="text-green-700 font-semibold">
              <p>Submission Successful!</p>
              <p>MR No: <strong>{submissionResult?.patient?.patient_MRNo}</strong></p>
              <p>Token No: <strong>{submissionResult?.tokenNumber}</strong></p>
            </div>
          )}
        </div>
      )}

      <ButtonGroup className="justify-end">
        <Button type="reset" variant="secondary">Cancel</Button>
        <Button type="submit" variant="primary">Submit</Button>
        <Button type="button" variant="primary" onClick={(e) => handleSubmit(e, true)}>Submit & Print</Button>
      </ButtonGroup>
    </form>
  );
};


export default AddlabPatient;
