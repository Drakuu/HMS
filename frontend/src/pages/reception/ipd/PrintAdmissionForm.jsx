import React from 'react';
import Logo from '../../../assets/images/logo1.png';

const PrintAdmissionForm = React.forwardRef(({ data, isAdmissionForm = true }, ref) => {
  if (!data) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // For admitted patients table view
  const patientData = isAdmissionForm ? data : {
    ...data,
    patient_MRNo: data.patient_MRNo,
    patient_Name: data.patient_Name,
    patient_Gender: data.patient_Gender,
    patient_DateOfBirth: data.patient_DateOfBirth,
    patient_CNIC: data.patient_CNIC,
    patient_Contact: data.patient_ContactNo,
    patient_Address: data.patient_Address,
    patient_Guardian: {
      guardian_Name: data.patient_Guardian?.guardian_Name,
      guardian_Relation: data.patient_Guardian?.guardian_Relation,
      guardian_Contact: data.patient_Guardian?.guardian_Contact
    },
    admission_Details: {
      admission_Date: data.admission_Details?.admission_Date,
      admitting_Doctor: data.admission_Details?.admitting_Doctor,
      diagnosis: data.admission_Details?.diagnosis,
      admission_Type: data.admission_Details?.admission_Type
    },
    ward_Information: {
      ward_Type: data.ward_Information?.ward_Type,
      ward_No: data.ward_Information?.ward_No,
      bed_No: data.ward_Information?.bed_No
    },
    financials: {
      admission_Fee: data.financials?.admission_Fee,
      discount: data.financials?.discount,
      payment_Status: data.financials?.payment_Status
    }
  };

  return (
    <div ref={ref} style={{
      padding: '15px',
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      fontSize: '12px',
      lineHeight: '1.3'
    }} id="admission-print-content">
      <style>
        {`
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            font-family: Arial, sans-serif;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin: 5px 0 10px 0;
            page-break-inside: avoid;
          }
          .print-table td {
            padding: 4px 6px;
            border: 1px solid #ddd;
            vertical-align: top;
          }
          .print-header {
            text-align: center;
            margin-bottom: 10px;
          }
          .hospital-name {
            font-size: 18px;
            font-weight: bold;
            margin: 5px 0;
          }
          .document-title {
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            margin: 10px 0;
            color: #0066cc;
          }
          .section-title {
            font-size: 13px;
            font-weight: bold;
            margin: 8px 0 4px 0;
            border-bottom: 1px solid #ccc;
            padding-bottom: 2px;
          }
          .label-cell {
            font-weight: bold;
            width: 25%;
            background-color: #f5f5f5;
          }
          .footer {
            margin-top: 10px;
            padding-top: 5px;
            border-top: 1px solid #ccc;
            font-size: 11px;
          }
          .signature-area {
            display: inline-block;
            width: 45%;
            margin: 0 2%;
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #000;
            width: 80%;
            margin: 25px auto 5px auto;
          }
          .disclaimer {
            font-size: 10px;
            text-align: center;
            margin-top: 10px;
            color: #666;
          }
          .logo {
            height: 60px;
            width: auto;
            margin-bottom: 5px;
          }
          .compact-row {
            margin-bottom: 2px;
          }
        `}
      </style>

      {/* Header */}
      <div className="print-header">
        <img src={Logo} alt="Hospital Logo" className="logo" />
        <div className="hospital-name">Al-Shahbaz Hospital</div>
        <div>Thana Road Kahuta | Phone: (123) 456-7890</div>
      </div>

      <div className="document-title">PATIENT ADMISSION RECORD</div>

      {/* Patient Information */}
      <div className="section-title">Patient Information</div>
      <table className="print-table">
        <tbody>
          <tr>
            <td className="label-cell">MR Number</td>
            <td>{data.patient_MRNo || data.mrNumber || 'N/A'}</td>
            <td className="label-cell">Name</td>
            <td>{data.patient_Name || data.patientName || 'N/A'}</td>
          </tr>
          <tr>
            <td className="label-cell">Gender</td>
            <td>{data.patient_Gender || data.gender || 'N/A'}</td>
            <td className="label-cell">Date of Birth</td>
            <td>{formatDate(data.patient_DateOfBirth || data.dob)}</td>
          </tr>
          <tr>
            <td className="label-cell">CNIC</td>
            <td>{data.patient_CNIC || data.cnic || 'N/A'}</td>
            <td className="label-cell">Contact</td>
            <td>{data.patient_Contact || data.patientContactNo || 'N/A'}</td>
          </tr>
          <tr>
            <td className="label-cell">Address</td>
            <td colSpan="3" style={{ whiteSpace: 'pre-line' }}>
              {data.patient_Address || data.address || 'N/A'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Guardian Information */}
      <div className="section-title">Guardian Information</div>
      <table className="print-table">
        <tbody>
          <tr>
            <td className="label-cell">Name</td>
            <td>{data.patient_Guardian?.guardian_Name || data.guardianName || 'N/A'}</td>
          </tr>
          <tr>
            <td className="label-cell">Relation</td>
            <td>{data.patient_Guardian?.guardian_Relation || data.guardianRelation || 'N/A'}</td>
          </tr>
          <tr>
            <td className="label-cell">Contact</td>
            <td>{data.patient_Guardian?.guardian_Contact || data.guardianContact || 'N/A'}</td>
          </tr>
        </tbody>
      </table>

      {/* Admission Details */}
      <div className="section-title">Admission Details</div>
      <table className="print-table">
        <tbody>
          <tr>
            <td className="label-cell">Admission Date</td>
            <td>{formatDate(data.admission_Details?.admission_Date || data.admissionDate)}</td>
          </tr>
          <tr>
            <td className="label-cell">Doctor</td>
            <td>{data.admission_Details?.admitting_Doctor || data.doctor || 'N/A'}</td>
          </tr>
          <tr>
            <td className="label-cell">Ward Type</td>
            <td>{data.ward_Information?.ward_Type || data.wardType || 'N/A'}</td>
          </tr>
          <tr>
            <td className="label-cell">Ward Number</td>
            <td>{data.ward_Information?.ward_No || data.wardNumber || 'N/A'}</td>
          </tr>
          <tr>
            <td className="label-cell">Bed Number</td>
            <td>{data.ward_Information?.bed_No || data.bedNumber || 'N/A'}</td>
          </tr>
        </tbody>
      </table>

      {/* Medical Information */}
      <div className="section-title">Medical Information</div>
      <table className="print-table">
        <tbody>
          <tr>
            <td className="label-cell">Diagnosis</td>
            <td>{data.admission_Details?.diagnosis || data.diagnosis || 'N/A'}</td>
          </tr>
        </tbody>
      </table>

      {/* Financial Information */}
      <div className="section-title">Financial Information</div>
      <table className="print-table">
        <tbody>
          <tr>
            <td className="label-cell">Admission Fee</td>
            <td>Rs. {data.financials?.admission_Fee || data.admissionFee || '0'}</td>
          </tr>
          <tr>
            <td className="label-cell">Discount</td>
            <td>Rs. {data.financials?.discount || data.discount || '0'}</td>
          </tr>
          <tr>
            <td className="label-cell">Total Fee</td>
            <td>Rs. {(data.financials?.admission_Fee || data.admissionFee || 0) - (data.financials?.discount || data.discount || 0)}</td>
          </tr>
          <tr>
            <td className="label-cell">Payment Status</td>
            <td>{data.financials?.payment_Status || data.paymentStatus || 'N/A'}</td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div className="footer">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="signature-area">
            <div>Patient/Guardian Signature</div>
            <div className="signature-line"></div>
          </div>
          <div className="signature-area">
            <div>Admitting Officer</div>
            <div className="signature-line"></div>
          </div>
        </div>
        <div className="disclaimer">
          This is a computer generated document and does not require signature
        </div>
      </div>
    </div>
  );
});

PrintAdmissionForm.displayName = 'PrintAdmissionForm';

export default PrintAdmissionForm;