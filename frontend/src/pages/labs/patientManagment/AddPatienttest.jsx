import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Button, ButtonGroup } from "../../../components/common/Buttons";
import { FormSection } from "../../../components/common/FormSection";
import ReactDOMServer from "react-dom/server";
import PrintA4 from "./PrintPatientTest";
import {
  fetchAllTests,
  SubmitPatientTest,
  fetchPatientByMRNo,
  resetPatientTestStatus
} from "../../../features/patientTest/patientTestSlice";
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
    // MaritalStatus: '',
  });
  const [selectedTestId, setSelectedTestId] = useState("");
  const [testRows, setTestRows] = useState([]);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [dob, setDob] = useState(null);
  const [printData, setPrintData] = useState(null);
  const [useDefaultContact, setUseDefaultContact] = useState(false);
  const [defaultContactNumber] = useState("0000-0000000"); // Default contact number

  const testList = useSelector((state) => state.patientTest.tests);

  useEffect(() => {
    dispatch(fetchAllTests());
    return () => dispatch(resetPatientTestStatus());
  }, [dispatch]);

  // Add useEffect to handle default contact number
  useEffect(() => {
    if (useDefaultContact) {
      setPatient(prev => ({ ...prev, ContactNo: defaultContactNumber }));
    } else if (patient.ContactNo === defaultContactNumber) {
      setPatient(prev => ({ ...prev, ContactNo: '' }));
    }
  }, [useDefaultContact, defaultContactNumber]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    
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
    setPatient(prev => ({ ...prev, Age: calculateAge(date) }));
  };

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    if ((name === "CNIC" && value.length > 13) || (name === "ContactNo" && value.length > 15)) return;
    setPatient({ ...patient, [name]: value });
  };

  const handleSearch = async () => {
    const mrNo = patient.MRNo?.trim();
    if (!mrNo) {
      alert("Please enter MR No.");
      return;
    }

    try {
      const patientData = await dispatch(fetchPatientByMRNo(mrNo)).unwrap();
      // console.log("Patient data fetched:", patientData);
      if (!patientData) {
        alert("Patient not found.");
        return;
      }

      // Check if contact number is empty and suggest using default
      if (!patientData.contactNo || patientData.contactNo.trim() === '') {
        setUseDefaultContact(true);
      }

      setPatient({
        MRNo: patientData.mrno || '',
        CNIC: patientData.cnic || '',
        Name: patientData.name || '',
        patient_Guardian: patientData.patient_Guardian || '',
        ContactNo: patientData.contactNo || '',
        Gender: patientData.gender || '',
        Age: patientData.age || calculateAge(patientData.DateOfBirth) || '',
        ReferredBy: patientData.referredBy || '',
        Guardian: patientData.gaurdian || '',
        // MaritalStatus: patientData.maritalStatus || '',
      });
    } catch (err) {
      console.error("❌ Patient not found:", err);
      alert(err.payload?.message || "Patient not found. Please check MR No.");
    }
  };

  const handleTestAdd = () => {
    if (!selectedTestId) return;

    const selected = testList.find(t => t._id === selectedTestId);
    if (!selected) return;

    const today = new Date().toISOString().split('T')[0];
    
    setTestRows(prev => [
      ...prev,
      {
        testId: selected._id,
        testName: selected.testName,
        testCode: selected.testCode,
        quantity: prev.length + 1,
        sampleDate: today,
        reportDate: today,
        amount: Number(selected.testPrice) || 0,
        discount: 0,
        finalAmount: Number(selected.testPrice) || 0,
        paid: 0,
        notes: ''
      }
    ]);
    setSelectedTestId("");
  };

  const handleTestRowChange = (i, field, value) => {
    const rows = [...testRows];
    const val = field === 'notes' ? value : Math.max(0, Number(value));

    if (['amount', 'discount', 'paid'].includes(field)) {
      rows[i][field] = val;
      
      if (field === 'amount' || field === 'discount') {
        rows[i].finalAmount = Math.max(0, rows[i].amount - rows[i].discount);
      }
      
      if (field === 'paid') {
        rows[i].paid = Math.min(val, rows[i].finalAmount);
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

  const totalAmount = testRows.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalDiscount = testRows.reduce((sum, r) => sum + (r.discount || 0), 0);
  const totalFinalAmount = testRows.reduce((sum, r) => sum + (r.finalAmount || 0), 0);
  const totalPaid = testRows.reduce((sum, r) => sum + (r.paid || 0), 0);
  const overallRemaining = Math.max(0, totalFinalAmount - totalPaid);

  const showPopupBlockerWarning = () => {
    const existing = document.querySelector('.popup-blocker-warning');
    if (existing) return;
    
    const warning = document.createElement('div');
    warning.className = 'popup-blocker-warning';
    warning.style = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px;
      background: #ffeb3b;
      border: 1px solid #ffc107;
      border-radius: 4px;
      z-index: 9999;
    `;
    warning.innerHTML = `
      <p>Popup blocked! Please allow popups for this site.</p>
      <button onclick="this.parentNode.remove()">Dismiss</button>
    `;
    document.body.appendChild(warning);
  };

  const handlePrint = (printData) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showPopupBlockerWarning();
      setPrintData(printData); // Fallback to modal
      return;
    }
// console.log("totalPaid ID FRONM totalPaid ", printData)

    const printContent = ReactDOMServer.renderToStaticMarkup(<PrintA4 formData={printData} />);

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Patient Test</title>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 10mm;
              color: #333;
              font-size: 14px;
            }
            .header {
              display: flex;
              align-items: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .logo {
              height: 60px;
              margin-right: 20px;
            }
          </style>
        </head>
        <body>${printContent}</body>
        <script>
          setTimeout(() => {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          }, 500);
        </script>
      </html>
    `);
    printWindow.document.close();
  };

  const submitForm = async (shouldPrint) => {
    if (!testRows.length) {
      alert("Please add at least one test");
      return;
    }
      // console.log("tHE patientpatientpatientpatientpatientpatientpatientpatientpatient:", patient);

    const payload = {
      patient_MRNo: patient.MRNo,
      patient_CNIC: patient.CNIC,
      patient_Name: patient.Name,
      patient_Guardian: patient.Guardian,
      patient_ContactNo: patient.ContactNo,
      patient_Gender: patient.Gender,
      patient_Age: patient.Age,
      referredBy: patient.ReferredBy,
      isExternalPatient: mode === 'new',
      selectedTests: testRows.map(row => ({
        test: row.testId,
        testPrice: row.amount,
        discountAmount: row.discount,
        advanceAmount: row.paid,
        remainingAmount: row.finalAmount - row.paid,
        sampleDate: row.sampleDate,
        reportDate: row.reportDate,
        notes: row.notes || ""
      })),
      totalAmount,
      advanceAmount: totalPaid,
      remainingAmount: overallRemaining,
      totalPaid: totalPaid,
      performedBy: "",
    };

    try {
      setIsPrinting(true);
      // console.log("tHE payload being sent:", payload);EditPatientTest
      const result = await dispatch(SubmitPatientTest(payload)).unwrap();
      
      if (!result) {
        throw new Error("Submission failed - no data returned");
      }
      // console.log("Submission result:", result);
      setSubmissionResult(result);

      if (shouldPrint) {
        const printData = {
          tokenNumber: result.tokenNumber,
          patient: {
            MRNo: result.patient?.mrNo || patient.MRNo,
            Name: patient.Name,
            CNIC: patient.CNIC,
            ContactNo: patient.ContactNo,
            Gender: patient.Gender,
            Age: patient.Age,
            ReferredBy: patient.ReferredBy,
            Guardian: patient.patient_Guardian,
            // MaritalStatus: patient.MaritalStatus,
          },
          tests: testRows,
          totalAmount,
          totalDiscount,
          totalFinalAmount,
          totalPaid,
          remaining: overallRemaining,
          sampleDate: testRows[0]?.sampleDate,
          reportDate: testRows[0]?.reportDate,
          referredBy: patient.ReferredBy,
        };
        
        handlePrint(printData);
      }

      // Clear form after successful submission
      setPatient({
        MRNo: '', CNIC: '', Name: '', ContactNo: '', Gender: '', Age: '',
        ReferredBy: '', Guardian: '', MaritalStatus: ''
      });
      setTestRows([]);
    } catch (err) {
      console.error("❌ Submission error:", err);
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleSubmitOnly = async (e) => {
    e.preventDefault();
    await submitForm(false);
  };

  const handleSubmitAndPrint = async (e) => {
    e.preventDefault();
    await submitForm(true);
  };
  // console.log("📋 Test Information Form Data row befor:", testRows)

  return (
    <form onSubmit={handleSubmitOnly} className="p-6 bg-white rounded shadow-md space-y-10">
      <div className="w-screen -ml-6 bg-teal-600 py-6 text-white text-3xl font-bold shadow">
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
          useDefaultContact={useDefaultContact}
          setUseDefaultContact={setUseDefaultContact}
          defaultContactNumber={defaultContactNumber}
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
          totalDiscount={totalDiscount}
          totalFinalAmount={totalFinalAmount}
          totalPaid={totalPaid}
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
          {isPrinting ? 'Submitting...' : 'Submit'}
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={isPrinting}
          onClick={handleSubmitAndPrint}
        >
          {isPrinting ? 'Processing...' : 'Submit & Print'}
        </Button>
      </ButtonGroup>

      {printData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl max-h-screen overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Print Preview</h2>
              <div className="space-x-2">
                <Button 
                  variant="primary" 
                  onClick={() => {
                    window.print();
                    setPrintData(null);
                  }}
                >
                  Print Now
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setPrintData(null)}
                >
                  Close
                </Button>
              </div>
            </div>
            <PrintA4 formData={printData} />
          </div>
        </div>
      )}
    </form>
  );
};

export default AddlabPatient;