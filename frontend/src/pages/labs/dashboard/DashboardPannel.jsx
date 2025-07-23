import React, { useEffect } from 'react';
import Header from './Header';
import TestSummaryCard from './TestSummaryCard';
import TestTypeOverview from './TestTypeOverview';
import AlertsList from './AlertsList';
import LabTechnicianSummary from './LabTechnicianSummary';
import { getTestHistory } from "../../../features/patientTest/patientTestSlice";
import { useSelector, useDispatch } from "react-redux";
import { motion } from 'framer-motion';

const DashboardPannel = () => {
  const testHistory = useSelector((state) => state.patientTest.testHistory);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTestHistory());
  }, [dispatch]);

  // Process test history data for dashboard
  const dashboardData = {
    totalTests: testHistory?.length || 0,
    completedTests: testHistory?.filter(test => 
      test.selectedTests?.every(t => t.statusHistory?.some(s => s.status === 'completed'))
    ).length || 0,
    pendingTests: testHistory?.filter(test => 
      test.selectedTests?.some(t => !t.statusHistory?.some(s => s.status === 'completed'))
    ).length || 0,
    urgentTests: testHistory?.filter(test => test.priority === 'urgent').length || 0
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-6"
      >
        <TestSummaryCard data={dashboardData} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <TestTypeOverview testHistory={testHistory} />
          </div>
          <div>
            <AlertsList />
          </div>
        </div>
        <LabTechnicianSummary testHistory={testHistory} />
      </motion.div>
    </div>
  );
}

export default DashboardPannel;