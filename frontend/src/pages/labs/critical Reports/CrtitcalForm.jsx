import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCriticalResult,
  fetchCriticalResults,
  updateCriticalResult,
  deleteCriticalResult
} from "../../../features/critcalResult/criticalSlice";
import { fetchPatientByMRNo } from "../../../features/patientTest/patientTestSlice";
import PrintCriticalForm from "./PrintCriticalForm";

const CrtitcalForm = () => {
  const dispatch = useDispatch();
  const { criticalResults, loading, error, success } = useSelector(
    (state) => state.criticalResult
  );
  const { patient, isLoading: patientLoading, error: patientError } = useSelector(
    (state) => state.patientTest
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [showPrintForm, setShowPrintForm] = useState(false);
  const [printData, setPrintData] = useState(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    patientName: "",
    gender: "",
    age: "",
    mrNo: "",
    sampleCollectionTime: "",
    reportDeliveryTime: "",
    informedTo: "",
  });

  const [tests, setTests] = useState([{ testName: "", criticalValue: "" }]);
  const [labTechSignature, setLabTechSignature] = useState("");
  const [doctorSignature, setDoctorSignature] = useState("");

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
        patientName: patient.name || "",
        gender: patient.gender || "",
        age: patient.age || "",
        sampleCollectionTime: patient.sampleCollectionTime || "",
        reportDeliveryTime: patient.reportDeliveryTime || "",
        informedTo: patient.informedTo || "",
      }));
    }
  }, [patient]);

  useEffect(() => {
    if (editingResult) {
      setForm({
        date: editingResult.date || new Date().toISOString().split('T')[0],
        patientName: editingResult.patientName || "",
        gender: editingResult.gender || "",
        age: editingResult.age || "",
        mrNo: editingResult.mrNo || "",
        sampleCollectionTime: editingResult.sampleCollectionTime || "",
        reportDeliveryTime: editingResult.reportDeliveryTime || "",
        informedTo: editingResult.informedTo || "",
      });
      setTests(editingResult.tests || [{ testName: "", criticalValue: "" }]);
      setLabTechSignature(editingResult.labTechSignature || "");
      setDoctorSignature(editingResult.doctorSignature || "");
    }
  }, [editingResult]);

  const resetForm = () => {
    setForm({
      date: new Date().toISOString().split('T')[0],
      patientName: "",
      gender: "",
      age: "",
      mrNo: "",
      sampleCollectionTime: "",
      reportDeliveryTime: "",
      informedTo: "",
    });
    setTests([{ testName: "", criticalValue: "" }]);
    setLabTechSignature("");
    setDoctorSignature("");
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
    if (form.mrNo.trim() !== "") {
      dispatch(fetchPatientByMRNo(form.mrNo));
    }
  };

  const handleTestChange = (idx, e) => {
    const { name, value } = e.target;
    setTests((prev) =>
      prev.map((test, i) =>
        i === idx ? { ...test, [name]: value } : test
      )
    );
  };

  const addTestRow = () => {
    setTests([...tests, { testName: "", criticalValue: "" }]);
  };

  const removeTestRow = (idx) => {
    setTests(tests.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const criticalResultData = {
      ...form,
      tests: tests.filter(test => test.testName && test.criticalValue),
      labTechSignature,
      doctorSignature
    };

    if (editingResult) {
      dispatch(updateCriticalResult({ id: editingResult._id, data: criticalResultData }));
    } else {
      dispatch(createCriticalResult(criticalResultData));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this critical result?")) {
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
      <div className=" mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-cyan-800">Critical Results Management</h1>
          <button
            onClick={() => openModal()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded"
          >
            Add New Critical Result
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {criticalResults.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No critical results found. Create your first one!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-cyan-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-800 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-800 uppercase tracking-wider">MR No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-800 uppercase tracking-wider">Patient Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-800 uppercase tracking-wider">Tests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-800 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {criticalResults.map((result) => (
                  <tr key={result._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.date).toLocaleDateString("en-CA")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.mrNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.patientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {result.tests && result.tests.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {result.tests.slice(0, 2).map((test, idx) => (
                            <li key={idx}>{test.testName}:{test.criticalValue}</li>
                          ))}
                          {result.tests.length > 2 && <li>...and {result.tests.length - 2} more</li>}
                        </ul>
                      ) : (
                        "No tests"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
          <div className="fixed inset-0 bg-gray-200/50 backdrop-blur-lg
           overflow-y-auto h-full w-full z-50">
            <div
              className=" 
      relative top-10 mx-auto p-5 border 
      w-11/12 sm:w-4/5 md:w-3/4 lg:w-2/3 xl:max-w-2xl
      min-h-[400px] 
      shadow-lg rounded-md bg-white
    "
            >
              <div className="mt-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <h3 className="text-xl font-semibold text-cyan-800">
                    {editingResult ? "Edit Critical Result" : "Add New Critical Result"}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4 min-h[30rem] overflow-y-auto px-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">MR No</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="text"
                          name="mrNo"
                          value={form.mrNo}
                          onChange={handleChange}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={handleFetchPatient}
                          disabled={patientLoading}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                        >
                          {patientLoading ? "..." : "Fetch"}
                        </button>
                      </div>
                      {patientError && <p className="mt-1 text-sm text-red-600">{patientError}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                      <input
                        type="text"
                        name="patientName"
                        value={form.patientName}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sample Collection Time</label>
                      <input
                        type="text"
                        name="sampleCollectionTime"
                        value={form.sampleCollectionTime}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Age</label>
                      <input
                        type="text"
                        name="age"
                        value={form.age}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Report Delivery Time</label>
                      <input
                        type="text"
                        name="reportDeliveryTime"
                        value={form.reportDeliveryTime}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Informed To</label>
                      <input
                        type="text"
                        name="informedTo"
                        value={form.informedTo}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Tests</label>
                      <button
                        type="button"
                        onClick={addTestRow}
                        className="text-sm text-cyan-600 hover:text-cyan-800"
                      >
                        + Add Test
                      </button>
                    </div>
                    <div className="space-y-2">
                      {tests.map((test, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <input
                            type="text"
                            name="testName"
                            value={test.testName}
                            onChange={(e) => handleTestChange(idx, e)}
                            placeholder="Test Name"
                            className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            required
                          />
                          <input
                            type="text"
                            name="criticalValue"
                            value={test.criticalValue}
                            onChange={(e) => handleTestChange(idx, e)}
                            placeholder="Critical Value"
                            className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            required
                          />
                          {tests.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTestRow(idx)}
                              className="text-red-500 hover:text-red-700 p-2"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Lab Technician Signature</label>
                      <input
                        type="text"
                        value={labTechSignature}
                        onChange={(e) => setLabTechSignature(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Doctor Signature</label>
                      <input
                        type="text"
                        value={doctorSignature}
                        onChange={(e) => setDoctorSignature(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 mr-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                      {loading ? "Saving..." : editingResult ? "Update" : "Save"}
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