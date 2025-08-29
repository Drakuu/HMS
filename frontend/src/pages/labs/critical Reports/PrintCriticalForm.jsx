import React from "react";
import logo from "../../../assets/images/logo1.png"; // update path as needed

const PrintCriticalForm = ({
  form,
  tests,
  labTechSignature,
  doctorSignature,
}) => {
  return (
    <div
      id="print-area"
      className="bg-white border border-cyan-700 rounded-lg px-12 py-8 mx-auto"
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#0e7490",
        width: "210mm",
        minHeight: "297mm",
        boxSizing: "border-box",
        pageBreakAfter: "always",
      }}
    >
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #print-area, #print-area * {
              visibility: visible !important;
            }
            #print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 210mm !important;
              min-height: 260mm !important;
              margin: 0 !important;
              box-shadow: none !important;
              background: white !important;
              border: none !important;
            }
          }
        `}
      </style>
      <div className="flex flex-col items-center mb-2">
        <img
          src={logo}
          alt="Hospital Logo"
          style={{
            height: "70px",
            width: "70px",
            objectFit: "contain",
            marginBottom: "8px",
          }}
        />
        <h2 className="font-bold text-2xl text-cyan-900 mb-1" style={{ letterSpacing: "1px" }}>
          AL-SHAHBAZ MODERN DIAGNOSTIC CENTER
        </h2>
        <div className="text-cyan-700 text-sm font-semibold mb-1">PHC Reg No RO-58414</div>
      </div>
      <h3 className="font-bold text-lg text-center text-cyan-800 mb-2" style={{ letterSpacing: "1px" }}>
        CRITICAL RESULT FORM
      </h3>
      <div className="text-center font-semibold text-cyan-700 mb-4 underline">PATIENT DATA</div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4 text-xs">
        <div>
          <label className="block font-semibold">Date</label>
          <div className="border-b border-cyan-400 py-1 min-h-[22px]">{form.date}</div>
        </div>
        <div>
          <label className="block font-semibold">MR No</label>
          <div className="border-b border-cyan-400 py-1 min-h-[22px]">{form.mrNo}</div>
        </div>
        <div>
          <label className="block font-semibold">Patient Name</label>
          <div className="border-b border-cyan-400 py-1 min-h-[22px]">{form.patientName}</div>
        </div>
        <div>
          <label className="block font-semibold">Sample Collection Time</label>
          <div className="border-b border-cyan-400 py-1 min-h-[22px]">{form.sampleCollectionTime}</div>
        </div>
        <div>
          <label className="block font-semibold">Age</label>
          <div className="border-b border-cyan-400 py-1 min-h-[22px]">{form.age}</div>
        </div>
        <div>
          <label className="block font-semibold">Report Delivery Time</label>
          <div className="border-b border-cyan-400 py-1 min-h-[22px]">{form.reportDeliveryTime}</div>
        </div>

        <div>
          <label className="block font-semibold">Informed To</label>
          <div className="border-b border-cyan-400 py-1 min-h-[22px]">{form.informedTo}</div>
        </div>
      </div>
      <div className="mt-4 mb-2">
        <table className="w-full border border-cyan-700 rounded">
          <thead>
            <tr className="bg-cyan-100">
              <th className="py-2 px-3 text-cyan-900 font-semibold border-r border-cyan-400 text-left text-xs" style={{ width: "50%" }}>Test Name</th>
              <th className="py-2 px-3 text-cyan-900 font-semibold text-left text-xs" style={{ width: "50%" }}>Critical Value</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test, idx) => (
              <tr key={idx}>
                <td className="py-2 px-3 border-t border-cyan-200 border-r text-xs min-h-[22px]">
                  {test.testName}
                </td>
                <td className="py-2 px-3 border-t border-cyan-200 text-xs min-h-[22px]">
                  {test.criticalValue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-row gap-8 mt-8 items-end text-xs">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Lab Technician Signature:</label>
          <div className="border-b border-cyan-400 py-1 min-h-[22px]">{labTechSignature}</div>
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">Dr. Signature:</label>
          <div className="border-b border-cyan-400 py-1 min-h-[22px]">{doctorSignature}</div>
        </div>
      </div>
      <div className="mt-6 text-center text-xs text-cyan-900 py-2 border-t border-cyan-400">
        Note:For any query related to test results,Please contact MDC as soon as possible.
      </div>
    </div>
  );
};

export default PrintCriticalForm; 