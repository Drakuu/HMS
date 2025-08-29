import React from 'react';

const PrintSlip = ({ formData }) => {
  return (
    <html>
      <head>
        <title>Patient Registration - Thermal Slip</title>
        <style>
          {`
            body { font-family: Arial, sans-serif; margin: 0; padding: 10px; width: 80mm; font-size: 14px; }
            .header { text-align: center; margin-bottom: 5px; }
            .hospital-name { font-weight: bold; font-size: 16px; }
            .patient-info { margin: 10px 0; }
            .info-item { margin: 3px 0; }
            .label { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .footer { font-size: 12px; text-align: center; margin-top: 10px; }
            @media print {
              @page { size: 80mm auto; margin: 0; }
              body { padding: 0; width: 80mm; }
            }
          `}
        </style>
      </head>
      <body>
        <div className="header">
          <div className="hospital-name">Al-Shahbaz Hospital</div>
          <div>Patient Registration Slip</div>
          <div>{new Date().toLocaleDateString()}</div>
        </div>
        
        <div className="divider"></div>
        
        <div className="patient-info">
          <div className="info-item"><span className="label">MR#:</span> {formData?.patientMRNo || formData?.patient_MRNo || formData?.mrNumber}</div>
          <div className="info-item"><span className="label">Name:</span> {formData.patientName || 'N/A'}</div>
          <div className="info-item"><span className="label">Doctor:</span> {formData.doctor || formData.doctorName || 'N/A'}</div>
          <div className="info-item"><span className="label">Department:</span> {formData.doctorDepartment || 'N/A'}</div>
          <div className="info-item"><span className="label">Time:</span> {new Date().toLocaleTimeString()}</div>
        </div>
        
        <div className="divider"></div>
        
        <div className="billing-info">
          <div className="info-item"><span className="label">Fee:</span> Rs. {formData.doctorFee || '0'}</div>
          <div className="info-item"><span className="label">Discount:</span> Rs. {formData.discount || '0'}</div>
          <div className="info-item"><span className="label">Total:</span> Rs. {formData.totalFee || '0'}</div>
        </div>
        
        <div className="divider"></div>
        
        <div className="footer">
          <div>Thank you for visiting</div>
          <div>Please wait for your turn</div>
        </div>
        
        <script>
          {`
            setTimeout(function() {
              window.print();
              window.close();
            }, 200);
          `}
        </script>
      </body>
    </html>
  );
};

export default PrintSlip;