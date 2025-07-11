import React from 'react'
import Header from './Header'
import TestSummaryCard from './TestSummaryCard'
import TestTypeOverview from './TestTypeOverview'
import AlertsList from './AlertsList'
import LabTechnicianSummary from './LabTechnicianSummary'

const DashboardPannel = () => {
  console.log("i am here")

  return (
    <>
      <Header />
      <TestSummaryCard />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        <TestTypeOverview />
        <AlertsList />
      </div>
      <LabTechnicianSummary />
    </>
  )
}

export default DashboardPannel