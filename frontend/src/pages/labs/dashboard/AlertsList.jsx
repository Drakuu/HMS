import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Bell, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';

const AlertsList = () => {
  // Get test history from Redux store
  const testHistory = useSelector((state) => state.patientTest.testHistory);
  
  // Process test history to generate dynamic alerts
  const generateAlerts = () => {
    if (!testHistory || testHistory.length === 0) return [];
    
    const alerts = [];
    
    // 1. Check for expired samples (assuming testDate exists)
    const now = new Date();
    testHistory.forEach(test => {
      test.selectedTests.forEach(selectedTest => {
        const testDate = new Date(selectedTest.testDate);
        const hoursDiff = Math.abs(now - testDate) / 36e5;
        
        // Alert for samples older than 24 hours
        if (hoursDiff > 24 && selectedTest.sampleStatus !== 'collected') {
          alerts.push({
            id: `${test._id}-${selectedTest._id}-expired`,
            message: `Sample for ${selectedTest.testDetails.testName} expired`,
            timeStatus: `${Math.floor(hoursDiff)} hours ago`,
            priority: "high",
            testType: selectedTest.testDetails.testName,
            patient: test.patient_Detail.patient_Name
          });
        }
        
        // Alert for critical tests (assuming some tests are marked critical)
        if (selectedTest.testDetails.testCode === 'cns') { // Example critical test code
          alerts.push({
            id: `${test._id}-${selectedTest._id}-critical`,
            message: `Critical test pending: ${selectedTest.testDetails.testName}`,
            timeStatus: `${Math.floor(hoursDiff)} hours ago`,
            priority: "critical",
            testType: selectedTest.testDetails.testName,
            patient: test.patient_Detail.patient_Name
          });
        }
      });
      
      // Alert for unpaid tests
      if (test.paymentStatus === 'pending' && test.finalAmount > 0) {
        alerts.push({
          id: `${test._id}-payment`,
          message: `Unpaid test for ${test.patient_Detail.patient_Name}`,
          timeStatus: "Pending payment",
          priority: "medium",
          testType: "Payment",
          patient: test.patient_Detail.patient_Name
        });
      }
    });
    
    return alerts;
  };

  const alerts = generateAlerts();
  
  // If no alerts, show a peaceful message
  if (alerts.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center"
      >
        <div className="text-center">
          <Bell className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700">All Clear!</h3>
          <p className="text-gray-500 mt-1">No urgent alerts at this time</p>
        </div>
      </motion.div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 border-l-red-600';
      case 'high': return 'bg-orange-100 border-l-orange-500';
      case 'medium': return 'bg-amber-100 border-l-amber-400';
      default: return 'bg-gray-100 border-l-gray-400';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Alerts & Notifications</h3>
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {alerts.length} New
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            whileHover={{ scale: 1.01 }}
            className={`p-4 rounded-lg border-l-4 ${getPriorityColor(alert.priority)} flex flex-col sm:flex-row justify-between gap-2 cursor-pointer transition-all`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${alert.priority === 'critical' ? 'bg-red-200' : 'bg-amber-200'}`}>
                <AlertTriangle className={`w-4 h-4 ${alert.priority === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
              </div>
              <div>
                <p className="font-medium text-gray-800">{alert.message}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                  <span className="text-xs text-gray-500">Patient: {alert.patient}</span>
                  <span className="text-xs text-gray-500">Test: {alert.testType}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{alert.timeStatus}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <button className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800">
          <ChevronRight className="w-4 h-4" />
          <span>View all alerts</span>
        </button>
      </div>
    </motion.div>
  );
};

export default AlertsList;