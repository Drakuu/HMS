import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { format, parseISO } from 'date-fns';

const PrintRadiologySummary = ({ reports, dateRange }) => {
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy hh:mm a");
    } catch {
      return dateString;
    }
  };
const referByCount = reports.reduce((acc, report) => {
  const doctor = report.referBy || "N/A";
  acc[doctor] = (acc[doctor] || 0) + 1;
  return acc;
}, {});

  return (
    <div className="print-container" style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '30px',
      color: '#333',
      backgroundColor: '#fff',
      lineHeight: 1.5
    }}>
      {/* Header with improved branding */}
      <div className="header" style={{
        textAlign: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #005792'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#005792',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '15px',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '24px'
          }}>SMDC</div>
          <div>
            <div className="hospital-name" style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#005792',
              marginBottom: '5px',
              letterSpacing: '1px'
            }}>AL-SHAHBAZ MODERN DIAGNOSTIC CENTER</div>
            <div className="hospital-subtitle" style={{
              fontSize: '16px',
              color: '#555',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Radiology Department</div>
          </div>
        </div>
        
        <div style={{
          marginTop: '20px',
          fontSize: '18px',
          fontWeight: '600',
          color: '#005792'
        }}>
          Reports Summary
        </div>
        
        {dateRange && (
          <div className="date-range" style={{
            fontSize: '14px',
            color: '#666',
            marginTop: '10px',
            backgroundColor: '#f5f9ff',
            padding: '8px 15px',
            display: 'inline-block',
            borderRadius: '4px'
          }}>
            <span style={{fontWeight: '600'}}>Period:</span> {dateRange.startDate && formatDate(dateRange.startDate)}
            {dateRange.endDate && ` - ${formatDate(dateRange.endDate)}`}
          </div>
        )}
      </div>

      {/* Summary table with improved styling */}
      <table className="summary-table" style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '30px',
        fontSize: '14px'
      }}>
        <thead>
          <tr style={{
            backgroundColor: '#005792',
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <th style={{
              padding: '12px 10px',
              textAlign: 'left',
              fontWeight: '600',
              width: '5%'
            }}>#</th>
            <th style={{
              padding: '12px 10px',
              textAlign: 'left',
              fontWeight: '600',
              width: '10%'
            }}>MR No.</th>
            <th style={{
              padding: '12px 10px',
              textAlign: 'left',
              fontWeight: '600',
              width: '20%'
            }}>Patient</th>
            <th style={{
              padding: '12px 10px',
              textAlign: 'left',
              fontWeight: '600',
              width: '20%'
            }}>Test</th>
            <th style={{
              padding: '12px 10px',
              textAlign: 'left',
              fontWeight: '600',
              width: '15%'
            }}>Referred By</th>
            <th style={{
              padding: '12px 10px',
              textAlign: 'left',
              fontWeight: '600',
              width: '15%'
            }}>Date/Time</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, index) => (
            <tr key={report._id} style={{
              borderBottom: '1px solid #e0e6ed',
              ':nth-child(even)': {
                backgroundColor: '#f8fafc'
              },
              ':hover': {
                backgroundColor: '#f0f7ff'
              }
            }}>
              <td style={{
                padding: '12px 10px',
                color: '#666'
              }}>{index + 1}</td>
              <td style={{
                padding: '12px 10px',
                fontWeight: '500'
              }}>{report.patientMRNO}</td>
              <td style={{padding: '12px 10px'}}>
                <div style={{
                  fontWeight: '600',
                  color: '#005792',
                  marginBottom: '4px'
                }}>{report.patientName}</div>
                <div style={{
                  color: '#666',
                  fontSize: '0.85em'
                }}>
                  {report.sex}, {report.age} years
                </div>
              </td>
              <td style={{padding: '12px 10px'}}>
                <div style={{
                  fontWeight: '500'
                }}>
                  {report.templateName.replace(".html", "").replace(/-/g, " ")}
                </div>
              </td>
              <td style={{
                padding: '12px 10px',
                color: '#444'
              }}>{report.referBy || "N/A"}</td>
              <td style={{
                padding: '12px 10px',
                color: '#555',
                fontSize: '0.9em'
              }}>{formatDate(report.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
{/* Assigned Doctor Summary */}
<div style={{
  marginTop: '30px',
  padding: '20px',
  backgroundColor: '#f9fbfd',
  border: '1px solid #e0e6ed',
  borderRadius: '6px',
  fontSize: '14px',
}}>
  <div style={{
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#005792'
  }}>
    Assigned Doctor Summary (Referred By)
  </div>
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr style={{ backgroundColor: '#e6f0fa', textAlign: 'left' }}>
        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Doctor</th>
        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Patient Count</th>
      </tr>
    </thead>
    <tbody>
      {Object.entries(referByCount).map(([doctor, count]) => (
        <tr key={doctor}>
          <td style={{ padding: '8px', border: '1px solid #ddd' }}>{doctor}</td>
          <td style={{ padding: '8px', border: '1px solid #ddd' }}>{count}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      {/* Footer with improved layout */}
      <div className="footer" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #e0e6ed',
        color: '#666',
        fontSize: '14px'
      }}>
        <div className="contact-info" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div>Phone: +123 456 7890</div>
          <div>Email: info@alshahbazdiagnostic.com</div>
          <div>Address: 123 Medical St, Health City</div>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px'
        }}>
          <div className="timestamp">
            <span style={{fontWeight: '600'}}>Printed on:</span> {formatDate(new Date().toISOString())}
          </div>
          <div className="total" style={{
            fontWeight: 'bold',
            color: '#005792',
            fontSize: '16px',
            backgroundColor: '#f0f7ff',
            padding: '8px 15px',
            borderRadius: '4px'
          }}>
            Total Reports: {reports.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintRadiologySummary;