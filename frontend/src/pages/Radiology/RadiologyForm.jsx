// src/pages/radiology/RadiologyForm.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { InputField } from '../../components/common/FormFields';
import doctorList from '../../utils/doctors';

import {
  fetchAllRadiologyReports,
  fetchAvailableTemplates,
  createRadiologyReport,
  fetchRadiologyReportById,
  fetchReportByMrno,
} from '../../features/Radiology/RadiologySlice';

/** ----------------- Helpers ----------------- **/
const ageStringFromDob = (birthDate) => {
  if (!birthDate) return '';
  const today = new Date();
  const dob = new Date(birthDate);
  today.setHours(0, 0, 0, 0);
  dob.setHours(0, 0, 0, 0);

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    const prevMonthDays = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    ).getDate();
    days += prevMonthDays;
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  if (years < 0) return '';
  return `${years} years ${months} months ${days} days`;
};

// "20", "1.5", "2 months", "15 days", "1 year 6 months"
const parseFlexibleAgeToDob = (input) => {
  if (!input) return null;
  const s = String(input).trim().toLowerCase();

  if (
    !isNaN(parseFloat(s)) &&
    !s.includes('month') &&
    !s.includes('day') &&
    !s.includes('year')
  ) {
    const val = Math.max(0, parseFloat(s));
    const years = Math.floor(val);
    const months = Math.round((val - years) * 12);
    const today = new Date();
    const dob = new Date(today);
    dob.setFullYear(today.getFullYear() - years);
    dob.setMonth(today.getMonth() - months);
    dob.setDate(today.getDate());
    dob.setHours(0, 0, 0, 0);
    return dob;
  }

  const parts = s.split(/\s+/);
  let years = 0,
    months = 0,
    days = 0;
  for (let i = 0; i < parts.length; i++) {
    const n = parseFloat(parts[i]);
    if (isNaN(n)) continue;
    const unit = parts[i + 1] || '';
    if (unit.startsWith('year')) years += n;
    else if (unit.startsWith('month')) months += n;
    else if (unit.startsWith('day')) days += n;
  }
  if (years === 0 && months === 0 && days === 0) {
    const n = parseFloat(s);
    if (!isNaN(n)) years = n;
  }

  years = Math.max(0, Math.floor(years));
  months = Math.max(0, Math.floor(months));
  days = Math.max(0, Math.floor(days));

  const today = new Date();
  const dob = new Date(today);
  dob.setFullYear(today.getFullYear() - years);
  dob.setMonth(today.getMonth() - months);
  dob.setDate(today.getDate() - days);
  dob.setHours(0, 0, 0, 0);
  return dob;
};

/** ----------------- Page ----------------- **/
const RadiologyForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Slice state
  const { reports, templates, isLoading, isError, error } = useSelector(
    (s) => s.radiology
  );

  const reportByMrId = useSelector((s) => s.radiology.currentReport);
  const currentReport = useSelector((s) => s.radiology.currentReport);

  const fetchByMrnoStatus = useSelector((s) => s.radiology.status?.fetchByMrno);

  // Modes
  const [mode, setMode] = useState('existing');

  // Patient fields
  const [patient, setPatient] = useState({
    MRNo: '',
    Name: '',
    CNIC: '',
    Guardian: '',
    Gender: '',
    ContactNo: '',
    ReferredBy: '',
    Age: '',
  });

  const [dob, setDob] = useState(null);
  const [ageInput, setAgeInput] = useState('');
  const ageTimer = useRef(null);

  // Financials + template
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [templateName, setTemplateName] = useState('');

  // Default contact toggle
  const [useDefaultContact, setUseDefaultContact] = useState(false);
  const defaultContactNumber = '051-3311342';
  const prevContactNoRef = useRef(''); // to restore when unchecked

  // Validation errors
  const [errors, setErrors] = useState({});
  const [selectedTemplates, setSelectedTemplates] = useState([]);

  const addTemplate = () => {
    if (!templateName) return;
    setSelectedTemplates((prev) =>
      prev.includes(templateName) ? prev : [...prev, templateName]
    );
    setTemplateName(''); // clear picker
  };

  const removeTemplate = (t) =>
    setSelectedTemplates((prev) => prev.filter((x) => x !== t));

  // for keyboard nav
  const formRef = useRef(null);

  useEffect(() => {
    dispatch(fetchAvailableTemplates());
    dispatch(fetchAllRadiologyReports());
  }, [dispatch]);

  const totalPatients = reports?.totalPatients || [];

  /** -------- Handlers -------- **/
  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchExisting = async () => {
    setErrors((prev) => ({ ...prev, MRNo: '' }));

    const mrn = patient.MRNo?.trim();
    if (!mrn) {
      setErrors((prev) => ({ ...prev, MRNo: 'MRN is required' }));
      return;
    }

    try {
      await dispatch(fetchReportByMrno(mrn)).unwrap();
      // success → currentReport will be updated; the next useEffect will populate fields
    } catch (err) {
      // not found or error
      setErrors((prev) => ({
        ...prev,
        MRNo: String(err?.message || 'Patient not found'),
      }));
      setPatient((prev) => ({
        ...prev,
        Name: '',
        ContactNo: '',
        Gender: '',
        ReferredBy: '',
        Age: '',
      }));
      setDob(null);
      setAgeInput('');
    }
  };
  useEffect(() => {
    if (!currentReport) return;

    // Be defensive about backend keys
    const r = currentReport;

    const mrno = r.patientMRNO || '';
    const name = r.patientName || r.patient_Name || r.Name || '';
    const phone = r.patient_ContactNo || r.ContactNo || r.phone || '';
    const gender = r.sex || r.patient_Gender || r.Gender || '';
    const refBy =
      r.referBy ||
      r.patient_HospitalInformation?.referredBy ||
      r.ReferredBy ||
      '';

    // DOB may be sent as ISO string or nested date field
    const dobIso =
      r.dob ||
      r.DOB ||
      r.dateOfBirth ||
      r.age /* sometimes DOB stored under 'age' */ ||
      null;
    const derivedDob = dobIso ? new Date(dobIso) : null;

    // Age string fallback if no DOB
    const ageStringFromApi = r.patient_Age || r.ageString || '';

    setPatient((prev) => ({
      ...prev,
      MRNo: mrno || prev.MRNo || '',
      Name: name || '',
      ContactNo: phone || '',
      Gender: gender || '',
      ReferredBy: refBy || '',
      Age: derivedDob
        ? ageStringFromDob(derivedDob)
        : ageStringFromApi || prev.Age || '',
    }));

    setDob(derivedDob);
    setAgeInput(
      derivedDob ? ageStringFromDob(derivedDob) : ageStringFromApi || ''
    );
  }, [currentReport]);

  const handleDobChange = (d) => {
    setDob(d);
    setErrors((p) => ({ ...p, dob: '' }));
    if (d && d > new Date()) {
      setErrors((p) => ({ ...p, dob: 'DOB cannot be in the future' }));
      return;
    }
    setPatient((prev) => ({ ...prev, Age: d ? ageStringFromDob(d) : '' }));
  };

  const handleAgeInputChange = (e) => {
    const value = e.target.value;
    setAgeInput(value);
    if (ageTimer.current) clearTimeout(ageTimer.current);

    ageTimer.current = setTimeout(() => {
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, ageManual: '' }));
        return;
      }
      const d = parseFlexibleAgeToDob(value);
      if (d && d <= new Date()) {
        setDob(d);
        setPatient((prev) => ({ ...prev, Age: ageStringFromDob(d) }));
        setErrors((prev) => ({ ...prev, ageManual: '' }));
      } else {
        setErrors((prev) => ({ ...prev, ageManual: 'Invalid age format' }));
      }
    }, 600);
  };

  // Default contact: set & lock; restore on uncheck
  const onToggleDefaultContact = (checked) => {
    setUseDefaultContact(checked);
    if (checked) {
      prevContactNoRef.current = patient.ContactNo || '';
      setPatient((prev) => ({ ...prev, ContactNo: defaultContactNumber }));
    } else {
      setPatient((prev) => ({
        ...prev,
        ContactNo: prevContactNoRef.current || '',
      }));
    }
  };

  useEffect(() => {
    if (dob) setAgeInput(ageStringFromDob(dob));
  }, [dob]);

  /** -------- Validation + Submit -------- **/
  const validate = () => {
    const e = {};
    if (mode === 'existing' && !patient.MRNo) e.MRNo = 'MRN is required';
    if (!patient.Name) e.Name = 'Patient name is required';
    if (!patient.ContactNo) e.ContactNo = 'Contact is required';
    if (!dob) e.dob = 'Date of Birth is required';
    if (dob && dob > new Date()) e.dob = 'DOB cannot be in the future';
    if (!patient.Gender) e.Gender = 'Gender is required';
    if (!patient.ReferredBy) e.ReferredBy = 'Referred By is required';
    if (!templateName && selectedTemplates.length === 0)
      e.templateName = 'Template is required';

    const total = Number(totalAmount || 0);
    const paid = Number(paidAmount || 0);
    const disc = Number(discount || 0);

    if (total < 0) e.totalAmount = 'Value cannot be negative';
    if (paid < 0) e.paidAmount = 'Value cannot be negative';
    if (disc < 0) e.discount = 'Value cannot be negative';
    if (paid > total) e.paidAmount = 'Paid amount cannot exceed Total';
    if (disc > total) e.discount = 'Discount cannot exceed Total';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    // keep using your existing validate()
    if (!validate()) return;

    // Build the templates array from either:
    // - selectedTemplates (multi-select flow), or
    // - templateName (single select string)
    // Works even if selectedTemplates state doesn't exist yet.
    const toCreateRaw =
      Array.isArray(templateName) && templateName.length > 0
        ? templateName
        : typeof selectedTemplates !== 'undefined' && selectedTemplates?.length
        ? selectedTemplates
        : templateName
        ? [templateName]
        : [];

    // Normalize: trim, drop empties, dedupe
    const toCreate = [
      ...new Set(
        toCreateRaw.map((t) => String(t || '').trim()).filter(Boolean)
      ),
    ];

    if (toCreate.length === 0) {
      setErrors((prev) => ({ ...prev, templateName: 'Template is required' }));
      return;
    }

    const payload = {
      patientMRNO: patient.MRNo?.trim() || '',
      patientName: patient.Name?.trim() || '',
      patient_ContactNo: patient.ContactNo?.trim() || '',
      age: dob ? new Date(dob).toISOString() : null, // DOB as ISO (backend stores as Date)
      sex: patient.Gender || '',
      referBy: patient.ReferredBy || '',
      date: new Date().toISOString(),

      // IMPORTANT: send an ARRAY here
      templateName: toCreate,

      // numbers
      totalAmount: Number(totalAmount) || 0,
      paidAmount: Number(paidAmount) || 0,
      discount: Number(discount) || 0,
    };

    try {
      await dispatch(createRadiologyReport(payload)).unwrap();
      await dispatch(fetchAllRadiologyReports());
      navigate(-1);
    } catch (err) {
      console.error('Error creating radiology report(s):', err);
      setErrors((prev) => ({
        ...prev,
        submit: err?.message || 'Failed to create report(s). Please try again.',
      }));
    }
  };

  /** -------- Keyboard navigation -------- **/
  const getNavElements = () => {
    if (!formRef.current) return [];
    // Any input/select/textarea that either has data-nav itself OR is inside a [data-nav] wrapper
    const nodes = Array.from(
      formRef.current.querySelectorAll(
        'input[data-nav], select[data-nav], textarea[data-nav], ' +
          '[data-nav] input, [data-nav] select, [data-nav] textarea'
      )
    )
      // unique & visible & enabled
      .filter((el, idx, arr) => {
        const style = window.getComputedStyle(el);
        const visible =
          style.display !== 'none' && style.visibility !== 'hidden';
        const enabled = !el.disabled && !el.getAttribute('aria-hidden');
        return visible && enabled && arr.indexOf(el) === idx;
      });
    return nodes;
  };

  const moveFocus = (delta) => {
    const els = getNavElements();
    if (!els.length) return;
    const activeIndex = els.findIndex(
      (el) =>
        el === document.activeElement || el.contains(document.activeElement)
    );
    const nextIndex =
      activeIndex === -1
        ? 0
        : Math.max(0, Math.min(els.length - 1, activeIndex + delta));
    const target = els[nextIndex];
    if (target) {
      target.focus();
      // select text for text-like inputs
      try {
        if (target.select) target.select();
      } catch {}
    }
  };

  const handleFormKeyDown = (e) => {
    // Enter → next; Shift+Enter → previous
    if (e.key === 'Enter') {
      e.preventDefault();
      moveFocus(e.shiftKey ? -1 : 1);
      return;
    }
    // Alt+Arrow navigation (doesn't interfere with normal caret movement)
    if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowRight')) {
      e.preventDefault();
      moveFocus(1);
      return;
    }
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
      e.preventDefault();
      moveFocus(-1);
      return;
    }
  };

  const addTemplateInstant = (value) => {
    const v = String(value || '').trim();
    if (!v) return;
    setSelectedTemplates((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setTemplateName(''); // clear picker visibly
  };

  /** ----------------- UI ----------------- **/
  return (
    <div className="">
      <div
        className="max-w-full mx-auto py-6 px-4 bg-white shadow-md"
        ref={formRef}
        onKeyDown={handleFormKeyDown}
      >
        <h1 className="text-3xl bg-primary-600 p-4 text-white font-semibold mb-4">
          Add Radiology New Record
        </h1>

        {isError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">
            {error || 'Something went wrong.'}
          </div>
        )}

        {/* Mode toggle */}
        <div className="flex gap-3 mb-5">
          <button
            type="button"
            className={`px-4 py-2 rounded ${
              mode === 'existing' ? 'bg-primary-700 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setMode('existing')}
          >
            Existing
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded ${
              mode === 'new' ? 'bg-primary-700 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setMode('new')}
          >
            New
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Existing patient MRN + Search */}
          {mode === 'existing' && (
            <div className="md:col-span-3 flex gap-2 items-end">
              <div className="" data-nav>
                <InputField
                  name="MRNo"
                  label="MR Number"
                  placeholder="MR-NO"
                  icon="idCard"
                  value={patient.MRNo}
                  onChange={handlePatientChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchExisting();
                    }
                  }}
                  required
                  data-nav
                />

                {errors.MRNo && (
                  <p className="text-red-600 text-sm mt-1">{errors.MRNo}</p>
                )}
              </div>

              <button
                type="button"
                className="px-4 h-[42px] bg-primary-700 text-white rounded"
                onClick={handleSearchExisting}
                title="Search by MRN"
              >
                Search
              </button>
            </div>
          )}

          {/* Common fields */}
          <div data-nav>
            <InputField
              name="Name"
              label="Name"
              placeholder="Enter full name"
              icon="user"
              value={patient.Name}
              onChange={handlePatientChange}
              required
            />
          </div>

          <div data-nav>
            <InputField
              name="CNIC"
              label="CNIC"
              placeholder="Enter CNIC"
              icon="idCard"
              value={patient.CNIC}
              onChange={handlePatientChange}
            />
          </div>

          <div data-nav>
            <InputField
              name="Guardian"
              label="Guardian Name"
              placeholder="Enter full name"
              icon="user"
              value={patient.Guardian}
              onChange={handlePatientChange}
            />
          </div>

          <div>
            <label
              htmlFor="Gender"
              className="block mb-1 font-medium text-gray-700"
            >
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              id="Gender"
              name="Gender"
              value={patient.Gender || ''}
              onChange={handlePatientChange}
              className="border h-[42px] p-2 rounded w-full border-gray-200 shadow-sm"
              data-nav
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.Gender && (
              <p className="text-red-600 text-sm mt-1">{errors.Gender}</p>
            )}
          </div>

          <div className="md:col-span-2 flex items-center">
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="useDefaultContact"
                checked={useDefaultContact}
                onChange={(e) => onToggleDefaultContact(e.target.checked)}
                className="mr-2"
              />
              <label
                htmlFor="useDefaultContact"
                className="text-sm text-gray-600"
              >
                Use default contact number ({defaultContactNumber})
              </label>
            </div>
          </div>

          <div className="md:col-span-1" data-nav>
            <InputField
              name="ContactNo"
              label="Contact No"
              placeholder="Enter Contact No"
              icon="phone"
              value={patient.ContactNo}
              onChange={handlePatientChange}
              required
              disabled={useDefaultContact}
            />
            {errors.ContactNo && (
              <p className="text-red-600 text-sm mt-1">{errors.ContactNo}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="ReferredBy"
              className="block mb-1 font-medium text-gray-700"
            >
              Referred By <span className="text-red-500">*</span>
            </label>
            <select
              id="ReferredBy"
              name="ReferredBy"
              value={patient.ReferredBy || ''}
              onChange={handlePatientChange}
              className="border h-[42px] p-2 rounded w-full border-gray-200 shadow-sm"
              data-nav
            >
              <option value="">Select Doctor</option>
              {doctorList.map((doctor, index) => (
                <option key={index} value={doctor}>
                  {doctor}
                </option>
              ))}
            </select>
            {errors.ReferredBy && (
              <p className="text-red-600 text-sm mt-1">{errors.ReferredBy}</p>
            )}
          </div>

          {/* DOB + Age */}
          {mode === 'new' ? (
            <>
              <div data-nav>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={dob}
                  onChange={handleDobChange}
                  dateFormat="yyyy-MM-dd"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  maxDate={new Date()}
                  placeholderText="Select DOB"
                  className="border rounded px-3 py-2 h-[42px] w-full"
                  // make sure the actual input is included in nav list
                  onKeyDown={() => {}} // keeps it focusable & captured by onKeyDown at container
                />
                {errors.dob && (
                  <p className="text-red-600 text-sm mt-1">{errors.dob}</p>
                )}
              </div>

              <div data-nav>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age (auto-calculates DOB){' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 20, 0.2, 2 months, 1.5"
                  value={ageInput}
                  onChange={handleAgeInputChange}
                  className="border rounded px-3 py-2 h-[42px] w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter: 20 (years), 0.2 (≈2 months), 1.5 (1 year 6 months), 2
                  months, 15 days
                </p>
                {errors.ageManual && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.ageManual}
                  </p>
                )}
              </div>

              <div data-nav>
                <InputField
                  name="Age"
                  label="Age (Display Only)"
                  icon="calendar"
                  placeholder="Age display"
                  value={patient.Age}
                  onChange={handlePatientChange}
                  readOnly
                />
              </div>
            </>
          ) : (
            <div className="md:col-span-1" data-nav>
              <InputField
                name="Age"
                label="Age"
                icon="calendar"
                placeholder="Age auto generated"
                value={patient.Age}
                onChange={handlePatientChange}
                readOnly
              />
            </div>
          )}

          {/* Financials */}
          <div data-nav>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 border border-r-0 rounded-l border-gray-200 shadow-sm">
                ₨
              </span>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="border rounded-r px-3 py-2 h-[42px] w-full border-gray-200 shadow-sm"
                min="0"
                step="0.01"
              />
            </div>
            {errors.totalAmount && (
              <p className="text-red-600 text-sm mt-1">{errors.totalAmount}</p>
            )}
          </div>

          <div data-nav>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid Amount
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 border border-r-0 rounded-l border-gray-200 shadow-sm">
                ₨
              </span>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="border rounded-r px-3 py-2 h-[42px] w-full border-gray-200 shadow-sm"
                min="0"
                step="0.01"
              />
            </div>
            {errors.paidAmount && (
              <p className="text-red-600 text-sm mt-1">{errors.paidAmount}</p>
            )}
          </div>

          <div data-nav>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 border border-r-0 rounded-l border-gray-200 shadow-sm">
                ₨
              </span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="border rounded-r px-3 py-2 h-[42px] w-full border-gray-200 shadow-sm"
                min="0"
                step="0.01"
              />
            </div>
            {errors.discount && (
              <p className="text-red-600 text-sm mt-1">{errors.discount}</p>
            )}
          </div>

          {/* Procedure Template */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Procedure Template <span className="text-red-500">*</span>
            </label>

            <div className="flex gap-2">
              <select
                value={templateName}
                onChange={(e) => addTemplateInstant(e.target.value)} // ← auto-add here
                className="border h-[42px] p-2 rounded w-full border-gray-200 shadow-sm"
                data-nav
              >
                <option value="">Select template</option>
                {(templates || []).map((t, idx) => (
                  <option key={idx} value={t}>
                    {String(t)
                      .replace(/\.html$/i, '')
                      .replace(/-/g, ' ')
                      .replace(/&/g, ' & ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>

              {/* Remove the Add button – no longer needed */}
            </div>

            {/* Selected list */}
            {selectedTemplates.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedTemplates.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-2 py-1 rounded"
                  >
                    {String(t)
                      .replace(/\.html$/i, '')
                      .replace(/-/g, ' ')}
                    <button
                      type="button"
                      className="text-sm text-red-600"
                      onClick={() => removeTemplate(t)}
                      aria-label={`Remove ${t}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {errors.templateName && (
              <p className="text-red-600 text-sm mt-1">{errors.templateName}</p>
            )}
          </div>
        </div>

        {errors.submit && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">
            {errors.submit}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="px-4 py-2 border rounded border-gray-300 shadow-sm"
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded text-white disabled:opacity-60"
            style={{ backgroundColor: '#00897b' }}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Create Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RadiologyForm;
