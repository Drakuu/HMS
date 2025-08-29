import React from 'react';
import { format, parseISO } from 'date-fns';

const PrintLabBillSummary = ({ bills, dateRange }) => {
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy hh:mm a");
    } catch {
      return dateString;
    }
  };

  // Extract test names from selectedTests array
  const getTestNames = (bill) => {
    if (bill.selectedTests && Array.isArray(bill.selectedTests)) {
      return bill.selectedTests.map(test => 
        test.testDetails?.testName || test.testDetails?.testCode || "Unknown Test"
      ).join(", ");
    }else if(bill.templateName){
        return bill.templateName
    }
    return "No tests";
  };

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
      {/* Header */}
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
            }}>Laboratory Department</div>
          </div>
        </div>
        
        <div style={{
          marginTop: '20px',
          fontSize: '18px',
          fontWeight: '600',
          color: '#005792'
        }}>
          Lab Bill Summary
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

      {/* Summary table */}
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
              width: '30%'
            }}>Tests</th>
            <th style={{
              padding: '12px 10px',
              textAlign: 'left',
              fontWeight: '600',
              width: '15%'
            }}>Total Amount</th>
            <th style={{
              padding: '12px 10px',
              textAlign: 'left',
              fontWeight: '600',
              width: '10%'
            }}>Status</th>
            <th style={{
              padding: '12px 10px',
              textAlign: 'left',
              fontWeight: '600',
              width: '20%'
            }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill, index) => (
            <tr key={bill._id} style={{
              borderBottom: '1px solid #e0e6ed',
              backgroundColor: index % 2 === 0 ? '#f8fafc' : 'transparent'
            }}>
              <td style={{
                padding: '12px 10px',
                color: '#666'
              }}>{index + 1}</td>
              <td style={{
                padding: '12px 10px',
                fontWeight: '500'
              }}>{bill.patientMRNO || bill.patient_Detail?.patient_MRNo || "N/A"}</td>
              <td style={{padding: '12px 10px'}}>
                <div style={{
                  fontWeight: '600',
                  color: '#005792',
                  marginBottom: '4px'
                }}>{bill.patientName || bill.patient_Detail?.patient_Name || "Unknown"}</div>
                <div style={{
                  color: '#666',
                  fontSize: '0.85em'
                }}>
                  {bill.sex || bill.patient_Detail?.patient_Gender || "N/A"}
                </div>
              </td>
              <td style={{padding: '12px 10px'}}>
                <div style={{
                  fontWeight: '500'
                }}>
                  {getTestNames(bill)}
                </div>
              </td>
              <td style={{
                padding: '12px 10px',
                color: '#444'
              }}>Rs. {(bill.totalAmount || 0).toLocaleString()}</td>
              <td style={{
                padding: '12px 10px',
                color: (bill.paymentStatus === 'Paid' || bill.paymentStatus === 'paid') ? '#2f855a' : '#b7791f',
                fontWeight: 'bold'
              }}>{bill.paymentStatus}</td>
              <td style={{
                padding: '12px 10px',
                color: '#555',
                fontSize: '0.9em'
              }}>{formatDate(bill.date || bill.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
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
            Total Bills: {bills.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintLabBillSummary;