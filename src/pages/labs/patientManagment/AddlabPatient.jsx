import React, { useState } from 'react';
import { InputField, MultiSelectField } from "../../../components/common/FormFields";
import { Button, ButtonGroup } from "../../../components/common/Buttons";
import { FormSection, FormGrid } from "../../../components/common/FormSection";
import DateRangePicker from "../../../components/common/DateRangePicker";

const testOptions = [
  { value: 'blood', label: 'Blood Test' },
  { value: 'xray', label: 'X-Ray' },
  { value: 'mri', label: 'MRI' },
];

const AddlabPatient = () => {
  const [mrNo, setMrNo] = useState('');
  const [patient, setPatient] = useState(null);
  const [selectedTests, setSelectedTests] = useState([]);
  const [sampleDate, setSampleDate] = useState(new Date());
  const [reportDate, setReportDate] = useState(new Date());
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState({
    totalAmount: 0,
    discount: 0,
    finalAmount: 0,
    paymentStatus: 'pending'
  });
  const [labNotes, setLabNotes] = useState('');
  const [performedBy, setPerformedBy] = useState('');

  const handleMRSearch = () => {
    const mockPatient = {
      MRNo: mrNo,
      CNIC: '12345-6789012-3',
      Name: 'John Doe',
      ContactNo: '03001234567',
      Gender: 'Male',
      Age: '30',
      ReferredBy: 'Dr. Smith'
    };
    setPatient(mockPatient);
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...payment, [name]: Number(value) };
    updated.finalAmount = updated.totalAmount - updated.discount;
    setPayment(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      patient_Detail: patient,
      selectedTests: selectedTests.map(test => ({
        test,
        testDate: sampleDate,
        resultDate: reportDate,
        status,
        notes
      })),
      totalAmount: payment.totalAmount,
      discount: payment.discount,
      finalAmount: payment.finalAmount,
      paymentStatus: payment.paymentStatus,
      labNotes,
      performedBy
    };
    console.log(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md space-y-10">
      <FormSection title="New Lab Test Entry" className="bg-blue-100">
        <FormGrid>
          <InputField
            name="MRNo"
            label="MR Number"
            icon="idCard"
            value={mrNo}
            onChange={(e) => setMrNo(e.target.value)}
            required
          />
          <Button onClick={handleMRSearch} variant="primary" className="self-end">Search</Button>
        </FormGrid>
      </FormSection>

      {patient && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <FormSection title="Patient Information" className="bg-blue-100">
              <FormGrid>
                <InputField name="Name" label="Name" icon="user" value={patient.Name} readOnly />
                <InputField name="CNIC" label="CNIC" icon="idCard" value={patient.CNIC} readOnly />
                <InputField name="Gender" label="Gender" icon="man" value={patient.Gender} readOnly />
                <InputField name="Age" label="Age" icon="calendar" value={patient.Age} readOnly />
                <InputField name="ContactNo" label="Contact No" icon="phone" value={patient.ContactNo} readOnly />
                <InputField name="ReferredBy" label="Referred By" icon="userMd" value={patient.ReferredBy} readOnly />
              </FormGrid>
            </FormSection>
          </div>

          <div>
            <FormSection title="Test Information" className="bg-blue-100">
              <FormGrid>
                <MultiSelectField
                  name="selectedTests"
                  label="Select Tests"
                  options={testOptions}
                  value={selectedTests}
                  onChange={(e) => setSelectedTests(e.target.value)}
                  required
                />
                <InputField
                  name="status"
                  label="Status"
                  type="select"
                  icon="health"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={["pending", "completed", "cancelled"]}
                />
              </FormGrid>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sample & Report Dates</label>
                <DateRangePicker
                  initialStartDate={sampleDate}
                  initialEndDate={reportDate}
                  onDateRangeChange={({ start, end }) => {
                    setSampleDate(start);
                    setReportDate(end);
                  }}
                />
              </div>
              <InputField
                name="notes"
                label="Test Notes"
                icon="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
              />
            </FormSection>
          </div>
        </div>
      )}

      {patient && (
        <>
          <FormSection title="Payment Information" className="bg-blue-100">
            <FormGrid>
              <InputField
                name="totalAmount"
                label="Total Amount"
                icon="dollar"
                type="number"
                value={payment.totalAmount}
                onChange={handlePaymentChange}
              />
              <InputField
                name="discount"
                label="Discount"
                icon="discount"
                type="number"
                value={payment.discount}
                onChange={handlePaymentChange}
              />
              <InputField
                name="finalAmount"
                label="Final Amount"
                icon="dollar"
                type="number"
                value={payment.finalAmount}
                readOnly
              />
              <InputField
                name="paymentStatus"
                label="Payment Status"
                type="select"
                icon="dollar"
                value={payment.paymentStatus}
                onChange={handlePaymentChange}
                options={["pending", "paid", "partial"]}
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Lab Notes" className="bg-blue-100">
            <FormGrid>
              <InputField
                name="labNotes"
                label="Lab Notes"
                icon="notes"
                value={labNotes}
                onChange={(e) => setLabNotes(e.target.value)}
                fullWidth
              />
              <InputField
                name="performedBy"
                label="Performed By"
                icon="user"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
              />
            </FormGrid>
          </FormSection>

          <ButtonGroup className="justify-end">
            <Button type="reset" variant="secondary">Cancel</Button>
            <Button type="submit" variant="primary">Submit</Button>
          </ButtonGroup>
        </>
      )}
    </form>
  );
};

export default AddlabPatient;
