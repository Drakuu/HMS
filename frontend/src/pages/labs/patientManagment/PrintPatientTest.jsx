import React from 'react';
import Logo from '../../../assets/images/logo1.png';

const PrintA4 = ({ formData }) => {
  const safe = (v, fallback = '_________') => v !== undefined && v !== null && v !== '' ? v : fallback;

  const formatCurrency = (amount) =>
    amount?.toLocaleString('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }) || '_________';

  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <html>
      <head>
        <title>Patient Report</title>
        <style>{`
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #000;
            margin: 0;
            padding: 20px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .logo-section {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }
          .logo {
            width: 120px;
            margin-bottom: 5px;
          }
          .hospital-name {
            font-size: 16px;
            font-weight: bold;
            text-align: center;
        
          }
          .urdu-name {
            font-family: 'Noto Nastaliq Urdu', serif;
            font-size: 20px;
            direction: rtl;
            font-weight: bold;
            color: #2b6cb0;
            margin-top: 5px;
            text-align: center;
          }
          hr {
            border: none;
            border-top: 3px solid #000;
            margin: 30px 0;
           }
          .hospital-info {
            text-align: right;
            font-size: 11px;
          }
          .hospital-info p {
            margin: 2px 0;
          }
          .details-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .details-block {
            width: 48%;
            font-size: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 6px;
            text-align: left;
          }
          th {
            background-color: #eee;
          }
          tfoot td {
            font-weight: bold;
          }
          .footer {
            display: flex;
            justify-content: space-around;
            margin-top: 40px;
            font-size: 12px;
          }
          .signature {
            width: 30%;
            text-align: center;
            border-top: 1px solid #000;
            padding-top: 5px;
          }
        `}</style>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* Header Section */}
        <div className="header">
          <div className="logo-section">
            {/*<img src={Logo} alt="Logo" className="logo" />*/}
            <div className="hospital-name text-center">AL-SHAHBAZ MODERN DIAGNOSTIC CENTER</div>
            <div className="urdu-name text-center">الشہباز ہسپتال</div>
          </div>
          {/* <div className="hospital-info">
            
            <p><strong>PHC Reg No: RO-58414 </strong></p>
            <p><strong>100% Committed to Quality Testing</strong></p>
            <p>Opposite Al-Shahbaz Hospital, Thana Road, Kahuta</p>
            <p>Tel: 051-3311342</p>
          </div>*/}
        </div>

        {/* Patient & Lab Info */}
        <div className="details-row">
          <div className="details-block">
            <p><strong>MR-NO #:</strong> {safe(formData.patient?.MRNo)}</p>
            <p><strong>Patient Name:</strong> {safe(formData.patient?.Name)}</p>
            <p><strong>Gender:</strong> {safe(formData.patient?.Gender)}</p>
            <p><strong>Age:</strong> {safe(formData.patient?.Age)}</p>
            <p><strong>Contact #:</strong> {safe(formData.patient?.ContactNo)}</p>
          </div>
          <div className="details-block">
            <p><strong>Sample Date:</strong> {safe(formData.sampleDate)}</p>
            <p><strong>Report Date Date:</strong> {safe(formData.reportDate || currentDate)}</p>
            <p><strong>Print Time:</strong> {currentTime}</p>
            <p><strong>Referred By:</strong> {safe(formData.referredBy)}</p>
          </div>
        </div>

        {/* Test Table */}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Test Name</th>
              <th>Price (PKR)</th>
              <th>Discount (PKR)</th>
              <th>Final Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            {(formData.tests || []).map((test, index) => {
              const price = test.price || test.amount || 0;
              const discount = test.discount || 0;
              const final = Math.max(0, price - discount);
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{safe(test.testName)}</td>
                  <td>{formatCurrency(price)}</td>
                  <td>{formatCurrency(discount)}</td>
                  <td>{formatCurrency(final)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" style={{ textAlign: 'right' }}>Total</td>
              <td>{formatCurrency(formData.total)}</td>
            </tr>
            <tr>
              <td colSpan="4" style={{ textAlign: 'right' }}>Paid</td>
              <td>{formatCurrency(formData.paid)}</td>
            </tr>
            <tr>
              <td colSpan="4" style={{ textAlign: 'right' }}>Remaining</td>
              <td>{formatCurrency(formData.remaining)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Footer Signatures 
        <div className="footer">
          <div className="signature">Patient Signature</div>
          <div className="signature">
            <p><strong>Dr.Mansoor Ghani</strong></p>
             <p>Radiologist / Ultrasound Specialist</p>
              <p>Timing: Daily 5:00 Pm</p>
               <p>Saturday , Sunday </p>
               <p>10:00 am to 4:00 Pm</p>
            </div>
         <div className="signature">
            <p><strong>Dr.Rabia Sadaf</strong></p>
             <p>Pathologist / Microbiologist</p>
              <p>Timing: Daily 5:00 Pm</p>
               <p>Saturday , Sunday </p>
               <p> 10:00 am to 4:00 Pm</p>
            </div>
             <div className="signature">
            <p><strong>Dr. Zerlish Tehreen Arif</strong></p>
             <p>Managing Director</p>
              <p>Timing :Daily</p>
               <p>Saturday , Sunday </p>
               <p> 10:00 am to 4:00 Pm</p>
            </div>
        </div>*/}
        <hr/>

        <div className="details-row">
          <div className="details-block">
            <p><strong>MR-NO #:</strong> {safe(formData.patient?.MRNo)}</p>
            <p><strong>Patient Name:</strong> {safe(formData.patient?.Name)}</p>
            <p><strong>Gender:</strong> {safe(formData.patient?.Gender)}</p>
            <p><strong>Age:</strong> {safe(formData.patient?.Age)}</p>
            <p><strong>Contact #:</strong> {safe(formData.patient?.ContactNo)}</p>
          </div>
          <div className="details-block">
            <p><strong>Sample Date:</strong> {safe(formData.sampleDate)}</p>
            <p><strong>Report Date Date:</strong> {safe(formData.reportDate || currentDate)}</p>
            <p><strong>Print Time:</strong> {currentTime}</p>
            <p><strong>Referred By:</strong> {safe(formData.referredBy)}</p>
          </div>
        </div>

        {/* Test Table */}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Test Name</th>
              <th>Price (PKR)</th>
              <th>Discount (PKR)</th>
              <th>Final Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            {(formData.tests || []).map((test, index) => {
              const price = test.price || test.amount || 0;
              const discount = test.discount || 0;
              const final = Math.max(0, price - discount);
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{safe(test.testName)}</td>
                  <td>{formatCurrency(price)}</td>
                  <td>{formatCurrency(discount)}</td>
                  <td>{formatCurrency(final)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" style={{ textAlign: 'right' }}>Total</td>
              <td>{formatCurrency(formData.total)}</td>
            </tr>
            <tr>
              <td colSpan="4" style={{ textAlign: 'right' }}>Paid</td>
              <td>{formatCurrency(formData.paid)}</td>
            </tr>
            <tr>
              <td colSpan="4" style={{ textAlign: 'right' }}>Remaining</td>
              <td>{formatCurrency(formData.remaining)}</td>
            </tr>
          </tfoot>
        </table>
      </body>
    </html>
  );
};

export default PrintA4;
