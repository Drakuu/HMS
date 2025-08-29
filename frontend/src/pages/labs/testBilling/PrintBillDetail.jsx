import React from 'react';

const PrintBillDetail = ({ bill }) => {
  // Helper function to handle empty values
  const safeData = (value, fallback = 'N/A') => value || fallback;

  // Format date to "DD-MM-YYYY" format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Determine if it's a radiology bill
  const isRadiology = !!bill.templateName || !!bill.finalContent;

  return (
    <html>
      <head>
        <title>Bill Details</title>
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

            .patient-info, .billing-info, .test-table, .summary-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }

            .patient-info td, .billing-info td, .summary-table td {
              padding: 3px 5px;
              vertical-align: top;
              border: none;
            }

            .patient-info .label, .billing-info .label, .summary-table .label {
              font-weight: bold;
              width: 120px;
            }

            .divider {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }

            .section-title {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 5px;
              color: #2b6cb0;
              text-transform: uppercase;
            }

            .test-table {
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

            .status-paid {
              color: #2f855a;
              font-weight: bold;
            }

            .status-pending {
              color: #b7791f;
              font-weight: bold;
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

            .radiology-report {
              margin-bottom: 15px;
            }

            .radiology-report .content {
              border: 1px solid #ddd;
              padding: 10px;
              background-color: #f9f9f9;
              max-height: 300px;
              overflow-y: auto;
            }
          `}
        </style>
      </head>
      <body>
        <button className="print-button" onClick={() => window.print()}>
          Print Bill
        </button>

        <div className="header">
          <div className="hospital-name">AL-SHAHBAZ MODERN DIAGNOSTIC CENTER</div>
          <div className="hospital-subtitle">ISO Certified Laboratory | Quality Assured</div>
        </div>

        <div className="section-title">{isRadiology ? 'Radiology Bill Details' : 'Bill Details'}</div>
        <table className="patient-info">
          <tbody>
            <tr>
              <td className="label">Token #</td>
              <td>{safeData(bill.billingSummary?.tokenNumber)}</td>
              <td className="label">Date</td>
              <td>{formatDate(isRadiology ? bill.createdAt : bill.testResults?.[0]?.createdAt)}</td>
            </tr>
            <tr>
              <td className="label">Patient Name</td>
              <td>{safeData(bill.patientDetails?.patient_Name || bill.patientDetails?.patientName)}</td>
              <td className="label">MR #</td>
              <td>{safeData(bill.patientDetails?.patient_MRNo || bill.patientDetails?.patientMRNO)}</td>
            </tr>
            <tr>
              <td className="label">Gender</td>
              <td>{safeData(bill.patientDetails?.patient_Gender || bill.patientDetails?.sex)}</td>
              <td className="label">Contact #</td>
              <td>{safeData(bill.patientDetails?.patient_ContactNo)}</td>
            </tr>
            {isRadiology && bill.referBy && (
              <tr>
                <td className="label">Referred By</td>
                <td>{safeData(bill.referBy)}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="divider"></div>

        <div className="section-title">Billing Information</div>
        <table className="billing-info">
          <tbody>
            <tr>
              <td className="label">Total Amount</td>
              <td>Rs. {safeData(bill.billingSummary?.totalAmount.toLocaleString(), '0')}</td>
              <td className="label">Discount</td>
              <td>Rs. {safeData(bill.billingSummary?.discountAmount.toLocaleString(), '0')}</td>
            </tr>
            <tr>
              <td className="label">Advance Paid</td>
              <td>Rs. {safeData(bill.billingSummary?.advanceAmount.toLocaleString(), '0')}</td>
              <td className="label">Remaining</td>
              <td>Rs. {safeData(bill.billingSummary?.remainingAmount.toLocaleString(), '0')}</td>
            </tr>
            <tr>
              <td className="label">Payment Status</td>
              <td className={`status-${bill.billingSummary?.paymentStatus || 'pending'}`}>
                {safeData(bill.billingSummary?.paymentStatus, 'Pending')}
              </td>
              <td className="label">Paid After Report</td>
              <td>Rs. {safeData(bill.billingSummary?.paidAfterReport.toLocaleString(), '0')}</td>
            </tr>
          </tbody>
        </table>

        <div className="divider"></div>

        <div className="section-title">{isRadiology ? 'Radiology Report' : 'Test Results'}</div>
        {isRadiology ? (
          <div className="radiology-report">
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              Template: {safeData(bill.templateName)}
            </div>
            <div className="content">
              <div dangerouslySetInnerHTML={{ __html: safeData(bill.finalContent, '<p>No report content available</p>') }} />
            </div>
          </div>
        ) : (
          <table className="test-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Code</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bill.testResults?.map((test, index) => (
                <tr key={index}>
                  <td>{safeData(test.testDetails?.name)}</td>
                  <td>{safeData(test.testDetails?.code)}</td>
                  <td>Rs. {safeData(test.testDetails?.price.toLocaleString(), '0')}</td>
                  <td className={test.status === 'completed' ? 'status-paid' : 'status-pending'}>
                    {safeData(test.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="divider"></div>

        <div className="section-title">{isRadiology ? 'Report Summary' : 'Test Summary'}</div>
        <table className="summary-table">
          <tbody>
            <tr>
              <td className="label">Total Items</td>
              <td>{safeData(bill.summary?.totalTests, isRadiology ? '1' : '0')}</td>
              <td className="label">Completed</td>
              <td>{safeData(bill.summary?.completedTests, isRadiology && bill.billingSummary?.paymentStatus === 'paid' ? '1' : '0')}</td>
            </tr>
            <tr>
              <td className="label">Pending</td>
              <td>{safeData(bill.summary?.pendingTests, isRadiology && bill.billingSummary?.paymentStatus === 'pending' ? '1' : '0')}</td>
            </tr>
          </tbody>
        </table>

        {bill.billingSummary?.labNotes && (
          <>
            <div className="divider"></div>
            <div className="section-title">Lab Notes</div>
            <div style={{ fontSize: '12px', color: '#333' }}>
              {safeData(bill.billingSummary.labNotes)}
            </div>
          </>
        )}

        <div className="footer">
          <div className="signature">
            <div>Prepared By</div>
            <div>Billing Officer</div>
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
          <p>This is a computer-generated bill and does not require a signature</p>
          <p>For any queries, please contact: +92-51-1234567 | info@alshahbazdiagnostics.com</p>
        </div>
      </body>
    </html>
  );
};

export default PrintBillDetail;