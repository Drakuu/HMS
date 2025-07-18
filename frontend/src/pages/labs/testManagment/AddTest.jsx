import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createTest, getTestById, updateTest, selectSelectedTest, selectGetByIdLoading, selectUpdateLoading, selectUpdateError } from '../../../features/testManagment/testSlice';
import { InputField, RadioGroup } from '../../../components/common/FormFields';
import { FormSection, FormGrid } from '../../../components/common/FormSection';
import { Button, ButtonGroup } from '../../../components/common/Buttons';
import { FaVial, FaClipboardList, FaListUl, FaUserTie, FaUserFriends } from 'react-icons/fa';
import { AiOutlineClockCircle } from 'react-icons/ai';

const initialField = () => ({
  name: '',
  unit: '',
  normalRange: {
    male: { min: '', max: '' },
    female: { min: '', max: '' },
  },
});

const unitsList = [
  '', 'mg/dL', 'g/dL', 'mmol/L', 'IU/L', 'U/L', 'pg/mL', 'ng/mL', 'mEq/L', 'cells/mcL', 'mL/min', 'mm/hr', 'g/L', 'mIU/mL', 'μg/dL', 'μmol/L', 'mU/L', 'fL', 'pH', 'other'
];

const reportTimeOptions = [
  { label: 'Hours', options: ['24 hours', '48 hours', '72 hours'] },
  { label: 'Days', options: ['1 day', '2 days', '3 days', '5 days', '7 days'] },
  { label: '', options: ['Other'] },
];

const LabTestForm = ({ mode = "create" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const selectedTest = useSelector(selectSelectedTest);
  const getByIdLoading = useSelector(selectGetByIdLoading);
  const updateLoading = useSelector(selectUpdateLoading);
  const updateError = useSelector(selectUpdateError);

  const [formData, setFormData] = useState({
    testName: '',
    testCode: '',
    testPrice: '',
    requiresFasting: false,
    reportDeliveryTime: '',
  });
  const [fields, setFields] = useState([initialField()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedReportTime, setSelectedReportTime] = useState('');
  const [customReportTime, setCustomReportTime] = useState('');
  const [touched, setTouched] = useState({});
  const [fieldTouched, setFieldTouched] = useState({}); // for dynamic fields

  // Fetch test data if in edit mode using Redux thunk
  React.useEffect(() => {
    if (id) {
      dispatch(getTestById(id));
    }
  }, [id, dispatch]);

  // When selectedTest changes, update local state
  React.useEffect(() => {
    if (selectedTest && id) {
      setFormData({
        testName: selectedTest.testName || '',
        testCode: selectedTest.testCode || '',
        testPrice: selectedTest.testPrice || '',
        requiresFasting: selectedTest.requiresFasting || false,
        reportDeliveryTime: selectedTest.reportDeliveryTime || '',
      });
      setFields(Array.isArray(selectedTest.fields) && selectedTest.fields.length > 0 ? selectedTest.fields.map(f => ({
        name: f.name || '',
        unit: f.unit || '',
        normalRange: {
          male: { min: f.normalRange?.male?.min || '', max: f.normalRange?.male?.max || '' },
          female: { min: f.normalRange?.female?.min || '', max: f.normalRange?.female?.max || '' },
        },
      })) : [initialField()]);
      // Set report time select
      if (selectedTest.reportDeliveryTime) {
        const found = reportTimeOptions.some(group => group.options.includes(selectedTest.reportDeliveryTime));
        if (found) {
          setSelectedReportTime(selectedTest.reportDeliveryTime);
          setCustomReportTime('');
        } else {
          setSelectedReportTime('Other');
          setCustomReportTime(selectedTest.reportDeliveryTime);
        }
      }
    }
  }, [selectedTest, id]);

  // Enhanced Validation
  const validate = (data = formData, testFields = fields) => {
    const errs = {};
    // Main fields
    if (!data.testName) errs.testName = 'Test Name is required';
    if (!data.testCode) errs.testCode = 'Test Code is required';
    if (!data.testPrice || isNaN(data.testPrice) || Number(data.testPrice) < 0) errs.testPrice = 'Valid Test Price is required';
    if (data.testPrice && Number(data.testPrice) < 0) errs.testPrice = 'Test Price cannot be negative';
    let reportTimeToValidate = selectedReportTime === 'Other' ? customReportTime : selectedReportTime;
    if (!reportTimeToValidate) {
      errs.reportDeliveryTime = 'Report Delivery Time is required';
    } else {
      const durationPattern = /^\s*\d+\s*(hours?|days?)\s*$/i;
      if (!durationPattern.test(reportTimeToValidate)) {
        errs.reportDeliveryTime = "Enter a valid duration, e.g. '24 hours' or '2 days'";
      }
    }
    // Dynamic fields
    testFields.forEach((f, i) => {
      if (!f.name) errs[`field-name-${i}`] = 'Field name required';
      if (!f.unit) errs[`field-unit-${i}`] = 'Unit is required';
      if (f.normalRange) {
        ['male', 'female'].forEach(gender => {
          if (f.normalRange[gender]) {
            const minVal = f.normalRange[gender].min;
            const maxVal = f.normalRange[gender].max;
            if (minVal && isNaN(minVal)) errs[`field-${i}-${gender}-min`] = 'Must be a number';
            if (maxVal && isNaN(maxVal)) errs[`field-${i}-${gender}-max`] = 'Must be a number';
            if (minVal && Number(minVal) < 0) errs[`field-${i}-${gender}-min`] = 'Cannot be negative';
            if (maxVal && Number(maxVal) < 0) errs[`field-${i}-${gender}-max`] = 'Cannot be negative';
          }
        });
      }
    });
    return errs;
  };

  // Validate on every change
  React.useEffect(() => {
    setErrors(validate());
  }, [formData, fields, selectedReportTime, customReportTime]);

  // Handlers
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleBlur = e => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleFieldChange = (idx, key, value, gender, minmax) => {
    setFields(prev => prev.map((f, i) => {
      if (i !== idx) return f;
      if (key === 'name' || key === 'unit') return { ...f, [key]: value };
      if (key === 'normalRange') {
        return {
          ...f,
          normalRange: {
            ...f.normalRange,
            [gender]: {
              ...f.normalRange[gender],
              [minmax]: value
            }
          }
        };
      }
      return f;
    }));
    setFieldTouched(prev => ({ ...prev, [`${key}-${idx}${gender ? '-' + gender : ''}${minmax ? '-' + minmax : ''}`]: true }));
  };

  const handleFieldBlur = (idx, key, gender, minmax) => {
    setFieldTouched(prev => ({ ...prev, [`${key}-${idx}${gender ? '-' + gender : ''}${minmax ? '-' + minmax : ''}`]: true }));
  };

  const addField = () => setFields(prev => [...prev, initialField()]);
  const removeField = idx => setFields(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const handleReportTimeChange = (e) => {
    setSelectedReportTime(e.target.value);
    if (e.target.value !== 'Other') {
      setCustomReportTime('');
      setFormData(prev => ({ ...prev, reportDeliveryTime: e.target.value }));
    } else {
      setFormData(prev => ({ ...prev, reportDeliveryTime: '' }));
    }
  };

  const handleCustomReportTimeChange = (e) => {
    setCustomReportTime(e.target.value);
    setFormData(prev => ({ ...prev, reportDeliveryTime: e.target.value }));
  };

  const resetForm = () => {
    setFormData({
      testName: '', testCode: '', testPrice: '', requiresFasting: false, reportDeliveryTime: ''
    });
    setFields([initialField()]);
    setErrors({});
  };

  const handleSave = async (e, print = false) => {
    e.preventDefault();
    const currentErrors = validate();
    setErrors(currentErrors);
    setTouched({ testName: true, testCode: true, testPrice: true, reportDeliveryTime: true });
    setFieldTouched(Object.fromEntries(fields.flatMap((f, i) => [
      [`name-${i}`, true],
      [`unit-${i}`, true],
      [`normalRange-${i}-male-min`, true],
      [`normalRange-${i}-male-max`, true],
      [`normalRange-${i}-female-min`, true],
      [`normalRange-${i}-female-max`, true],
    ])));
    if (Object.keys(currentErrors).length > 0) {
      toast.error('Please fix form errors.');
      return;
    }
    setIsSubmitting(true);
    const payload = {
      ...formData,
      testPrice: Number(formData.testPrice),
      fields: fields.map(f => ({
        name: f.name,
        unit: f.unit,
        normalRange: {
          male: {
            min: f.normalRange.male.min ? Number(f.normalRange.male.min) : undefined,
            max: f.normalRange.male.max ? Number(f.normalRange.male.max) : undefined,
          },
          female: {
            min: f.normalRange.female.min ? Number(f.normalRange.female.min) : undefined,
            max: f.normalRange.female.max ? Number(f.normalRange.female.max) : undefined,
          },
        },
      })),
    };
    try {
      if (id) {
        // Update mode using Redux thunk
        const resultAction = await dispatch(updateTest({ id, payload }));
        if (updateTest.fulfilled.match(resultAction)) {
          toast.success('Test updated successfully!');
          if (print) setTimeout(() => window.print(), 500);
          else navigate('../all-tests');
        } else {
          const errorMsg = resultAction.payload || resultAction.error?.message || "Test update failed!";
          toast.error(errorMsg);
        }
      } else {
        // Create mode (already using thunk)
        const resultAction = await dispatch(createTest(payload));
        if (createTest.fulfilled.match(resultAction)) {
          toast.success("Test created successfully!");
          resetForm();
          if (print) setTimeout(() => window.print(), 500);
          else navigate('../all-tests');
        } else {
          const errorMsg = resultAction.payload || resultAction.error?.message || "Test creation failed!";
          toast.error(errorMsg);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full h-full bg-gradient-to-br from-primary-50 via-teal-50 to-white flex flex-col justify-center items-center p-0 animate-fadein">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-primary-600 rounded-md text-white px-6 py-8 shadow-md">
            <div className="flex items-center">
              <div className="h-12 w-1 bg-primary-300 mr-4 rounded-full"></div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2"><FaVial className="text-white" /> {mode === 'create' ? 'New Lab Test' : 'Edit Lab Test'}</h1>
                <p className="text-primary-100 mt-1">Please fill in the lab test details below</p>
              </div>
              </div>
              </div>
          <form onSubmit={e => handleSave(e, false)} className="p-6">
            <FormSection title="Test Information">
              <FormGrid>
                <div>
                  <InputField name="testName" label="Test Name" icon="userMd" value={formData.testName} onChange={handleChange} onBlur={handleBlur} placeholder="Enter Test Name" required className={errors.testName && touched.testName ? 'border-red-500' : ''} />
                  {errors.testName && touched.testName && <span className="text-red-500 text-xs block mt-1">{errors.testName}</span>}
              </div>
              <div>
                  <InputField name="testCode" label="Test Code" icon="number" value={formData.testCode} onChange={handleChange} onBlur={handleBlur} placeholder="Enter Test Code" required className={errors.testCode && touched.testCode ? 'border-red-500' : ''} />
                  {errors.testCode && touched.testCode && <span className="text-red-500 text-xs block mt-1">{errors.testCode}</span>}
              </div>
              <div>
                  <InputField name="testPrice" label="Test Price" icon="dollar" type="number" min="0" value={formData.testPrice} onChange={handleChange} onBlur={handleBlur} placeholder="Enter Test Price" required className={errors.testPrice && touched.testPrice ? 'border-red-500' : ''} />
                  {errors.testPrice && touched.testPrice && <span className="text-red-500 text-xs block mt-1">{errors.testPrice}</span>}
                </div>
                <div>
                  {/* Small Test Report Time Field with icon inside */}
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <span className="flex items-center gap-1"><AiOutlineClockCircle className="text-primary-600 text-base" /> Report Time <span className="text-red-500">*</span></span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AiOutlineClockCircle className="text-primary-600" />
                    </span>
                    <select
                      className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm ${errors.reportDeliveryTime && touched.reportDeliveryTime ? 'border-red-500' : ''}`}
                      value={selectedReportTime}
                      onChange={handleReportTimeChange}
                      onBlur={() => setTouched(prev => ({ ...prev, reportDeliveryTime: true }))}
                      aria-label="Report Delivery Time"
                    >
                      <option value="">Select</option>
                      {reportTimeOptions.map((group, idx) => (
                        <React.Fragment key={group.label || idx}>
                          {group.label && <option disabled className="bg-gray-100 text-gray-500">--- {group.label} ---</option>}
                          {group.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </React.Fragment>
                      ))}
                    </select>
                    {selectedReportTime === 'Other' && (
                      <input
                        name="customReportTime"
                        type="text"
                        className={`block w-full pl-10 pr-3 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm ${errors.reportDeliveryTime && touched.reportDeliveryTime ? 'border-red-500' : ''}`}
                        value={customReportTime}
                        onChange={handleCustomReportTimeChange}
                        onBlur={() => setTouched(prev => ({ ...prev, reportDeliveryTime: true }))}
                        placeholder="e.g. 24 hours, 2 days"
                        autoFocus
                      />
                    )}
                  </div>
                  <span className="text-xs text-gray-500 block mt-1">Allowed: <b>24 hours</b>, <b>2 days</b></span>
                  {errors.reportDeliveryTime && touched.reportDeliveryTime && <span className="text-red-500 text-xs block mt-1">{errors.reportDeliveryTime}</span>}
                </div>
                <div className="col-span-2">
                  <RadioGroup
                    name="requiresFasting"
                    label="Requires Fasting?"
                    value={formData.requiresFasting}
                    onChange={e => { setFormData(prev => ({ ...prev, requiresFasting: e.target.value === 'true' })); setTouched(prev => ({ ...prev, requiresFasting: true })); }}
                    options={[
                      { value: true, label: 'Yes' },
                      { value: false, label: 'No' },
                    ]}
                    className="col-span-2"
                  />
              </div>
              </FormGrid>
            </FormSection>

            <FormSection title="Test Fields">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2"><FaListUl className="text-primary-600" /> Fields</h2>
                <Button type="button" variant="primary" onClick={addField}>+ Add Field</Button>
              </div>
              <div className="space-y-10">
                {fields.map((field, idx) => (
                  <div
                    key={idx}
                    className="relative bg-gradient-to-br from-primary-50 via-white to-teal-50 border border-primary-200 rounded-2xl shadow-lg p-8 flex flex-col gap-8 transition-all duration-200 hover:shadow-xl"
                  >
                    <div className="absolute top-3 right-3">
                      <Button type="button" variant="danger" size="small" onClick={() => removeField(idx)}>
                        ✕
                      </Button>
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <FaClipboardList className="text-primary-500 text-xl" />
                      <span className="font-bold text-primary-700 text-lg">Test Field #{idx + 1}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <InputField
                          name={`field-name-${idx}`}
                          label="Field Name"
                          icon="userMd"
                          value={field.name}
                          onChange={e => handleFieldChange(idx, 'name', e.target.value)}
                          onBlur={() => handleFieldBlur(idx, 'name')}
                          placeholder="e.g. Hemoglobin"
                          required
                          className={errors[`field-name-${idx}`] && fieldTouched[`name-${idx}`] ? 'border-red-500' : ''}
                        />
                        {errors[`field-name-${idx}`] && fieldTouched[`name-${idx}`] && <span className="text-red-500 text-xs block mt-1">{errors[`field-name-${idx}`]}</span>}
                      </div>
                      <div>
                        <InputField
                          name={`field-unit-${idx}`}
                          label="Unit"
                          icon="number"
                          type="select"
                          value={field.unit}
                          onChange={e => handleFieldChange(idx, 'unit', e.target.value)}
                          onBlur={() => handleFieldBlur(idx, 'unit')}
                          options={unitsList}
                          placeholder="Select Unit"
                          className={errors[`field-unit-${idx}`] && fieldTouched[`unit-${idx}`] ? 'border-red-500' : ''}
                        />
                        {errors[`field-unit-${idx}`] && fieldTouched[`unit-${idx}`] && <span className="text-red-500 text-xs block mt-1">{errors[`field-unit-${idx}`]}</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                      <div>
                        <InputField
                          name={`field-male-min-${idx}`}
                          label="Normal Range (Male) Min"
                          icon="man"
                          type="number"
                          min={0}
                          value={field.normalRange.male.min}
                          onChange={e => {
                            if (e.target.value === '' || Number(e.target.value) >= 0) handleFieldChange(idx, 'normalRange', e.target.value, 'male', 'min');
                          }}
                          onBlur={() => handleFieldBlur(idx, 'normalRange', 'male', 'min')}
                          placeholder="Min"
                          className={errors[`field-${idx}-male-min`] && fieldTouched[`normalRange-${idx}-male-min`] ? 'border-red-500' : ''}
                        />
                        {errors[`field-${idx}-male-min`] && fieldTouched[`normalRange-${idx}-male-min`] && <span className="text-red-500 text-xs block mt-1">{errors[`field-${idx}-male-min`]}</span>}
                      </div>
                      <div>
                        <InputField
                          name={`field-male-max-${idx}`}
                          label="Normal Range (Male) Max"
                          icon="man"
                          type="number"
                          min={0}
                          value={field.normalRange.male.max}
                          onChange={e => {
                            if (e.target.value === '' || Number(e.target.value) >= 0) handleFieldChange(idx, 'normalRange', e.target.value, 'male', 'max');
                          }}
                          onBlur={() => handleFieldBlur(idx, 'normalRange', 'male', 'max')}
                          placeholder="Max"
                          className={errors[`field-${idx}-male-max`] && fieldTouched[`normalRange-${idx}-male-max`] ? 'border-red-500' : ''}
                        />
                        {errors[`field-${idx}-male-max`] && fieldTouched[`normalRange-${idx}-male-max`] && <span className="text-red-500 text-xs block mt-1">{errors[`field-${idx}-male-max`]}</span>}
                      </div>
                      <div>
                        <InputField
                          name={`field-female-min-${idx}`}
                          label="Normal Range (Female) Min"
                          icon="team"
                          type="number"
                          min={0}
                          value={field.normalRange.female.min}
                          onChange={e => {
                            if (e.target.value === '' || Number(e.target.value) >= 0) handleFieldChange(idx, 'normalRange', e.target.value, 'female', 'min');
                          }}
                          onBlur={() => handleFieldBlur(idx, 'normalRange', 'female', 'min')}
                          placeholder="Min"
                          className={errors[`field-${idx}-female-min`] && fieldTouched[`normalRange-${idx}-female-min`] ? 'border-red-500' : ''}
                        />
                        {errors[`field-${idx}-female-min`] && fieldTouched[`normalRange-${idx}-female-min`] && <span className="text-red-500 text-xs block mt-1">{errors[`field-${idx}-female-min`]}</span>}
                      </div>
                      <div>
                        <InputField
                          name={`field-female-max-${idx}`}
                          label="Normal Range (Female) Max"
                          icon="team"
                          type="number"
                          min={0}
                          value={field.normalRange.female.max}
                          onChange={e => {
                            if (e.target.value === '' || Number(e.target.value) >= 0) handleFieldChange(idx, 'normalRange', e.target.value, 'female', 'max');
                          }}
                          onBlur={() => handleFieldBlur(idx, 'normalRange', 'female', 'max')}
                          placeholder="Max"
                          className={errors[`field-${idx}-female-max`] && fieldTouched[`normalRange-${idx}-female-max`] ? 'border-red-500' : ''}
                        />
                        {errors[`field-${idx}-female-max`] && fieldTouched[`normalRange-${idx}-female-max`] && <span className="text-red-500 text-xs block mt-1">{errors[`field-${idx}-female-max`]}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FormSection>

            <div className="pt-6 border-t border-primary-100 mt-6">
              <ButtonGroup>
                <Button
                  variant="secondary"
                  onClick={() => navigate('../all-tests')}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  isSubmitting={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : mode === "create" ? 'Save Only' : 'Update Only'}
                </Button>
                {/* <Button
                  variant="success"
                  type="button"
                  onClick={e => handleSave(e, true)}
                  isSubmitting={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : mode === "create" ? 'Save & Print' : 'Update & Print'}
                </Button> */}
              </ButtonGroup>
            </div>
          </form>
          </div>
      </div>
    </div>
  );
};

export default LabTestForm;
