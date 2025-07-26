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

  // Format age if it's a date (for DOB) or keep as is if it's "X Years"
  const formatAge = (age) => {
    if (!age) return 'N/A';
    if (typeof age === 'string' && age.includes('Years')) return age;
    return formatDate(age);
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
      {/* Header with logo and contact info */}
      <div className="header" style={styles.header}>
        <div style={styles.hospitalInfo}>
          <div className="hospital-name" style={styles.hospitalName}>
            AL-SHAHBAZ MODERN DIAGNOSTIC CENTER
          </div>
          <div className="hospital-subtitle" style={styles.hospitalSubtitle}>
            ISO Certified Laboratory | Quality Assured
          </div>
          <div style={styles.hospitalAddress}>
            123 Medical Street, Islamabad, Pakistan | Phone: +92-51-1234567
          </div>
        </div>
        <div style={styles.reportTitle}>RADIOLOGY REPORT</div>
      </div>

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
            <td style={styles.valueCell}>{calculateAge(report.age)}</td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Test Name</td>
            <td colSpan="3" style={styles.valueCell}>
              {safeData(report.templateName?.replace('.html', ''))}
            </td>
          </tr>
          {/* <tr>
            <td style={styles.labelCell}>Performed By</td>
            <td style={styles.valueCell}>{safeData(report.performedBy?.name)}</td>
            <td style={styles.labelCell}>Created At</td>
            <td style={styles.valueCell}>{formatDate(report.createdAt)}</td>
          </tr> */}
          <tr>
            <td style={styles.labelCell}>Total Amount</td>
            <td style={styles.valueCell}>{formatCurrency(report.totalAmount)}</td>
            <td style={styles.labelCell}>Discount</td>
            <td style={styles.valueCell}>{formatCurrency(report.discount)}</td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Paid Amount</td>
            <td style={styles.valueCell}>{formatCurrency(report.paidAmount)}</td>
            <td style={styles.labelCell}>Final Amount</td>
            <td style={styles.valueCell}>{formatCurrency(report.finalAmount)}</td>
          </tr>
        </tbody>
      </table>

      {/* Report content */}
      <div className="report-content" 
           style={styles.reportContent} 
           dangerouslySetInnerHTML={{ __html: report.finalContent }} />

      {/* Signatures section */}
      <div className="footer" style={styles.footer}>
        <div className="signature" style={styles.signature}>
          <div style={styles.signatureLabel}>Performed By</div>
          <div style={styles.signatureName}>{safeData(report.performedBy?.name)}</div>
          <div style={styles.signatureTitle}>Radiology Technician</div>
          <div style={styles.signatureLine}></div>
        </div>
        <div className="signature" style={styles.signature}>
          <div style={styles.signatureLabel}>Verified By</div>
          <div style={styles.signatureName}>Dr. Mansoor Ghani</div>
          <div style={styles.signatureTitle}>Radiologist</div>
          <div style={styles.signatureLine}></div>
        </div>
        <div className="signature" style={styles.signature}>
          <div style={styles.signatureLabel}>Approved By</div>
          <div style={styles.signatureName}>Dr. M. Arif Qureshi</div>
          <div style={styles.signatureTitle}>CEO</div>
          <div style={styles.signatureLine}></div>
        </div>
      </div>

      {/* Footer note */}
      <div className="footer-note" style={styles.footerNote}>
        <p style={styles.disclaimerText}>
          This is a computer generated report and does not require signature
        </p>
        <p style={styles.contactText}>
          For any queries, please contact: +92-51-1234567 | info@alshahbazdiagnostics.com
        </p>
      </div>
    </div>
  );
};

// CSS-in-JS styles for better print control
const styles = {
  container: {
    width: '210mm',
    minHeight: '297mm',
    margin: '0 auto',
    padding: '1mm',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    color: '#333',
    fontFamily: '"Arial", sans-serif',
    fontSize: '12pt',
    lineHeight: '1.4',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
    borderBottom: '2px solid #0066cc',
    paddingBottom: '10px',
  },
  hospitalInfo: {
    marginBottom: '2px',
  },
  hospitalName: {
    fontSize: '18pt',
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: '5px',
  },
  hospitalSubtitle: {
    fontSize: '12pt',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  hospitalAddress: {
    fontSize: '10pt',
    color: '#666',
  },
  reportTitle: {
    fontSize: '16pt',
    fontWeight: 'bold',
    color: '#0066cc',
    marginTop: '10px',
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
  divider: {
    borderTop: '1px solid #0066cc',
    margin: '15px 0',
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
    marginTop: '20px',
    fontSize: '10pt',
    textAlign: 'center',
    color: '#666',
  },
  disclaimerText: {
    marginBottom: '5px',
  },
  contactText: {
    fontStyle: 'italic',
  },
};

export default PrintRadiologyReport;