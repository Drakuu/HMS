import React from 'react';
import Logo from '../../../assets/images/logo1.png';

const PrintAdmissionForm = ({ formData }) => {
  const safeData = (value, fallback = '_________') => value || fallback;

  return (
    <html>
      <head>
        <title>Patient Admission - A4 Form</title>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600&family=Roboto:wght@400;500&display=swap');

            body {
              font-family: 'Roboto', sans-serif;
              font-weight: 400;
              font-size: 18px;
            }
            
            .form-title {
              font-family: 'Montserrat', sans-serif;
              font-weight: 600;
            }
            
            .section-title, .vital-title {
              font-family: 'Montserrat', sans-serif;
              font-weight: 500;
              font-size: 14px;    
            }
            
            .detail-label { 
              font-weight: 500;
            }

            @page {
              size: A4;
              margin: 5mm 10mm;
            }
              
            body {
              margin: 0;
              padding: 5mm;
              color: #333;
              width: 190mm;
              height: 277mm;
              position: relative;
              font-size: 13px;
              line-height: 1.3;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              opacity: 0.1;
              z-index: -1;
              width: 300px;
              height: auto;
              pointer-events: none;
            }

            .header-container {
              display: flex;
              width: 100%;
              border-bottom: 2px solid #2b6cb0;
              padding-bottom: 5mm;
              margin-bottom: 5mm;
              page-break-inside: avoid;
            }

            .logo-section {
              width: 20%;
              min-width: 40mm;
            }

            .logo {
              height: 20mm;
              width: auto;
              max-width: 100%;
            }

            .hospital-name {
              font-family: 'Montserrat', sans-serif;
              font-size: 20px;
              font-weight: 600;
              color: #2b6cb0;
              margin-top: 2mm;
            }

            .patient-details-section,
            .admission-details-section {
              width: 40%;
              padding: 0 5mm;
              border-left: 1px solid #ddd;
              overflow: hidden;
            }

            .section-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 3mm;
              color: #2b6cb0;
            }

            .detail-row {
              display: flex;
              margin-bottom: 2mm;
              min-height: 5mm;
            }

            .detail-label {
              font-weight: bold;
              width: 35mm;
              min-width: 35mm;
            }

            .detail-value {
              flex-grow: 1;
              word-break: break-word;
            }

            .main-content-area {
              height: 190mm;
              margin-top: 3mm;
              padding: 3mm;
              position: relative;
              page-break-inside: avoid;
            }

            .good-border {
              border-left: 2px solid;
              border-right: 2px solid;
              border-image: linear-gradient(to bottom, #1371d6, #d61323) 1;
              padding: 3mm;
              height: 100%;
              border-radius: 2mm;
              box-sizing: border-box;
              background-color: #f9f9f9;
            }

            .footer {
              position: absolute;
              bottom: 5mm;
              left: 0;
              right: 0;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }

            .signature-box {
              width: 60mm;
              border-top: 1px solid #333;
              text-align: center;
              padding-top: 2mm;
              font-size: 12px;
            }

            .form-title {
              font-size: 18px;
              font-weight: bold;
              text-align: center;
              margin: 3mm 0;
              color: #2b6cb0;
            }

            .date-time {
              font-size: 11px;
              text-align: right;
              margin-bottom: 2mm;
              color: #666;
            }

            .hospital-name-urdu {
              font-family: 'Noto Nastaliq Urdu', sans-serif;
              font-size: 26px;
              margin-top: 0.75rem;
              margin-right: 1rem;
              direction: rtl;
              line-height: 1.4;
              font-weight: 800;
              color: #2b6cb0;
            }

            .no-print {
              display: none;
            }

            @media print {
              body {
                padding: 0;
                margin: 0;
                width: 210mm;
                height: 297mm;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .no-print {
                display: none !important;
              }
              
              .watermark {
                opacity: 0.05;
              }
            }
          `}
        </style>
      </head>
      <body className="print-body">
        <img src={Logo} className="watermark" alt="Hospital Watermark" />
        <div className="content">
          <div className="date-time">
            {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          <div className="form-title">PATIENT ADMISSION FORM</div>

          <div className="header-container">
            <div className="logo-section">
              <img src={Logo} className="logo" alt="Hospital Logo" />
              <div className="hospital-name">Al-Shahbaz Hospital</div>
              <div className="hospital-name-urdu">
                الشہباز ہسپتال
              </div>
            </div>

            <div className="patient-details-section">
              <div className="section-title">PATIENT DETAILS</div>
              <div className="detail-row">
                <span className="detail-label">MR Number:</span>
                <span className="detail-value">{safeData(formData.mrNumber)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Patient Name:</span>
                <span className="detail-value">{safeData(formData.patientName)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Age/Gender:</span>
                <span className="detail-value">{safeData(formData.age)}/{safeData(formData.gender)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">CNIC:</span>
                <span className="detail-value">{safeData(formData.cnic)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contact:</span>
                <span className="detail-value">{safeData(formData.patientContactNo)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{safeData(formData.address)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Blood Group:</span>
                <span className="detail-value">{safeData(formData.bloodGroup)}</span>
              </div>
            </div>

            <div className="admission-details-section">
              <div className="section-title">ADMISSION DETAILS</div>
              <div className="detail-row">
                <span className="detail-label">Admission Date:</span>
                <span className="detail-value">{safeData(formData.admissionDate)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Admission Type:</span>
                <span className="detail-value">{safeData(formData.admissionType)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Doctor:</span>
                <span className="detail-value">{safeData(formData.doctor)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Ward Type:</span>
                <span className="detail-value">{safeData(formData.wardType === "Other" ? formData.customWardType : formData.wardType)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Ward/Bed:</span>
                <span className="detail-value">{safeData(formData.wardNumber)}/{safeData(formData.bedNumber)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Payment Status:</span>
                <span className="detail-value">{safeData(formData.paymentStatus)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Fee:</span>
                <span className="detail-value">Rs. {safeData(formData.totalFee)}</span>
              </div>
            </div>
          </div>

          <div className="main-content-area">
            <div className="good-border">
              <div className="section-title">MEDICAL INFORMATION</div>
              <div className="detail-row">
                <span className="detail-label">Diagnosis:</span>
                <span className="detail-value">{safeData(formData.diagnosis)}</span>
              </div>
              <div className="detail-row" style={{ marginTop: '5mm' }}>
                <span className="detail-label">Notes:</span>
                <span className="detail-value">_________________________________________________</span>
              </div>
            </div>
          </div>

          <div className="footer">
            <div className="signature-box">Patient/Guardian Signature</div>
            <div className="signature-box">Doctor Signature</div>
            <div className="signature-box">Admission Officer</div>
          </div>
        </div>

        <button className="no-print" style={{
          position: 'fixed',
          top: '10mm',
          right: '10mm',
          padding: '2mm 5mm',
          background: '#2b6cb0',
          color: 'white',
          border: 'none',
          borderRadius: '2mm',
          cursor: 'pointer',
          zIndex: 1000
        }} onClick={() => window.print()}>
          Print
        </button>
      </body>
    </html>
  );
};

export default PrintAdmissionForm;