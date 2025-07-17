// pages/staff/index.js
import React, { useState } from 'react';
import StaffManagement from './AddStaff';
import StaffDetailModal from './StaffDetailModel';

const StaffPage = () => {
  const [viewingStaff, setViewingStaff] = useState(null);

  return (
    <div>
      <StaffManagement onViewStaff={setViewingStaff} />
      {viewingStaff && (
        <StaffDetailModal 
          staff={viewingStaff} 
          onClose={() => setViewingStaff(null)} 
        />
      )}
    </div>
  );
};

export default StaffPage;