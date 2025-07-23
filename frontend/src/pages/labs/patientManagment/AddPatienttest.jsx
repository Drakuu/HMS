import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Button, ButtonGroup } from "../../../components/common/Buttons";
import { FormSection } from "../../../components/common/FormSection";
import ReactDOMServer from "react-dom/server";
import PrintA4 from "./PrintPatientTest";
import { fetchAllTests, SubmitPatientTest, fetchPatientByMRNo, resetPatientTestStatus } from "../../../features/patientTest/patientTestSlice";
import PatientInfoForm from './PatientIno';
import TestInformationForm from './TestInfo';



const AddlabPatient = () => {
  const dispatch = useDispatch();
  const { patient: patientAll, loading, error } = useSelector((state) => state.patientTest);
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
  const [selectedTestId, setSelectedTestId] = useState("");
  const [testRows, setTestRows] = useState([]);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [dob, setDob] = useState(null);

  const testList = useSelector((state) => state.patientTest.tests);
  //console.log("✅ Redux test list:", testList);

  useEffect(() => {
    dispatch(fetchAllTests());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetPatientTestStatus());
    };
  }, [dispatch]);

  //console.log("Fetched test list: ", testList);



  const handlePatientChange = (e) => {
    let { name, value } = e.target;
    if (name === "CNIC" && value.length > 13) return;
    if (name === "ContactNo" && value.length > 11) return;
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
      console.log('the data si com', data)
      if (!data) {
        alert("Patient not found.");
        return;
      }

      setPatient({
        MRNo: data.patient_Detail.patient_MRNo || '',
        CNIC: data.patient_Detail.patient_CNIC || '',
        Name: data.patient_Detail.patient_Name || '',
        ContactNo: data.patient_Detail.patient_ContactNo || '',
        Gender: data.patient_Detail.patient_Gender || '',
        Age: data.patient_Detail.patient_Age || '',
        ReferredBy: data.patient_Detail.referredBy || '',
        Guardian: data.patient_Detail.guardian || '',
        MaritalStatus: data.patient_Detail.maritalStatus || '',
      });
    } catch (err) {
      console.error("❌ Patient not found:", err.message);
      alert("Patient not found. Please check MR No.");
    }
  };

  const handleTestAdd = () => {
    if (!selectedTestId) return;

    const selected = testList.find(t => t._id === selectedTestId);

    if (!selected) return;
    const sampleDate = new Date().toISOString().split('T')[0];
    setTestRows(prev => [
      ...prev,
      {
        testId: selected._id,
        testName: selected.testName,
        quantity: prev.length + 1,
        sampleDate: sampleDate,
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
    let numericValue = Math.max(0, Number(value)); // Ensure that the value is non-negative

    // Validate 'amount', 'discount', and 'paid' fields
    if (field === 'amount' || field === 'discount' || field === 'paid') {
      if (field === 'amount') {
        // Ensure that the amount is never greater than the total amount
        rows[i][field] = Math.min(numericValue, rows[i].finalAmount);
      } else if (field === 'discount') {
        // Ensure that the discount is never greater than the amount
        rows[i][field] = Math.min(numericValue, rows[i].finalAmount);
      } else if (field === 'paid') {
        // Ensure that the paid amount is never greater than the final amount
        rows[i][field] = Math.min(numericValue, rows[i].finalAmount);
      }

      // Update finalAmount after discount is applied
      if (field === 'amount' || field === 'discount') {
        rows[i].finalAmount = Math.max(0, rows[i].amount - rows[i].discount);
      }
    } else {
      // For other fields, just set the value
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
      console.log("✅ Submission result:", result);
      //console.log("🧾 Print MR No:", printData.patient.patient_MRNo);
      console.log("MRNo from result:", result?.data?.patient?.mrNo);


      setSubmissionResult(result?.data);
      if (shouldPrint && result) {


        const printData = {
          tokenNumber: result?.tokenNumber,
          patient: {
            MRNo: result?.data?.patient?.mrNo || patient.MRNo || "N/A",
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
        //console.log("🧾 Print MR No:", printData.patient.patient_MRNo);


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
      <div className=" -ml-6 bg-teal-600 py-6 text-white text-3xl font-bold shadow">
        <h1 className="ml-4">Add Patient New Test</h1>
      </div>

      <FormSection title="Patient Information" bgColor="bg-primary-700 text-white">
        <PatientInfoForm
          mode={mode}
          patient={patient}
          dob={dob}
          handlePatientChange={handlePatientChange}
          handleSearch={handleSearch}
          handleDobChange={handleDobChange}
          setMode={setMode}
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
          totalAmount={totalAmount}
          overallRemaining={overallRemaining}
        />
      </FormSection>

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