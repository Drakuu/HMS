import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { SubmitPatientTest } from "../../../features/patienttestSlice/patientTestSlice";
import { InputField } from "../../../components/common/FormFields";
import { Button, ButtonGroup } from "../../../components/common/Buttons";
import { FormSection } from "../../../components/common/FormSection";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactDOMServer from "react-dom/server";
import PrintA4 from "./PrintPatientTest";
import { fetchPatientByMRNo, resetPatientTestStatus } from "../../../features/patienttestSlice/patientTestSlice";



const AddlabPatient = () => {
  const dispatch = useDispatch();
  const { patient: patientAll, loading, error } = useSelector((state) => state.patientTest);
  //console.log("ata is",patientAll)
  const [isPrinting, setIsPrinting] = useState(false);
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
  const [dob, setDob] = useState(null);

  useEffect(() => {
    const dummyTests = [
      {
        _id: "68722ad4903f27385b85a629",
        testName: "Complete Blood Count",
        testPrice: 1200
      },
    ];
    setAvailableTests(dummyTests);
  }, []);
  useEffect(() => {
    return () => {
      dispatch(resetPatientTestStatus());
    };
  }, [dispatch]);


  const handlePatientChange = (e) => {
    let { name, value } = e.target;
    if (name === "CNIC" && value.length > 12) return;
    if (name === "ContactNo" && value.length > 15) return;
    setPatient({ ...patient, [name]: value });
  };
  const handleSearch = async () => {
    try {
      const mrNoTrimmed = patient.MRNo?.trim();
      if (!mrNoTrimmed) {
        alert("Please enter MR No.");
        return;
      }

      const data = await dispatch(fetchPatientByMRNo(mrNoTrimmed)).unwrap();

      if (!data) {
        alert("Patient not found.");
        return;
      }

      setPatient({
        MRNo: data.patient_MRNo || '',
        CNIC: data.patient_CNIC || '',
        Name: data.patient_Name || '',
        ContactNo: data.patient_ContactNo || '',
        Gender: data.patient_Gender || '',
        Age: data.patient_Age || '',
        ReferredBy: data.referredBy || '',
        Guardian: data.guardian || '',
        MaritalStatus: data.maritalStatus || '',
      });
    } catch (err) {
      console.error("❌ Patient not found:", err.message);
      alert("Patient not found. Please check MR No.");
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
        amount: selected.testPrice || "",
        discount: "",
        finalAmount: selected.testPrice || "",
        paid: "",
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


  const handleSubmitOnly = async (e) => {
    e.preventDefault();
    await submitForm(false);
  };

  const handleSubmitAndPrint = async (e) => {
    e.preventDefault();
    await submitForm(true);
  };

  const submitForm = async (shouldPrint) => {
    //console.log('Starting form submission, shouldPrint:', shouldPrint); // Debug log

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
      performedBy: ""
    };

    try {
      setIsPrinting(shouldPrint);
      const result = await dispatch(SubmitPatientTest(payload)).unwrap();
      //console.log("✅ Submission result:", result);

      setSubmissionResult(result?.data);
      if (shouldPrint && result) {
        const printData = {
          tokenNumber: result?.tokenNumber,
          patient: {
            patient_MRNo: result?.patient?.mrNo || patient.MRNo,
            Name: patient.Name,
            CNIC: patient.CNIC,
            ContactNo: patient.ContactNo,
            Gender: patient.Gender,
            Age: patient.Age,
            ReferredBy: patient.ReferredBy,
            Guardian: patient.Guardian,
            MaritalStatus: patient.MaritalStatus,
          },
          tests: testRows,
          total: totalAmount,
          paid: totalPaid,
          remaining: overallRemaining,
          sampleDate: testRows[0]?.sampleDate || new Date().toLocaleDateString(),
          reportDate: testRows[0]?.reportDate || new Date().toLocaleDateString(),
          referredBy: patient.ReferredBy,
        };

        await handlePrintA4(printData);
      }

      // Clear form after successful submission
      setPatient({
        MRNo: '', CNIC: '', Name: '', ContactNo: '', Gender: '', Age: '',
        ReferredBy: '', Guardian: '', MaritalStatus: ''
      });
      setTestRows([]);
    } catch (err) {
      console.error("Submission error:", err);
      setSubmissionResult({ error: err?.message || 'Submission failed' });
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintA4 = async (formData) => {
    setIsPrinting(true);

    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("Please allow popups for printing");
        setIsPrinting(false);
        return;
      }

      const printContent = ReactDOMServer.renderToStaticMarkup(<PrintA4 formData={formData} />);

      printWindow.document.open();
      printWindow.document.write(`
      <html>
        <head>
          <title>Print Patient Test</title>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Roboto', sans-serif;
              padding: 10mm;
              color: #333;
              font-size: 14px;
            }
            /* Paste your full styles here or import a print.css */
            .logo {
              height: 60px;
              margin-right: 20px;
            }
            .header {
              display: flex;
              align-items: center;
              border-bottom: 2px solid #2b6cb0;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            /* Add more styles as needed */
          </style>
        </head>
        <body>${printContent}</body>
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </html>
    `);
      printWindow.document.close();
    } catch (err) {
      console.error("Printing error:", err);
    } finally {
      setIsPrinting(false);
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const dob = new Date(birthDate);

    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years} years ${months} months ${days} days`;
  };

  const handleDobChange = (date) => {
    setDob(date);
    const ageString = calculateAge(date);
    setPatient(prev => ({ ...prev, Age: ageString }));
  };
  // console.log("in pdf componet is the fromdata is ", formData) 

  return (
    <form onSubmit={handleSubmitOnly} className="p-6 bg-white rounded shadow-md space-y-10">
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
                <InputField name="MRNo" label="MR Number" placeholder="MR-NO" icon="idCard" value={patient.MRNo} onChange={handlePatientChange} required />
                <Button type="button" variant="primary" onClick={handleSearch}>Search</Button>
              </div>
              <InputField name="CNIC" label="CNIC" placeholder="Enter CNIC" icon="idCard" value={patient.CNIC} onChange={handlePatientChange} />
              <InputField name="Name" label="Name" placeholder="Enter full name" icon="user" value={patient.Name} onChange={handlePatientChange} />
              <InputField name="ContactNo" label="Contact No" placeholder="Enter Contact No " icon="phone" value={patient.ContactNo} onChange={handlePatientChange} />
              <select name="Gender" value={patient.Gender} onChange={handlePatientChange} className="border p-2 rounded h-[42px] mt-6">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Trans">Trans</option>
              </select>
              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <DatePicker
                    selected={dob}
                    onChange={handleDobChange}
                    dateFormat="yyyy-MM-dd"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    icon="calendar"
                    placeholderText="Select DOB"
                    className=" border rounded px-3 py-2 h-[42px]"
                  />
                </div>

                <InputField
                  name="Age"
                  label="Age"
                  icon="calendar"
                  placeholder="Age auto Generated "
                  value={patient.Age}
                  onChange={handlePatientChange}
                  readOnly
                />
              </div>

              <InputField name="ReferredBy" label="Referred By" icon="userMd" value={patient.ReferredBy} onChange={handlePatientChange} />
            </>
          ) : (
            <>
              <InputField name="Name" placeholder="Enter Full Name" label="Name" icon="user" value={patient.Name} onChange={handlePatientChange} />
              <InputField name="CNIC" label="CNIC" icon="idCard" placeholder="Enter CNIC" value={patient.CNIC} onChange={handlePatientChange} />
              <InputField name="Guardian" label="Guardian Name" placeholder="Enter Guardian Name" icon="user" value={patient.Guardian} onChange={handlePatientChange} />
              <select name="MaritalStatus" value={patient.MaritalStatus} onChange={handlePatientChange} className="border mt-6 h-[42px] p-2 rounded">
                <option value="">Select Marital Status</option>
                <option value="Married">Married</option>
                <option value="Unmarried">Unmarried</option>
                <option value="Divorced">Divorced</option>
              </select>
              <select name="Gender" value={patient.Gender} onChange={handlePatientChange} className="border h-[42px] mt-6 p-2 rounded">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Trans">Trans</option>
              </select>
              <InputField name="ContactNo" label="Contact No" placeholder="Enter Contact No" icon="phone" value={patient.ContactNo} onChange={handlePatientChange} />
              <InputField name="ReferredBy" label="Referred By" icon="userMd" placeholder="Enter refferance" value={patient.ReferredBy} onChange={handlePatientChange} />
              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <DatePicker
                    selected={dob}
                    onChange={handleDobChange}
                    dateFormat="yyyy-MM-dd"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    icon="calendar"
                    placeholderText="Select DOB"
                    className=" border rounded px-3 py-2 h-[42px]"
                  />
                </div>

                <InputField
                  name="Age"
                  label="Age"
                  icon="calendar"
                  placeholder="Age auto Generated "
                  value={patient.Age}
                  onChange={handlePatientChange}
                  readOnly
                />
              </div>
            </>
          )}
        </div>
      </FormSection>
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
        <Button
          type="submit"
          variant="primary"
          disabled={isPrinting}
        >
          Submit
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={isPrinting}
          onClick={handleSubmitAndPrint}
        >
          {isPrinting ? 'Printing...' : 'Submit & Print'}
        </Button>
      </ButtonGroup>
    </form>
  );
};


export default AddlabPatient;