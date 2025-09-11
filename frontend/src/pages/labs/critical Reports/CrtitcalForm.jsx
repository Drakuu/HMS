import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createCriticalResult,
  fetchCriticalResults,
  updateCriticalResult,
  deleteCriticalResult,
} from '../../../features/critcalResult/criticalSlice';
import { fetchPatientByMRNo } from '../../../features/patientTest/patientTestSlice';
import PrintCriticalForm from './PrintCriticalForm';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker'; // ✅ new
import 'react-datepicker/dist/react-datepicker.css'; // ✅ new
import { format } from 'date-fns';
import { Filter } from 'lucide-react';

const CrtitcalForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    criticalResults = [],
    loading,
    error,
    success,
  } = useSelector((state) => state.criticalResult);
  const {
    patient,
    isLoading: patientLoading,
    error: patientError,
  } = useSelector((state) => state.patientTest);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [showPrintForm, setShowPrintForm] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [preset, setPreset] = useState('ALL');

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    patientName: '',
    gender: '',
    age: '',
    mrNo: '',
    sampleCollectionTime: '',
    reportDeliveryTime: '',
    informedTo: '',
    contactNo: '',
  });

  const [tests, setTests] = useState([{ testName: '', criticalValue: '' }]);
  const [labTechSignature, setLabTechSignature] = useState('');
  const [doctorSignature, setDoctorSignature] = useState('');
  const [showSummaryDatePicker, setShowSummaryDatePicker] = useState(false);
  const [summaryDates, setSummaryDates] = useState({
    startDate: new Date(),
    endDate: null,
  });

  // 📅 helpers to compute ranges for presets
  const startOfDay = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const endOfDay = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  const getPresetRange = (key) => {
    const now = new Date();
    switch (key) {
      case 'TODAY': {
        return { start: startOfDay(now), end: endOfDay(now) };
      }
      case 'YESTERDAY': {
        const y = new Date(now);
        y.setDate(now.getDate() - 1);
        return { start: startOfDay(y), end: endOfDay(y) };
      }
      case '7D': {
        const s = new Date(now);
        s.setDate(now.getDate() - 6); // include today = 7 days window
        return { start: startOfDay(s), end: endOfDay(now) };
      }
      case '30D': {
        const s = new Date(now);
        s.setDate(now.getDate() - 29); // include today
        return { start: startOfDay(s), end: endOfDay(now) };
      }
      default:
        return null; // ALL
    }
  };

  // ⭐ required label helper (adds red * BEFORE label)
  const req = (label) => (
    <span className="inline-flex items-center gap-1">
      <span>{label}</span>
      <span className="text-red-600">*</span>
    </span>
  );

  // 🧮 combine text search + date preset filtering
  const filteredResults = useMemo(() => {
    const list = Array.isArray(criticalResults) ? criticalResults : [];
    const q = search.trim().toLowerCase();
    const range = getPresetRange(preset);

    return list.filter((r) => {
      // text search across a few fields
      const haystack = [
        r?.mrNo,
        r?.patientName,
        r?.contactNo,
        ...(Array.isArray(r?.tests) ? r.tests.map((t) => t?.testName) : []),
      ]
        .filter(Boolean)
        .map(String)
        .join(' ')
        .toLowerCase();

      const matchesText = !q || haystack.includes(q);

      // date check
      if (!range) return matchesText; // ALL
      const d = r?.date ? new Date(r.date) : null;
      const inRange = d && !isNaN(d) && d >= range.start && d <= range.end;

      return matchesText && inRange;
    });
  }, [criticalResults, search, preset]);

  // fetching critical data from db
  useEffect(() => {
    dispatch(fetchCriticalResults());
  }, [dispatch]);

  useEffect(() => {
    if (success && !loading) {
      resetForm();
      setIsModalOpen(false);
    }
  }, [success, loading]);

  useEffect(() => {
    if (patient) {
      setForm((prev) => ({
        ...prev,
        patientName: patient.name || '',
        gender: patient.gender || '',
        age: patient.age || '',
        contactNo: patient.contact || '',
        sampleCollectionTime: patient.sampleCollectionTime || '',
        reportDeliveryTime: patient.reportDeliveryTime || '',
        informedTo: patient.informedTo || '',
      }));
    }
  }, [patient]);

  useEffect(() => {
    if (editingResult) {
      setForm({
        date: editingResult.date || new Date().toISOString().split('T')[0],
        patientName: editingResult.patientName || '',
        gender: editingResult.gender || '',
        age: editingResult.age || '',
        contactNo: editingResult.contactNo || '',
        mrNo: editingResult.mrNo || '',
        sampleCollectionTime: editingResult.sampleCollectionTime || '',
        reportDeliveryTime: editingResult.reportDeliveryTime || '',
        informedTo: editingResult.informedTo || '',
      });
      setTests(editingResult.tests || [{ testName: '', criticalValue: '' }]);
      setLabTechSignature(editingResult.labTechSignature || '');
      setDoctorSignature(editingResult.doctorSignature || '');
    }
  }, [editingResult]);

  const resetForm = () => {
    setForm({
      date: new Date().toISOString().split('T')[0],
      patientName: '',
      gender: '',
      age: '',
      mrNo: '',
      contactNo: '',
      sampleCollectionTime: '',
      reportDeliveryTime: '',
      informedTo: '',
    });
    setTests([{ testName: '', criticalValue: '' }]);
    setLabTechSignature('');
    setDoctorSignature('');
    setEditingResult(null);
  };

  const openModal = (result = null) => {
    if (result) {
      setEditingResult(result);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingResult(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFetchPatient = () => {
    if (form.mrNo.trim() !== '') {
      dispatch(fetchPatientByMRNo(form.mrNo));
    }
  };

  const handleTestChange = (idx, e) => {
    const { name, value } = e.target;
    setTests((prev) =>
      prev.map((test, i) => (i === idx ? { ...test, [name]: value } : test))
    );
  };

  const addTestRow = () => {
    setTests([...tests, { testName: '', criticalValue: '' }]);
  };

  const removeTestRow = (idx) => {
    setTests(tests.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const criticalResultData = {
      ...form,
      tests: tests.filter((test) => test.testName && test.criticalValue),
      labTechSignature,
      doctorSignature,
    };

    if (editingResult) {
      dispatch(
        updateCriticalResult({
          id: editingResult._id,
          data: criticalResultData,
        })
      );
    } else {
      dispatch(createCriticalResult(criticalResultData));
    }
  };

  const handleDelete = (id) => {
    if (
      window.confirm('Are you sure you want to delete this critical result?')
    ) {
      dispatch(deleteCriticalResult(id));
    }
  };

  const handlePrint = (result) => {
    setPrintData(result);
    setShowPrintForm(true);
    setTimeout(() => {
      window.print();
      setShowPrintForm(false);
    }, 500);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className=" mx-auto bg-white p-6 rounded-md shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold ">Critical Results Management</h1>

          <div className="gap-2 flex relative">
            <button
              onClick={() => openModal()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded"
            >
              Add New Critical Result
            </button>

            {/*  */}
            <button
              onClick={() => setShowSummaryDatePicker(true)}
              className="text-white font-medium py-2 px-4 rounded hover:opacity-90 transition bg-[#009689]"
            >
              View/Download Summary
            </button>
            {showSummaryDatePicker && (
              <div className="absolute top-full mt-2 z-50 bg-white border border-gray-300 rounded-lg p-4 shadow-lg right-0">
                <DatePicker
                  selectsRange
                  startDate={summaryDates.startDate}
                  endDate={summaryDates.endDate}
                  onChange={(dates) => {
                    const [start, end] = dates;
                    setSummaryDates({
                      startDate: start,
                      endDate: end,
                    });
                  }}
                  isClearable
                  inline
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={() => setShowSummaryDatePicker(false)}
                    className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const { startDate, endDate } = summaryDates;
                      const formatDate = (date) => format(date, 'yyyy-MM-dd');

                      if (startDate && endDate) {
                        navigate(
                          `/lab/critical-report-Summery/${formatDate(
                            startDate
                          )}_${formatDate(endDate)}`
                        );
                      } else if (startDate) {
                        navigate(
                          `/lab/critical-report-Summery/${formatDate(
                            startDate
                          )}`
                        );
                      } else {
                        alert('Please select at least one date.');
                      }

                      setShowSummaryDatePicker(false);
                    }}
                    className="px-4 py-2 text-sm text-white bg-[#009689] rounded hover:bg-opacity-90"
                  >
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 w-full">
          {/* 🔎 Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search MR No, name, test..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-cyan-500"
          />

          {/* 🗂️ Filters dropdown */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter size={16} />
              Filters
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                {[
                  { k: 'ALL', label: 'All Time' },
                  { k: 'TODAY', label: 'Today' },
                  { k: 'YESTERDAY', label: 'Yesterday' },
                  { k: '7D', label: 'Last 7 Days' },
                  { k: '30D', label: 'Last 30 Days' },
                ].map((opt) => (
                  <button
                    key={opt.k}
                    onClick={() => {
                      setPreset(opt.k);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                      preset === opt.k ? 'bg-cyan-50 text-cyan-700' : ''
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {criticalResults.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">
              No critical results found. Create your first one!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    MR No
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Contact no
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Tests
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResults.map((result) => (
                  <tr key={result._id} className="hover:bg-gray-50">
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.date).toLocaleDateString('en-CA')}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.mrNo}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                      {result.patientName}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                      {result.contactNo}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500">
                      {result.tests && result.tests.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {result.tests.slice(0, 2).map((test, idx) => (
                            <li key={idx}>
                              {test.testName}:{test.criticalValue}
                            </li>
                          ))}
                          {result.tests.length > 2 && (
                            <li>...and {result.tests.length - 2} more</li>
                          )}
                        </ul>
                      ) : (
                        'No tests'
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handlePrint(result)}
                        className="text-cyan-600 hover:text-cyan-900 mr-3"
                      >
                        Print
                      </button>
                      <button
                        onClick={() => openModal(result)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(result._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="critical-modal-title"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeModal}
            />

            {/* Panel */}
            <div
              className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/5
                 max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-primary-600 backdrop-blur px-5 sm:px-6 py-4 flex items-center justify-between">
                <h3
                  id="critical-modal-title"
                  className="text-lg sm:text-xl font-semibold text-white"
                >
                  {editingResult
                    ? 'Edit Critical Result'
                    : 'Add New Critical Result'}
                </h3>
                <button
                  onClick={closeModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-5 sm:px-6 py-5 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Top grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {req('Date')}
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {req('MR No')}
                      </label>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="text"
                          name="mrNo"
                          value={form.mrNo}
                          onChange={handleChange}
                          required
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={handleFetchPatient}
                          disabled={patientLoading}
                          className="whitespace-nowrap rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60"
                        >
                          {patientLoading ? '...' : 'Fetch'}
                        </button>
                      </div>
                      {patientError && (
                        <p className="mt-1 text-sm text-red-600">
                          {patientError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {req('Patient Name')}
                      </label>
                      <input
                        type="text"
                        name="patientName"
                        value={form.patientName}
                        onChange={handleChange}
                        required
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {req('Sample Collection Time')}
                      </label>
                      <input
                        type="text"
                        name="sampleCollectionTime"
                        value={form.sampleCollectionTime}
                        onChange={handleChange}
                        placeholder="e.g. 10:30 AM"
                        required
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {req('Age')}
                      </label>
                      <input
                        type="text"
                        name="age"
                        value={form.age}
                        onChange={handleChange}
                        placeholder="e.g. 35 years"
                        required
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {req('Report Delivery Time')}
                      </label>
                      <input
                        type="text"
                        name="reportDeliveryTime"
                        value={form.reportDeliveryTime}
                        onChange={handleChange}
                        placeholder="e.g. 12:15 PM"
                        required
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {req('Contact No')}
                      </label>
                      <input
                        type="text"
                        name="contactNo"
                        value={form.contactNo}
                        onChange={handleChange}
                        placeholder="e.g. 0300 0000000"
                        required
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="">
                      <label className="block text-sm font-medium text-gray-700">
                        {req('Informed To')}
                      </label>
                      <input
                        type="text"
                        name="informedTo"
                        value={form.informedTo}
                        onChange={handleChange}
                        required
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Tests section */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        {req('Tests')}
                      </label>
                      <button
                        type="button"
                        onClick={addTestRow}
                        className="text-sm font-medium text-cyan-700 hover:text-cyan-900"
                      >
                        + Add Test
                      </button>
                    </div>

                    <div className="space-y-2">
                      {tests.map((test, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <input
                            type="text"
                            name="testName"
                            value={test.testName}
                            onChange={(e) => handleTestChange(idx, e)}
                            placeholder="Test Name"
                            required
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-cyan-500"
                          />
                          <input
                            type="text"
                            name="criticalValue"
                            value={test.criticalValue}
                            onChange={(e) => handleTestChange(idx, e)}
                            placeholder="Critical Value"
                            required
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-cyan-500"
                          />
                          {tests.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTestRow(idx)}
                              className="h-10 w-10 rounded-lg text-red-600 hover:bg-red-50"
                              aria-label="Remove test row"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {req('Lab Technician Signature')}
                      </label>
                      <input
                        type="text"
                        value={labTechSignature}
                        onChange={(e) => setLabTechSignature(e.target.value)}
                        required
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {req('Doctor Signature')}
                      </label>
                      <input
                        type="text"
                        value={doctorSignature}
                        onChange={(e) => setDoctorSignature(e.target.value)}
                        required
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="sticky bottom-0 -mx-5 sm:-mx-6 px-5 sm:px-6 py-4 bg-white/90 backdrop-blur border-t border-gray-300 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
                    >
                      {loading
                        ? 'Saving...'
                        : editingResult
                        ? 'Update'
                        : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Print Preview */}
        {showPrintForm && printData && (
          <div className="fixed inset-0 z-50 bg-white p-8">
            <PrintCriticalForm
              form={printData}
              tests={printData.tests}
              labTechSignature={printData.labTechSignature}
              doctorSignature={printData.doctorSignature}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CrtitcalForm;
