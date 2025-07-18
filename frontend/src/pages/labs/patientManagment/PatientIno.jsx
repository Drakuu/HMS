import React from 'react';
import { InputField } from "../../../components/common/FormFields";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PatientInfoForm = ({ 
  mode, 
  patient, 
  dob,
  handlePatientChange, 
  handleSearch, 
  handleDobChange,
  setMode 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <button 
          type="button" 
          className={`px-4 py-2 rounded ${mode === 'existing' ? 'bg-primary-700 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode("existing")}
        >
          Existing
        </button>
        <button 
          type="button" 
          className={`px-4 py-2 rounded ${mode === 'new' ? 'bg-primary-700 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode("new")}
        >
          New
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {mode === "existing" ? (
          <>
            <div className="col-span-3 flex gap-2 items-end">
              <InputField name="MRNo" label="MR Number" placeholder="MR-NO" icon="idCard" 
                value={patient.MRNo} onChange={handlePatientChange} required />
              <button 
                type="button" 
                className="px-4 py-2 bg-primary-700 text-white rounded"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
            <InputField name="CNIC" label="CNIC" placeholder="Enter CNIC" icon="idCard" 
              value={patient.CNIC} onChange={handlePatientChange} />
            <InputField name="Name" label="Name" placeholder="Enter full name" icon="user" 
              value={patient.Name} onChange={handlePatientChange} />
            <InputField name="ContactNo" label="Contact No" placeholder="Enter Contact No" icon="phone" 
              value={patient.ContactNo} onChange={handlePatientChange} />
            
            <div className="">
              <label htmlFor="MaritalStatus" className="block mb-1 font-medium text-gray-700">
                Marital Status
              </label>
              <select
                id="MaritalStatus"
                name="MaritalStatus"
                value={patient.MaritalStatus}
                onChange={handlePatientChange}
                className="border h-[42px] p-2 rounded w-full"
              >
                <option value="">Select Marital Status</option>
                <option value="Married">Married</option>
                <option value="Unmarried">Unmarried</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 col-span-2">
              <InputField
                name="Age"
                label="Age"
                icon="calendar"
                placeholder="Age auto Generated"
                value={patient.Age}
                onChange={handlePatientChange}
                readOnly
              />
            </div>

            <InputField name="ReferredBy" label="Referred By" icon="userMd" 
              value={patient.ReferredBy} onChange={handlePatientChange} />
          </>
        ) : (
          <>
            <InputField name="Name" placeholder="Enter Full Name" label="Name" icon="user" 
              value={patient.Name} onChange={handlePatientChange} />
            <InputField name="CNIC" label="CNIC" icon="idCard" placeholder="Enter CNIC" 
              value={patient.CNIC} onChange={handlePatientChange} />
            <InputField name="Guardian" label="Guardian Name" placeholder="Enter Guardian Name" icon="user" 
              value={patient.Guardian} onChange={handlePatientChange} />
            
            <div className="">
              <label htmlFor="MaritalStatus" className="block mb-1 font-medium text-gray-700">
                Marital Status
              </label>
              <select
                id="MaritalStatus"
                name="MaritalStatus"
                value={patient.MaritalStatus}
                onChange={handlePatientChange}
                className="border h-[42px] p-2 rounded w-full"
              >
                <option value="">Select Marital Status</option>
                <option value="Married">Married</option>
                <option value="Unmarried">Unmarried</option>
              </select>
            </div>

            <div className="">
              <label htmlFor="Gender" className="block mb-1 font-medium text-gray-700">
                Gender
              </label>
              <select
                id="Gender"
                name="Gender"
                value={patient.Gender}
                onChange={handlePatientChange}
                className="border h-[42px] p-2 rounded mb-6 w-full"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Trans">Others</option>
              </select>
            </div>

            <InputField name="ContactNo" label="Contact No" placeholder="Enter Contact No" icon="phone" 
              value={patient.ContactNo} onChange={handlePatientChange} />
            <InputField name="ReferredBy" label="Referred By" icon="userMd" placeholder="Enter reference" 
              value={patient.ReferredBy} onChange={handlePatientChange} />
            
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
                  placeholderText="Select DOB"
                  className="border rounded px-3 py-2 h-[42px] w-full"
                />
              </div>

              <InputField
                name="Age"
                label="Age"
                icon="calendar"
                placeholder="Age auto Generated"
                value={patient.Age}
                onChange={handlePatientChange}
                readOnly
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientInfoForm;