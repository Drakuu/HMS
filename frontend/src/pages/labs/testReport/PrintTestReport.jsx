import React from 'react';

const PrintTestReport = ({ patientTest, testDefinitions }) => {
  // Helper function to handle empty values
  const safeData = (value, fallback = 'N/A') => value || fallback;

  // Extract patient data
  const patientData = patientTest.patient_Detail;
  const testData = patientTest.selectedTests[0];
  const testDefinition = testDefinitions[0];

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
console.log(("The testDefinition.fields", testDefinition.fields))
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
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }

            .hospital-name {
              font-size: 24px;
              font-weight: bold;
              color: #000;
              margin-bottom: 5px;
              text-transform: uppercase;
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
              text-transform: uppercase;
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
              margin-top: 30px;
              width: 100%;
            }

            .signature {
              text-align: center;
              width: 150px;
              display: inline-block;
              margin: 0 10px;
              font-size: 12px;
            }

            .signature-line {
              border-top: 1px solid #000;
              margin-top: 50px;
              padding-top: 5px;
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
        </div>

        <table className="patient-info">
          <tbody>
            <tr>
              <td className="label">MR #</td>
              <td>{safeData(patientData.patient_MRNo)}</td>
            </tr>
            <tr>
              <td className="label">Patient Name</td>
              <td>{safeData(patientData.patient_Name)}</td>
            </tr>
            <tr>
              <td className="label">Gender</td>
              <td>{safeData(patientData.patient_Gender)}</td>
            </tr>
            <tr>
              <td className="label">Patient Age</td>
              <td>{formatAge(patientData.patient_Age)}</td>
            </tr>
            <tr>
              <td className="label">Contact #</td>
              <td>{safeData(patientData.patient_ContactNo)}</td>
            </tr>
          </tbody>
        </table>

        <div className="divider"></div>

        <div className="test-section">
          <div className="test-title">Clinical Pathology</div>
          <table className="test-table">
            <thead>
              <tr>
                <th>TEST NAME</th>
                <th>RESULT</th>
                <th>UNIT</th>
                <th>REFERENCE RANGE</th>
              </tr>
            </thead>
            <tbody>
              {testDefinition.fields && testDefinition.fields.map((field, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td colSpan="4" style={{ fontWeight: 'bold', backgroundColor: '#f8f8f8' }}>
                      {field.fieldname}
                    </td>
                  </tr>
                  <tr>
                    <td>{field.fieldName}</td>
                    <td className={isAbnormal(field, field.value) ? 'abnormal' : ''}>
                      {field.value || 'Pending'}
                    </td>
                    <td>{safeData(field.unit, '')}</td>
                    <td>{getNormalRange(field)}</td>
                  </tr>
                </React.Fragment>
              ))}
              {/* Example data matching your image */}
              <tr>
                <td colSpan="4" style={{ fontWeight: 'bold', backgroundColor: '#f8f8f8' }}>
                  Physical Examination
                </td>
              </tr>
              <tr>
                <td>Colour</td>
                <td>Yellow</td>
                <td></td>
                <td>NIL</td>
              </tr>
              <tr>
                <td>pH</td>
                <td>6.5</td>
                <td></td>
                <td>4.5 - 7.6</td>
              </tr>
              <tr>
                <td>Turbidity</td>
                <td>Turbid</td>
                <td></td>
                <td>NIL</td>
              </tr>
              <tr>
                <td colSpan="4" style={{ fontWeight: 'bold', backgroundColor: '#f8f8f8' }}>
                  Chemical Examination
                </td>
              </tr>
              <tr>
                <td>Sp. Gravity</td>
                <td>1.015</td>
                <td></td>
                <td>1.005 - 1.030</td>
              </tr>
              <tr>
                <td>Albumin</td>
                <td>Trace</td>
                <td></td>
                <td>NIL</td>
              </tr>
              <tr>
                <td>Blood</td>
                <td>Nil</td>
                <td></td>
                <td>NIL</td>
              </tr>
              <tr>
                <td>Glucose</td>
                <td>Nil</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Ketones</td>
                <td>Nil</td>
                <td></td>
                <td>NIL</td>
              </tr>
              <tr>
                <td colSpan="4" style={{ fontWeight: 'bold', backgroundColor: '#f8f8f8' }}>
                  Microscopic Examination
                </td>
              </tr>
              <tr>
                <td>Pus Cells</td>
                <td>10---12</td>
                <td>/HPF</td>
                <td>M: 0-3 F: 0-5</td>
              </tr>
              <tr>
                <td>Red Blood Cells</td>
                <td>2-4</td>
                <td>/HPF</td>
                <td>M: 0-2 F: 0-3</td>
              </tr>
              <tr>
                <td>Epithelial Cells</td>
                <td>+</td>
                <td>/HPF</td>
                <td>M: 0-1 F: 0-10</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="divider"></div>

        <div className="footer">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold' }}>Dr. Rabia Sadaf</div>
            <div>Pathologist / MicroBiologist</div>
            <div>Timing: Daily</div>
            <div>11:00pm to 3:00pm</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
            <div className="signature">
              <div className="signature-line"></div>
              <div>Dr. Mansoor Ghani</div>
              <div>Radiologist / Ultrasound Specialist</div>
              <div>Timing: Daily 5:00pm</div>
              <div>Sat / Sun 10:00am to 4:00pm</div>
            </div>

            <div className="signature">
              <div className="signature-line"></div>
              <div>Dr. Zerlish Tehreem Arif</div>
              <div>Managing Director</div>
              <div>Head of All Diagnostic Departments</div>
              <div>Timing: 09:00am - 02:00pm</div>
            </div>

            <div className="signature">
              <div className="signature-line"></div>
              <div>Dr. M. Arif Qureshi</div>
              <div>Chief Executive Officer</div>
              <div>Al-Shahbaz Modern Diagnostic Center</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default PrintTestReport;
