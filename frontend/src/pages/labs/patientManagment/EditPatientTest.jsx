import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import {useNavigate } from 'react-router-dom';

const EditPatientTest = () => {
  
  const { id } = useParams(); // Changed from mrNo to id
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const testList = useSelector((state) => state.patientTest.tests);
  const patientTestById = useSelector((state) => state.patientTest.patientTestById);
  
  const [patient, setPatient] = useState({
    MRNo: '',
    CNIC: '',
    Name: '',
    ContactNo: '',
    Gender: '',
    Age: '',
    ReferredBy: '',
    MaritalStatus: '',
  });

  const [selectedTestId, setSelectedTestId] = useState('');
  const [testRows, setTestRows] = useState([]);
  const [dob, setDob] = useState(null);
  
  
  // console
  useEffect(() => {
    dispatch(fetchPatientTestById(id)); // Changed to fetch by ID
    dispatch(fetchAllTests());
  }, [dispatch, id]);

  useEffect(() => {
    if (patientTestById) {
      const detail = patientTestById.patientTest?.patient_Detail ||
      patientTestById.patient_Detail;
      
      console.log("EditPatientTest loaded", detail);
      if (detail) {
        setPatient({
          MRNo: detail.patient_MRNo,
          CNIC: detail.patient_CNIC,
          Name: detail.patient_Name,
          ContactNo: detail.patient_ContactNo,
          Gender: detail.patient_Gender,
          Age: detail.patient_Age,
          ReferredBy: detail.referredBy || '',
          Guardian: detail.patient_Guardian || '',
          MaritalStatus: detail.maritalStatus || '',
        });

        const tests = patientTestById.patientTest?.selectedTests ||
          patientTestById.selectedTests;

        if (tests) {
          setTestRows(
            tests.map((t, index) => ({
              testId: t.test?.$id || t.test, // handle both $oid or direct id
              testName: t.testDetails?.testName || '',
              quantity: index + 1,
              sampleDate: new Date(t.testDate?.$date || Date.now()).toISOString().split('T')[0],
              reportDate: '',
              amount: t.testDetails?.testPrice || 0,
              discount: t.discount || 0,
              finalAmount: t.finalAmount || (t.testDetails?.testPrice - (t.discount || 0)) || 0,
              paid: t.paid || 0,

              notes: t.notes || 0,
            }))
          );
        }
      }
    }
  }, [patientTestById]);

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };
const handleCancel = () => {
  navigate(-1); // Or your actual route to the patient tests list
};


  const handleTestAdd = () => {
    if (!selectedTestId) return;
    const selected = testList.find((t) => t._id === selectedTestId);
    if (!selected) return;

    const sampleDate = new Date().toISOString().split('T')[0];

    setTestRows((prev) => [
      ...prev,
      {
        testId: selected._id,
        testName: selected.testName,
        quantity: prev.length + 1,
        sampleDate,
        reportDate: '',
        amount: selected.testPrice || 0,
        discount: selected.discount || 0,
        finalAmount: selected.finalAmount || 0,
        paid: 0,
        notes: ''
      },
    ]);
    setSelectedTestId('');
  };

  const handleTestRowChange = (i, field, value) => {
    const rows = [...testRows];
    const numericValue = Math.max(0, Number(value));

    if (field === 'amount' || field === 'discount' || field === 'paid') {
      rows[i][field] = numericValue;
      rows[i].finalAmount = Math.max(0, rows[i].amount - rows[i].discount);
    } else {
      rows[i][field] = value;
    }

    setTestRows(rows);
  };

  const handleRemoveRow = (i) => {
    const updated = testRows.filter((_, idx) => idx !== i).map((row, idx) => ({
      ...row,
      quantity: idx + 1,
    }));
    setTestRows(updated);
  };

  const totalAmount = testRows.reduce((sum, r) => sum + r.finalAmount, 0);
  const totalPaid = testRows.reduce((sum, r) => sum + (r.paid || 0), 0);
  const overallRemaining = Math.max(0, totalAmount - totalPaid);

const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    patient_Detail: {
      patient_MRNo: patient.MRNo,
      patient_CNIC: patient.CNIC,
      patient_Name: patient.Name,
      patient_ContactNo: patient.ContactNo,
      patient_Gender: patient.Gender,
      patient_Age: patient.Age,
      referredBy: patient.ReferredBy,
    },
    selectedTests: testRows.map(row => ({
      test: row.testId,
      testDetails: {
        testName: row.testName,
        testPrice: row.amount,
        discountAmount: row.discount || 0,
        advanceAmount: row.paid || 0,
      },
      testDate: row.sampleDate || new Date().toISOString(),
    })),
    performedBy: "current_user" // Replace with actual user
  };

  try {
    await dispatch(updatepatientTest({
      id,
      updateData: payload
    })).unwrap();
    alert('Patient test updated successfully');
    navigate(-1); // Go back after successful update
  } catch (err) {
    console.error('Full error object:', err);
    alert(`Error updating patient test: ${err.message || err.payload?.message}`);
  }
};

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md space-y-10">
      <div className=" -ml-6  bg-teal-600 py-6 text-white text-3xl font-bold shadow">
        <h1 className="ml-4">Edit Patient Test</h1>
      </div>

      <FormSection title="Patient Information" bgColor="bg-primary-700 text-white">
        <PatientInfoForm
          mode="edit"
          patient={patient}
          dob={dob}
          handlePatientChange={handlePatientChange}
          handleSearch={() => { }}
          handleDobChange={setDob}
          setMode={() => { }}
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
        <Button 
  type="button" 
  variant="secondary"
  onClick={handleCancel}
>
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


