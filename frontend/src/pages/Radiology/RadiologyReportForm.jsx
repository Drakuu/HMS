// src/pages/radiology/RadiologyReportForm.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Box,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  InputAdornment,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import doctorList from '../../utils/doctors';

/** ===================== Utilities ===================== **/

// Converts "X years Y months Z days" → Date (DOB)
const parseAgeToDate = (ageString) => {
  if (!ageString) return null;

  const match = ageString
    .toLowerCase()
    .match(/(\d+)\s*years?\s+(\d+)\s*months?\s+(\d+)\s*days?/);

  if (!match) return null;

  const years = parseInt(match[1], 10);
  const months = parseInt(match[2], 10);
  const days = parseInt(match[3], 10);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const y = new Date(today);
  y.setFullYear(y.getFullYear() - years);

  const ym = new Date(y);
  ym.setMonth(ym.getMonth() - months);

  const result = new Date(ym);
  result.setDate(result.getDate() - days);

  return result;
};

// Converts Date (DOB) → "X years Y months Z days"
const calculateAge = (birthDate) => {
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

// NEW: Flexible parser for age input like "20", "1.5", "2 months", "15 days", "1 year 6 months"
const parseFlexibleAgeToDob = (input) => {
  if (!input) return null;
  const s = String(input).trim().toLowerCase();

  // simple number/decimal -> years (with fractional months)
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

  // wordy forms
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

  // fallback: lone integer -> years
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

/** ===================== Component ===================== **/

const RadiologyReportForm = ({
  formData,
  setFormData,
  errors,
  setErrors,
  templates = [],
  onCancel,
  onSubmit,
  totalPatients = [],
}) => {
  const [isMRNLocked, setIsMRNLocked] = useState(false);

  // NEW: make the Age input editable; keep it synced with DOB
  const [ageText, setAgeText] = useState('');
  const ageDebounce = useRef(null);

  // keep age text synced with DOB stored in formData.age
  useEffect(() => {
    setAgeText(calculateAge(formData?.age));
  }, [formData?.age]);

  /** -------- Handlers -------- **/

  const handleMRNOChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const patient = totalPatients.find((p) => p?.patient_MRNo === value);

    if (patient) {
      let dobFromPatient = null;
      if (patient.patient_DOB) {
        dobFromPatient = new Date(patient.patient_DOB);
      } else if (patient.patient_Age) {
        dobFromPatient = parseAgeToDate(patient.patient_Age);
      }

      setFormData((prev) => ({
        ...prev,
        patientName: patient.patient_Name || '',
        patient_ContactNo: patient.patient_ContactNo || '',
        sex: patient.patient_Gender || '',
        age: dobFromPatient || prev.age, // store DOB in formData.age
        referBy: patient.patient_HospitalInformation?.referredBy || '',
        totalAmount: patient.totalAmount ? Number(patient.totalAmount) : 0,
        paidAmount: patient.paidAmount ? Number(patient.paidAmount) : 0,
        discount: patient.discount ? Number(patient.discount) : 0,
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    setIsMRNLocked(e.target.checked);
  };

  // DatePicker (DOB) set
  const handleAgeChange = (newDate) => {
    setFormData((prev) => ({
      ...prev,
      age: newDate, // Date of birth
    }));
  };

  // NEW: when user types Age, compute DOB (keeps UI the same field)
  const handleAgeTextChange = (e) => {
    const val = e.target.value;
    setAgeText(val);

    if (ageDebounce.current) clearTimeout(ageDebounce.current);
    ageDebounce.current = setTimeout(() => {
      if (!val.trim()) return;

      const dob = parseFlexibleAgeToDob(val);
      if (dob && dob <= new Date()) {
        setFormData((prev) => ({ ...prev, age: dob }));
        setErrors((prev) => ({ ...prev, ageManual: '' }));
      } else {
        setErrors((prev) => ({ ...prev, ageManual: 'Invalid age format' }));
      }
    }, 500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // number fields
    const numericFields = ['totalAmount', 'paidAmount', 'discount'];
    const nextVal = numericFields.includes(name)
      ? parseFloat(value || '0')
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextVal,
    }));

    // financial validations
    if (numericFields.includes(name)) {
      const newErrors = { ...errors };
      const total =
        name === 'totalAmount' ? nextVal : formData.totalAmount || 0;
      const paid = name === 'paidAmount' ? nextVal : formData.paidAmount || 0;
      const disc = name === 'discount' ? nextVal : formData.discount || 0;

      newErrors[name] = '';

      if (nextVal < 0) {
        newErrors[name] = 'Value cannot be negative';
      }
      if (paid > total) {
        newErrors.paidAmount = 'Paid amount cannot exceed Total';
      } else if (!newErrors.paidAmount) {
        newErrors.paidAmount = '';
      }

      if (disc > total) {
        newErrors.discount = 'Discount cannot exceed Total';
      } else if (!newErrors.discount) {
        newErrors.discount = '';
      }

      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patientMRNO && !isMRNLocked)
      newErrors.patientMRNO = 'MRN is required';
    if (!formData.patientName)
      newErrors.patientName = 'Patient name is required';
    if (!formData.patient_ContactNo)
      newErrors.patient_ContactNo = 'patient_ContactNo is required';
    if (!formData.age) newErrors.age = 'Date of Birth is required';
    if (formData.age && new Date(formData.age) > new Date())
      newErrors.age = 'DOB cannot be in the future';
    if (!formData.sex) newErrors.sex = 'Sex is required';
    if (!formData.referBy) newErrors.referBy = 'Referred By is required';
    if (!formData.templateName) newErrors.templateName = 'Template is required';

    // financial
    const total = Number(formData.totalAmount || 0);
    const paid = Number(formData.paidAmount || 0);
    const disc = Number(formData.discount || 0);

    if (paid > total) newErrors.paidAmount = 'Paid amount cannot exceed Total';
    if (disc > total) newErrors.discount = 'Discount cannot exceed Total';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = () => {
    if (!validateForm()) return;

    onSubmit({
      ...formData,
      totalAmount: Number(formData.totalAmount) || 0,
      paidAmount: Number(formData.paidAmount) || 0,
      discount: Number(formData.discount) || 0,
      ageString: calculateAge(formData.age),
    });
  };

  /** -------- Render -------- **/

  return (
    <Box sx={{ mb: 3 }}>
      {/* MRN + New Patient */}
      <Box className="flex items-center gap-4 my-4">
        <TextField
          fullWidth
          required
          label="Patient MRN"
          name="patientMRNO"
          value={formData.patientMRNO || ''}
          onChange={handleMRNOChange}
          error={!!errors?.patientMRNO}
          helperText={errors?.patientMRNO}
          disabled={isMRNLocked}
          size="small"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isMRNLocked}
              onChange={handleCheckboxChange}
              sx={{ color: '#00897b', '&.Mui-checked': { color: '#00897b' } }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: '#616161' }}>
              New Patient
            </Typography>
          }
        />
      </Box>

      {/* Name + Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
        <TextField
          fullWidth
          required
          label="Patient Name"
          name="patientName"
          value={formData.patientName || ''}
          onChange={handleInputChange}
          error={!!errors?.patientName}
          helperText={errors?.patientName}
        />

        <TextField
          fullWidth
          required
          label="Patient Contact"
          name="patient_ContactNo"
          value={formData.patient_ContactNo || ''}
          onChange={handleInputChange}
          error={!!errors?.patient_ContactNo}
          helperText={errors?.patient_ContactNo}
        />
      </div>

      {/* DOB + Age */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Date of Birth"
            value={formData.age || null}
            onChange={handleAgeChange}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
                error: !!errors?.age,
                helperText: errors?.age || '',
              },
            }}
          />
        </LocalizationProvider>

        {/* SAME field position/label — now editable to set DOB */}
        <TextField
          fullWidth
          label="Age (auto)"
          value={ageText}
          onChange={handleAgeTextChange}
          error={!!errors?.ageManual}
          helperText={errors?.ageManual || ''}
        />
      </div>

      {/* Gender + Referred By */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
        <TextField
          fullWidth
          required
          label="Gender"
          name="sex"
          select
          value={formData.sex || ''}
          onChange={handleInputChange}
          error={!!errors?.sex}
          helperText={errors?.sex}
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </TextField>

        <TextField
          fullWidth
          required
          label="Referred By"
          name="referBy"
          select
          value={formData.referBy || ''}
          onChange={handleInputChange}
          error={!!errors?.referBy}
          helperText={errors?.referBy}
        >
          {doctorList.map((doctor, idx) => (
            <MenuItem key={idx} value={doctor}>
              {doctor}
            </MenuItem>
          ))}
        </TextField>
      </div>

      {/* Financials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
        <TextField
          fullWidth
          label="Total Amount"
          name="totalAmount"
          type="number"
          value={formData.totalAmount ?? ''}
          onChange={handleInputChange}
          error={!!errors?.totalAmount}
          helperText={errors?.totalAmount}
          InputProps={{
            startAdornment: <InputAdornment position="start">₨</InputAdornment>,
            inputProps: { min: 0, step: 0.01 },
          }}
        />

        <TextField
          fullWidth
          label="Paid Amount"
          name="paidAmount"
          type="number"
          value={formData.paidAmount ?? ''}
          onChange={handleInputChange}
          error={!!errors?.paidAmount}
          helperText={errors?.paidAmount}
          InputProps={{
            startAdornment: <InputAdornment position="start">₨</InputAdornment>,
            inputProps: { min: 0, step: 0.01 },
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
        <TextField
          fullWidth
          label="Discount"
          name="discount"
          type="number"
          value={formData.discount ?? ''}
          onChange={handleInputChange}
          error={!!errors?.discount}
          helperText={errors?.discount}
          InputProps={{
            startAdornment: <InputAdornment position="start">₨</InputAdornment>,
            inputProps: { min: 0, step: 0.01 },
          }}
        />
      </div>

      {/* Procedure Template */}
      <Box sx={{ mb: 3, mt: 1.5 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Procedure Details
        </Typography>
        <TextField
          fullWidth
          required
          label="Procedure Template"
          name="templateName"
          select
          value={formData.templateName || ''}
          onChange={handleInputChange}
          error={!!errors?.templateName}
          helperText={errors?.templateName}
          size="small"
        >
          {templates.map((template, index) => (
            <MenuItem key={index} value={template}>
              {template
                .replace(/-/g, ' ')
                .replace(/&/g, ' & ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Divider sx={{ borderColor: '#eee', my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmitForm}
          variant="contained"
          sx={{
            backgroundColor: '#00897b',
            color: 'white',
            '&:hover': { backgroundColor: '#00695c' },
          }}
        >
          Create Report
        </Button>
      </Box>
    </Box>
  );
};

export default RadiologyReportForm;
