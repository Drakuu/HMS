import React from 'react';
import ReactDOMServer from 'react-dom/server';

const PrintRadiologyReport = ({ report }) => {
  // Helper function to handle empty values
  const safeData = (value, fallback = 'N/A') => value || fallback;

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

  // Calculate age from date of birth
  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
      years--;
    }
    return `${years} Years`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    return `Rs. ${amount.toLocaleString()}`;
  };

  return (
    <div className="print-container" style={styles.container}>
      {/* Patient information table */}
      <table className="patient-info" style={styles.patientInfoTable}>
        <tbody>
          <tr>
            <td style={styles.labelCell}>MR #</td>
            <td style={styles.valueCell}>{safeData(report.patientMRNO)}</td>
            <td style={styles.labelCell}>Report Date</td>
            <td style={styles.valueCell}>{formatDate(report.date)}</td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Patient Name</td>
            <td style={styles.valueCell}>{safeData(report.patientName)}</td>
            <td style={styles.labelCell}>Referred By</td>
            <td style={styles.valueCell}>{safeData(report.referBy)}</td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Gender</td>
            <td style={styles.valueCell}>{safeData(report.sex)}</td>
            <td style={styles.labelCell}>Age</td>
            <td style={styles.valueCell}>{report.age}</td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Contact No</td>
            <td colSpan="3" style={styles.valueCell}>
              {safeData(report.patient_ContactNo)}
            </td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Test Name</td>
            <td colSpan="3" style={styles.valueCell}>
              {safeData(report.templateName?.replace('.html', ''))}
            </td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Total Amount</td>
            <td style={styles.valueCell}>{formatCurrency(report.totalAmount)}</td>
            <td style={styles.labelCell}>Discount</td>
            <td style={styles.valueCell}>{formatCurrency(report.discount)}</td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Advance Payment</td>
            <td style={styles.valueCell}>{formatCurrency(report.advanceAmount)}</td>
            <td style={styles.labelCell}>Paid Amount</td>
            <td style={styles.valueCell}>{formatCurrency(report.totalPaid)}</td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Final Amount</td>
            <td style={styles.valueCell}>{formatCurrency(report.remainingAmount)}</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* Report content */}
      <div
        className="report-content"
        style={styles.reportContent}
        dangerouslySetInnerHTML={{ __html: report.finalContent }}
      />

      {/* Footer note (sticks to every page bottom) */}
      <div style={styles.footerNote}>
        Radiological findings are based on imaging and are subject to technical limitations; 
        correlation with clinical evaluation and other investigations is recommended.
      </div>
    </div>
  );
};

// CSS-in-JS styles
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
  reportContent: {
    margin: '20px 0',
    padding: '10px',
    border: '1px solid #eee',
    minHeight: '100mm',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '30px',
  },
  signature: {
    textAlign: 'center',
    width: '30%',
  },
  signatureLabel: {
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  signatureName: {
    marginBottom: '3px',
  },
  signatureTitle: {
    fontSize: '10pt',
    color: '#666',
    marginBottom: '15px',
  },
  signatureLine: {
    borderTop: '1px solid #333',
    width: '80%',
    margin: '0 auto',
    height: '20px',
  },
  footerNote: {
    position: 'fixed',
    bottom: 0,
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

export default PrintRadiologyReport;
