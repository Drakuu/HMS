import {
  getNormalRange,
  formatNormalRange,
  getRangeLabel,
} from '../../../utils/rangeUtils';

const PrintTestReport = ({ patientTest, testDefinitions }) => {
  // Helper function to handle empty values
  const safeData = (value, fallback = 'N/A') => value || fallback;

  // Extract patient data
  const patientData = {
    ...patientTest.patient_Detail,
    gender: patientTest.patient_Detail?.patient_Gender,
    age: patientTest.patient_Detail?.patient_Age,
    isPregnant: patientTest.patient_Detail?.isPregnant,
  };

  // Format date to "DD-MM-YYYY" format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return 'N/A';
    }
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
  const getFormattedRange = (field, patientData) => {
    if (!field.normalRange) return 'NIL';
    const range = getNormalRange(field.normalRange, patientData);
    if (!range) return 'NIL';
    const min = range.min !== undefined ? range.min : 'N/A';
    const max = range.max !== undefined ? range.max : 'N/A';
    return `${min} - ${max}`;
  };

  // Check if result is abnormal
  const isAbnormal = (field, value, patientData) => {
    if (!field.normalRange || !value) return false;
    const range = getNormalRange(field.normalRange, patientData);
    if (!range) return false;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return false;
    const min =
      typeof range.min === 'string' ? parseFloat(range.min) : range.min;
    const max =
      typeof range.max === 'string' ? parseFloat(range.max) : range.max;
    if (isNaN(min) || isNaN(max)) return false;
    return numValue < min || numValue > max;
  };

  return (
    <div style={styles.container}>
      <table style={styles.patientInfoTable}>
        <tbody>
          <tr>
            <td style={styles.labelCell}>Lab #</td>
            <td style={styles.valueCell}>
              {safeData(patientData.patient_MRNo)}
            </td>
            <td style={styles.labelCell}>Date</td>
            <td style={styles.valueCell}>
              {formatDate(patientTest.createdAt)}
            </td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Patient Name</td>
            <td style={styles.valueCell}>
              {safeData(patientData.patient_Name)}
            </td>
            <td style={styles.labelCell}>Referred By</td>
            <td style={styles.valueCell}>
              {safeData(patientTest.patient_Detail.referredBy)}
            </td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Gender</td>
            <td style={styles.valueCell}>
              {safeData(patientData.patient_Gender)}
            </td>
            <td style={styles.labelCell}>Patient Age</td>
            <td style={styles.valueCell}>
              {formatAge(patientData.patient_Age)}
            </td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Contact #</td>
            <td style={styles.valueCell}>
              {safeData(patientData.patient_ContactNo)}
            </td>
            <td style={styles.labelCell}></td>
            <td style={styles.valueCell}></td>
          </tr>
        </tbody>
      </table>

      <div style={styles.divider}></div>

      {testDefinitions.map((testDef, index) => (
        <div style={styles.testSection} key={index}>
          <div style={styles.testTitle}>{testDef.testName}</div>
          <table style={styles.testTable}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Test Name</th>
                <th style={styles.tableHeader}>Result</th>
                <th style={styles.tableHeader}>Unit</th>
                <th style={styles.tableHeader}>Reference Range</th>
              </tr>
            </thead>
            <tbody>
              {testDef.fields.map((field, idx) => (
                <tr key={idx}>
                  <td style={styles.tableCell}>
                    {field.fieldName || field.name}
                  </td>
                  <td
                    style={
                      isAbnormal(field, field.value, patientData)
                        ? { ...styles.tableCell, ...styles.abnormal }
                        : styles.tableCell
                    }
                  >
                    {field.value || '/-'}
                  </td>
                  <td style={styles.tableCell}>{safeData(field.unit, '')}</td>
                  <td style={styles.tableCell}>
                    {getFormattedRange(field, patientData)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div style={styles.divider}></div>

      <div style={styles.footerNote}>
        Laboratory results are intended for clinical guidance only and must be
        interpreted in conjunction with the patient's clinical history and
        physician's evaluation.
      </div>
    </div>
  );
};

// CSS-in-JS styles adapted from PrintRadiologyReport.jsx
const styles = {
  container: {
    width: '210mm',
    minHeight: '297mm',
    margin: '0 auto',
    marginTop: '25%',
    padding: '1mm',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    color: '#333',
    fontFamily: '"Arial", sans-serif',
    fontSize: '12pt',
    lineHeight: '1.4',
    position: 'relative',
  },
  printButton: {
    position: 'fixed',
    top: '10mm',
    right: '10mm',
    padding: '5px 10px',
    background: '#2b6cb0',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    zIndex: 1000,
    display: 'block',
  },
  header: {
    textAlign: 'center',
    marginBottom: '10px',
    borderBottom: '2px solid #2b6cb0',
    paddingBottom: '10px',
  },
  hospitalName: {
    fontSize: '24pt',
    fontWeight: 'bold',
    color: '#2b6cb0',
    marginBottom: '5px',
    textTransform: 'uppercase',
  },
  hospitalSubtitle: {
    fontSize: '14pt',
    color: '#555',
    marginBottom: '5px',
  },
  patientInfoTable: {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '15px 0',
  },
  labelCell: {
    fontWeight: 'bold',
    width: '15%',
    padding: '5px',
    border: '1px solid #ddd',
    backgroundColor: '#f5f5f5',
  },
  valueCell: {
    padding: '5px',
    border: '1px solid #ddd',
    width: '35%',
  },
  divider: {
    borderTop: '1px dashed #000',
    margin: '10px 0',
  },
  testSection: {
    marginBottom: '20px',
    pageBreakInside: 'avoid',
  },
  testTitle: {
    fontWeight: 'bold',
    fontSize: '16pt',
    marginBottom: '5px',
    color: '#2b6cb0',
  },
  testTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '10px',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    padding: '5px',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: '11pt',
  },
  tableCell: {
    border: '1px solid #ddd',
    padding: '5px',
    fontSize: '11pt',
  },
  abnormal: {
    color: 'red',
    fontWeight: 'bold',
  },
  footerNote: {
    position: 'fixed',
    bottom: '80px',
    left: 0,
    width: '100%',
    textAlign: 'center',
    fontSize: '11px',
    padding: '6px 10px',
    borderTop: '1px solid #ccc',
    fontStyle: 'italic',
    background: '#f9f9f9',
  },
};

export default PrintTestReport;
