import React from "react";

const TestDetail = ({ report, onClose }) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black bg-opacity-40 px-4">
      <div className="bg-white shadow-2xl p-8 w-[794px] h-[1123px] overflow-auto relative print:w-full print:h-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500 print:hidden"
        >
          ✖
        </button>

        {/* Header */}
        <div className="text-center border-b pb-4">
          <h1 className="text-3xl font-bold text-primary-700">Al-Shahzad Medical Lab</h1>
          <p className="text-sm text-gray-500">123 Health Street, PWD | Ph: 042-1234567</p>
          <hr className="mt-2 border" />
        </div>

        {/* Patient & Test Info */}
        <div className="grid grid-cols-2 gap-4 text-sm my-4">
          <div>
            <p><strong>Patient Name:</strong> {report.patient_Name}</p>
            <p><strong>Gender:</strong> {report.patient_Gender}</p>
            <p><strong>Age:</strong> {report.patient_Age}</p>
            <p><strong>CNIC:</strong> {report.patient_CNIC}</p>
            <p><strong>Contact No:</strong> {report.patient_ContactNo}</p>
          </div>
          <div>
            <p><strong>Test:</strong> {report.test_name}</p>
            <p><strong>Date:</strong> {report.date}</p>
            <p><strong>Status:</strong> {report.status}</p>
            <p><strong>MR No:</strong> {report.patient_MRNo}</p>
            <p><strong>Amount:</strong> {report.amount}</p>
          </div>
        </div>

        {/* Test Results */}
        {report.testResult?.results?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2 border-b pb-1">Test Results</h2>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">Test Field</th>
                  <th className="border px-2 py-1 text-left">Value</th>
                  <th className="border px-2 py-1 text-left">Unit</th>
                  <th className="border px-2 py-1 text-left">Normal</th>
                  <th className="border px-2 py-1 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {report.testResult.results.map((res, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{res.fieldName}</td>
                    <td className="border px-2 py-1">{res.value}</td>
                    <td className="border px-2 py-1">{res.unit}</td>
                    <td className={`border px-2 py-1 ${res.isNormal ? "text-green-600" : "text-red-600"}`}>
                      {res.isNormal ? "Normal" : "Abnormal"}
                    </td>
                    <td className="border px-2 py-1">{res.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-sm text-gray-700">
          <p><strong>Remarks:</strong> This report is computer-generated and valid without signature.</p>
          <p className="mt-2 italic">Reviewed by: Dr. Lab Expert</p>
          <p className="mt-1">© 2025 MediTech Lab — All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default TestDetail;
