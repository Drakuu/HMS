import React, { useState } from "react";
import {
  Button,
  Box,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  Grid,
  InputAdornment,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import doctorList from "../../utils/doctors";

const RadiologyReportForm = ({
  formData,
  setFormData,
  errors,
  setErrors,
  templates,
  onCancel,
  onSubmit,
  totalPatients,
}) => {
  const [isMRNLocked, setIsMRNLocked] = useState(false);

  const parseAgeToDate = (ageString) => {
    if (!ageString) return null;
    const match = ageString.match(/(\d+) years (\d+) months (\d+) days/);
    if (!match) return null;

    const years = parseInt(match[1]);
    const months = parseInt(match[2]);
    const days = parseInt(match[3]);

    const date = new Date();
    date.setFullYear(date.getFullYear() - years);
    date.setMonth(date.getMonth() - months);
    date.setDate(date.getDate() - days);

    return date;
  };

  const handleMRNOChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const patient = totalPatients.find((p) => p.patient_MRNo === value);
    if (patient) {
      setFormData((prev) => ({
        ...prev,
        patientName: patient.patient_Name,
        patient_ContactNo:patient.patient_ContactNo,
        sex: patient.patient_Gender,
        age: parseAgeToDate(patient.patient_Age),
        referBy: patient.patient_HospitalInformation?.referredBy || "",
        totalAmount: patient.totalAmount ? Number(patient.totalAmount) : 0,
        paidAmount: patient.paidAmount ? Number(patient.paidAmount) : 0,
        discount: patient.discount ? Number(patient.discount) : 0,
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    setIsMRNLocked(e.target.checked);
  };

  const handleAgeChange = (newDate) => {
    setFormData((prev) => ({
      ...prev,
      age: newDate,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For financial fields, convert to number
    const val = ["totalAmount", "paidAmount", "discount"].includes(name)
      ? parseFloat(value) || 0
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));

    // Validate financial fields
    if (["totalAmount", "paidAmount", "discount"].includes(name)) {
      const newErrors = { ...errors };

      if (val < 0) {
        newErrors[name] = "Value cannot be negative";
      } else if (name === "paidAmount" && val > (formData.totalAmount || 0)) {
        newErrors.paidAmount = "Paid amount cannot exceed Total";
      } else if (name === "discount" && val > (formData.totalAmount || 0)) {
        newErrors.discount = "Discount cannot exceed Total";
      } else {
        newErrors[name] = "";
      }

      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patientMRNO && !isMRNLocked)
      newErrors.patientMRNO = "MRN is required";
    if (!formData.patientName)
      newErrors.patientName = "Patient name is required";
    if (!formData.patient_ContactNo)
      newErrors.patient_ContactNo = "patient_ContactNo is required";
    if (!formData.age) newErrors.age = "Date of Birth is required";
    if (!formData.sex) newErrors.sex = "Sex is required";
    if (!formData.referBy) newErrors.referBy = "Referred By is required";
    if (!formData.templateName) newErrors.templateName = "Template is required";

    // Financial validations
    if (formData.paidAmount > formData.totalAmount) {
      newErrors.paidAmount = "Paid amount cannot exceed Total";
    }
    if (formData.discount > formData.totalAmount) {
      newErrors.discount = "Discount cannot exceed Total";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = () => {
    if (validateForm()) {
      onSubmit({
        ...formData,
        totalAmount: Number(formData.totalAmount) || 0,
        paidAmount: Number(formData.paidAmount) || 0,
        discount: Number(formData.discount) || 0,
      });
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box className="flex items-center gap-4 my-4">
        <TextField
          fullWidth
          required
          label="Patient MRN"
          name="patientMRNO"
          value={formData.patientMRNO}
          onChange={handleMRNOChange}
          error={!!errors.patientMRNO}
          helperText={errors.patientMRNO}
          disabled={isMRNLocked}
          size="small"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isMRNLocked}
              onChange={handleCheckboxChange}
              sx={{ color: "#00897b", "&.Mui-checked": { color: "#00897b" } }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: "#616161" }}>
              New Patient
            </Typography>
          }
        />
      </Box>
      <div className="grid grid-cols-2 gap-x-4 my-2">
        <Grid item>
          <TextField
            fullWidth
            required
            label="Patient Name"
            name="patientName"
            value={formData.patientName}
            onChange={handleInputChange}
            error={!!errors.patientName}
            helperText={errors.patientName}
          />
        </Grid>
        <Grid item>
          <TextField
            fullWidth
            required
            label="Patient Contant"
            name="patient_ContactNo"
            value={formData.patient_ContactNo}
            onChange={handleInputChange}
            error={!!errors.patient_ContactNo}
            helperText={errors.patient_ContactNo}
          />
        </Grid>
      </div>
      <div className="grid grid-cols-2 gap-x-4 my-2">
        <Grid item>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date of Birth"
              value={formData.age}
              onChange={handleAgeChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  error={!!errors.age}
                  helperText={errors.age}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item>
          <TextField
            fullWidth
            required
            label="Gender"
            name="sex"
            select
            value={formData.sex}
            onChange={handleInputChange}
            error={!!errors.sex}
            helperText={errors.sex}
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
        </Grid>
      </div>

      <div className="grid grid-cols-2 gap-x-4 my-2">
        <Grid>
          <TextField
            fullWidth
            required
            label="Referred By"
            name="referBy"
            select
            value={formData.referBy}
            onChange={handleInputChange}
            error={!!errors.referBy}
            helperText={errors.referBy}
          >
            {doctorList.map((doctor, index) => (
              <MenuItem key={index} value={doctor}>
                {doctor}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item>
          <TextField
            fullWidth
            label="Total Amount"
            name="totalAmount"
            type="number"
            value={formData.totalAmount || ""}
            onChange={handleInputChange}
            error={!!errors.totalAmount}
            helperText={errors.totalAmount}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
              inputProps: { min: 0, step: 0.01 },
            }}
          />
        </Grid>
      </div>
      <div className="grid grid-cols-2 gap-x-4 my-2">
        <Grid item>
          <TextField
            fullWidth
            label="Paid Amount"
            name="paidAmount"
            type="number"
            value={formData.paidAmount || ""}
            onChange={handleInputChange}
            error={!!errors.paidAmount}
            helperText={errors.paidAmount}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
              inputProps: { min: 0, step: 0.01 },
            }}
          />
        </Grid>

        <Grid item >
          <TextField
            fullWidth
            label="Discount"
            name="discount"
            type="number"
            value={formData.discount || ""}
            onChange={handleInputChange}
            error={!!errors.discount}
            helperText={errors.discount}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
              inputProps: { min: 0, step: 0.01 },
            }}
          />
        </Grid>
      </div>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Procedure Details
        </Typography>
        <TextField
          fullWidth
          required
          label="Procedure Template"
          name="templateName"
          select
          value={formData.templateName}
          onChange={handleInputChange}
          error={!!errors.templateName}
          helperText={errors.templateName}
          size="small"
        >
          {templates.map((template, index) => (
            <MenuItem key={index} value={template}>
              {template
                .replace(/-/g, " ")
                .replace(/&/g, " & ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Divider sx={{ borderColor: "#eee", my: 3 }} />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmitForm}
          variant="contained"
          sx={{
            backgroundColor: "#00897b",
            color: "white",
            "&:hover": { backgroundColor: "#00695c" },
          }}
        >
          Create Report
        </Button>
      </Box>
    </Box>
  );
};

export default RadiologyReportForm;
