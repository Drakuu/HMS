const PrintTestReport = ({ patientTest, testDefinitions }) => {
  // Helper function to handle empty values
  const safeData = (value, fallback = 'N/A') => value || fallback;
// console.log("The testDefinitions: in printing ", testDefinitions, "patientTest: ", patientTest);
  // Extract patient data
  const patientData = patientTest.patient_Detail;

  // Format date to "DD-MM-YYYY" format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0'); 
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format age from "X years Y months Z days" to "(X)Y, (Y)M, (Z)D"
  const formatAge = (ageString) => {
    if (!ageString) return 'N/A';
    const matches = ageString.match(/(\d+) years (\d+) months (\d+) days/);
    if (matches) {
      return `(${matches[1]})Y, (${matches[2]})M, (${matches[3]})D`;
    }
    return ageString;
  };

  // Get normal range based on gender
  const getNormalRange = (field) => {
    if (!field.normalRange) return 'NIL';
    const gender = patientData.patient_Gender.toLowerCase();
    if (gender === 'male' && field.normalRange.male) {
      return `${field.normalRange.male.min} - ${field.normalRange.male.max}`;
    }
    if (gender === 'female' && field.normalRange.female) {
      return `${field.normalRange.female.min} - ${field.normalRange.female.max}`;
    }
    return 'NIL';
  };

  // Check if result is abnormal
  const isAbnormal = (field, value) => {
    if (!field.normalRange || !value) return false;
    const gender = patientData.patient_Gender.toLowerCase();
    
    if (gender === 'male' && field.normalRange.male) {
      return value < field.normalRange.male.min || value > field.normalRange.male.max;
    }
    if (gender === 'female' && field.normalRange.female) {
      return value < field.normalRange.female.min || value > field.normalRange.female.max;
    }
    return false;
  };

  return (
    <html>
      <head>
        <title>Patient Test Report</title>
        <style>
          {`
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
              font-family: Arial, sans-serif;
            }

            .header {
              text-align: center;
              margin-bottom: 10px;
              border-bottom: 2px solid #2b6cb0;
              padding-bottom: 10px;
            }

            .hospital-name {
              font-size: 24px;
              font-weight: bold;
              color: #2b6cb0;
              margin-bottom: 5px;
              text-transform: uppercase;
            }

            .hospital-subtitle {
              font-size: 14px;
              color: #555;
              margin-bottom: 5px;
            }

            .patient-info {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }

            .patient-info td {
              padding: 3px 5px;
              vertical-align: top;
              border: none;
            }

            .patient-info .label {
              font-weight: bold;
              width: 120px;
            }

            .divider {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }

            .test-section {
              margin-bottom: 20px;
            }

            .test-title {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 5px;
              color: #2b6cb0;
            }

            .test-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }

            .test-table th {
              background-color: #f0f0f0;
              border: 1px solid #ddd;
              padding: 5px;
              text-align: left;
              font-weight: bold;
              font-size: 12px;
            }

            .test-table td {
              border: 1px solid #ddd;
              padding: 5px;
              font-size: 12px;
            }

            .footer {
              position: absolute;
              bottom: 10mm;
              width: 100%;
              display: flex;
              justify-content: space-between;
            }

            .signature {
              text-align: center;
              width: 150px;
              border-top: 1px solid #000;
              padding-top: 5px;
              margin-top: 30px;
              font-size: 12px;
            }

            .normal-range {
              font-size: 11px;
              color: #666;
            }

            .abnormal {
              color: red;
              font-weight: bold;
            }

            .print-button {
              position: fixed;
              top: 10mm;
              right: 10mm;
              padding: 5px 10px;
              background: #2b6cb0;
              color: white;
              border: none;
              border-radius: 3px;
              cursor: pointer;
              z-index: 1000;
            }

            @media print {
              .print-button {
                display: none;
              }
            }
          `}
        </style>
      </head>
      <body>
        <button className="print-button" onClick={() => window.print()}>
          Print Report
        </button>

        <div className="header">
          <div className="hospital-name">AL-SHAHBAZ MODERN DIAGNOSTIC CENTER</div>
          <div className="hospital-subtitle">ISO Certified Laboratory | Quality Assured</div>
        </div>

        <table className="patient-info">
          <tbody>
            <tr>
              <td className="label">MR #</td>
              <td>{safeData(patientData.patient_MRNo)}</td>
              <td className="label">Date</td>
              <td>{formatDate(patientTest.createdAt)}</td>
            </tr>
            <tr>
              <td className="label">Patient Name</td>
              <td>{safeData(patientData.patient_Name)}</td>
              <td className="label">Referred By</td>
              <td>{safeData(patientTest.referredBy)}</td>
            </tr>
            <tr>
              <td className="label">Gender</td>
              <td>{safeData(patientData.patient_Gender)}</td>
              <td className="label">Token #</td>
              <td>{safeData(patientTest.tokenNumber)}</td>
            </tr>
            <tr>
              <td className="label">Patient Age</td>
              <td>{formatAge(patientData.patient_Age)}</td>
              <td className="label">Contact #</td>
              <td>{safeData(patientData.patient_ContactNo)}</td>
            </tr>
          </tbody>
        </table>

        <div className="divider"></div>

        {testDefinitions.map((testDef, index) => (
          <div className="test-section" key={index}>
            <div className="test-title">{testDef.testName}</div>
            <table className="test-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Result</th>
                  <th>Unit</th>
                  <th>Reference Range</th>
                </tr>
              </thead>
              <tbody>
                {testDef.fields.map((field, idx) => (
                  <tr key={idx}>
                    {/* {console.log("THe field is", field)} */}
                    <td>{field.fieldName || field.name}</td>
                    <td className={isAbnormal(field, field.value) ? 'abnormal' : ''}>
                      {field.value || '/-'}
                    </td>
                    <td>{safeData(field.unit, '')}</td>
                    <td>{getNormalRange(field)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <div className="divider"></div>

        <div className="footer">
          <div className="signature">
            <div>Performed By</div>
            <div>Lab Technician</div>
          </div>
          <div className="signature">
            <div>Verified By</div>
            <div>Dr. Rabia Sadaf</div>
            <div>Pathologist</div>
          </div>
          <div className="signature">
            <div>Approved By</div>
            <div>Dr. M. Arif Qureshi</div>
            <div>CEO</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px' }}>
          <p>This is a computer generated report and does not require signature</p>
          <p>For any queries, please contact: +92-51-1234567 | info@alshahbazdiagnostics.com</p>
        </div>
      </body>
    </html>
  );
};

export default PrintTestReport;