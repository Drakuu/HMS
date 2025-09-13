export const printPatient = (patient) => {
  try {
    // Extract patient data from nested structure
    const patientData = patient.patient || {};
    const admissionDetails = patient.admission_Details || {};
    const wardInfo = patient.ward_Information || {};
    const financials = patient.financials || {};
    const guardianInfo = patientData.patient_Guardian || {};

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch {
        return dateString;
      }
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Patient Admission Record - ${patientData.patient_MRNo || 'N/A'}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            @media print {
              body {
                width: 210mm;
                height: 148mm;
                margin: 0;
                padding: 10mm;
                font-family: Arial, sans-serif;
                font-size: 12px;
                line-height: 1.3;
              }
            }
            body {
              width: 190mm;
              height: 128mm;
              margin: 0 auto;
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.3;
              padding: 10mm;
            }
            .print-header {
              text-align: center;
              margin-bottom: 10px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .hospital-name {
              font-size: 18px;
              font-weight: bold;
              margin: 5px 0;
            }
            .document-title {
              font-size: 16px;
              font-weight: bold;
              margin: 10px 0;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin: 5px 0;
              page-break-inside: avoid;
            }
            .print-table td {
              padding: 3px 5px;
              border: 1px solid #ddd;
              vertical-align: top;
              font-size: 11px;
            }
            .label-cell {
              font-weight: bold;
              width: 30%;
              background-color: #f5f5f5;
            }
            .section-title {
              font-size: 13px;
              font-weight: bold;
              margin: 8px 0 4px 0;
              border-bottom: 1px solid #ccc;
              padding-bottom: 2px;
            }
            .footer {
              margin-top: 10px;
              padding-top: 5px;
              border-top: 1px solid #ccc;
              font-size: 10px;
              text-align: center;
            }
            .signature-area {
              display: inline-block;
              width: 45%;
              margin: 0 2%;
            }
            .signature-line {
              border-top: 1px solid #000;
              width: 80%;
              margin: 20px auto 5px auto;
            }
            .logo {
              height: 40px;
              width: auto;
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <div class="hospital-name">Al-Shahbaz Dental/Eye & Skin Care</div>
            <div>Thana Road Kahuta | Phone: (123) 456-7890</div>
            <div class="document-title">PATIENT ADMISSION RECORD</div>
          </div>

          <!-- Patient Information -->
          <div class="section-title">Patient Information</div>
          <table class="print-table">
            <tr>
              <td class="label-cell">MR Number</td>
              <td>${patientData.patient_MRNo || 'N/A'}</td>
              <td class="label-cell">Name</td>
              <td>${patientData.patient_Name || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label-cell">Gender</td>
              <td>${patientData.patient_Gender || 'N/A'}</td>
              <td class="label-cell">Date of Birth</td>
              <td>${formatDate(patientData.patient_DateOfBirth)}</td>
            </tr>
            <tr>
              <td class="label-cell">CNIC</td>
              <td>${patientData.patient_CNIC || 'N/A'}</td>
              <td class="label-cell">Contact</td>
              <td>${patientData.patient_ContactNo || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label-cell">Address</td>
              <td colspan="3">${patientData.patient_Address || 'N/A'}</td>
            </tr>
          </table>

          <!-- Admission Details -->
          <div class="section-title">Admission Details</div>
          <table class="print-table">
            <tr>
              <td class="label-cell">Admission Date</td>
              <td>${formatDate(admissionDetails.admission_Date)}</td>
              <td class="label-cell">Status</td>
              <td>${patient.status || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label-cell">Ward Type</td>
              <td>${wardInfo.ward_Type || 'N/A'}</td>
              <td class="label-cell">Bed Number</td>
              <td>${wardInfo.bed_No || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label-cell">Diagnosis</td>
              <td colspan="3">${admissionDetails.diagnosis || 'N/A'}</td>
            </tr>
          </table>

          <!-- Financial Information -->
          <div class="section-title">Financial Information</div>
          <table class="print-table">
            <tr>
              <td class="label-cell">Admission Fee</td>
              <td>Rs. ${financials.admission_Fee || '0'}</td>
              <td class="label-cell">Payment Status</td>
              <td>${financials.payment_Status || 'N/A'}</td>
            </tr>
          </table>

          <div class="footer">
            <div style="display: flex; justify-content: space-between;">
              <div class="signature-area">
                <div>Patient/Guardian Signature</div>
                <div class="signature-line"></div>
              </div>
              <div class="signature-area">
                <div>Admitting Officer</div>
                <div class="signature-line"></div>
              </div>
            </div>
            <div style="font-size: 9px; margin-top: 5px;">
              Computer generated document - ${new Date().toLocaleDateString()}
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Print after content is loaded
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      }, 500);
    };

  } catch (error) {
    console.error('Print error:', error);
    throw new Error('Failed to generate print preview');
  }
};