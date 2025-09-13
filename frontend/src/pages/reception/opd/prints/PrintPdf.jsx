import React from 'react';

const PrintPdf = ({ formData }) => {
  return (
    <html>
      <head>
        <title>Patient Registration - PDF</title>
        <style>
          {`
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2b6cb0; padding-bottom: 10px; }
            .hospital-name { font-size: 24px; font-weight: bold; color: #2b6cb0; margin-bottom: 5px; }
            .form-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
            .patient-info { margin-bottom: 30px; }
            .section-title { font-weight: bold; background-color: #f0f4f8; padding: 5px 10px; margin: 15px 0 10px 0; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .info-item { margin-bottom: 8px; }
            .label { font-weight: bold; display: inline-block; width: 150px; }
            .footer { margin-top: 30px; text-align: right; font-size: 12px; }
            .watermark { position: fixed; opacity: 0.1; font-size: 80px; color: #2b6cb0; 
                         transform: rotate(-45deg); top: 50%; left: 50%; transform-origin: center center; }
          `}
        </style>
      </head>
      <body>
        <div className="watermark">CONFIDENTIAL</div>
        <div className="header">
          <div className="hospital-name">Al-Shahbaz Dental/Eye & Skin Care</div>
          <div className="form-title">PATIENT REGISTRATION - OFFICIAL RECORD</div>
          <div>{new Date().toLocaleDateString()}</div>
        </div>

        <div className="patient-info">
          <div className="section-title">PATIENT DETAILS</div>
          <div className="info-grid">
            <div className="info-item"><span className="label">MR Number:</span> {formData.mrNumber || 'N/A'}</div>
            <div className="info-item"><span className="label">Registration Date:</span> {new Date().toLocaleDateString()}</div>
            <div className="info-item"><span className="label">Patient Name:</span> {formData.patientName || 'N/A'}</div>
            <div className="info-item"><span className="label">Father/Husband:</span> {formData.fatherHusbandName || 'N/A'}</div>
            <div className="info-item"><span className="label">Date of Birth:</span> {formData.dob || 'N/A'}</div>
            <div className="info-item"><span className="label">Age:</span> {formData.age || 'N/A'}</div>
            <div className="info-item"><span className="label">Gender:</span> {formData.gender || 'N/A'}</div>
            <div className="info-item"><span className="label">Marital Status:</span> {formData.maritalStatus || 'N/A'}</div>
            <div className="info-item"><span className="label">CNIC:</span> {formData.cnic || 'N/A'}</div>
            <div className="info-item"><span className="label">Blood Group:</span> {formData.bloodGroup || 'N/A'}</div>
            <div className="info-item"><span className="label">Mobile:</span> {formData.mobileNumber || 'N/A'}</div>
            <div className="info-item"><span className="label">Emergency Contact:</span> {formData.emergencyContact || 'N/A'}</div>
            <div className="info-item" style={{ gridColumn: 'span 2' }}><span className="label">Address:</span> {formData.address || 'N/A'}</div>
          </div>

          <div className="section-title">MEDICAL INFORMATION</div>
          <div className="info-grid">
            <div className="info-item"><span className="label">Consulting Doctor:</span> {formData.doctor || 'N/A'}</div>
            <div className="info-item"><span className="label">Department:</span> {formData.doctorDepartment || 'N/A'}</div>
            <div className="info-item"><span className="label">Specialization:</span> {formData.doctorSpecialization || 'N/A'}</div>
            <div className="info-item"><span className="label">Qualification:</span> {formData.doctorQualification || 'N/A'}</div>
            <div className="info-item"><span className="label">Referred By:</span> {formData.referredBy || 'N/A'}</div>
          </div>

          <div className="section-title">BILLING DETAILS</div>
          <div className="info-grid">
            <div className="info-item"><span className="label">Consultation Fee:</span> Rs. {formData.doctorFee || '0'}</div>
            <div className="info-item"><span className="label">Discount:</span> Rs. {formData.discount || '0'}</div>
            <div className="info-item"><span className="label">Total Fee:</span> Rs. {formData.totalFee || '0'}</div>
          </div>
        </div>

        <div className="footer">
          <div>This is an official document of Al-Shahbaz Dental/Eye & Skin Care</div>
          <div>Generated on: {new Date().toLocaleString()}</div>
        </div>

        <script>
          {`
            setTimeout(function() {
              alert("In a real implementation, this would generate and download a PDF file.");
            }, 500);
          `}
        </script>
      </body>
    </html>
  );
};

export default PrintPdf;