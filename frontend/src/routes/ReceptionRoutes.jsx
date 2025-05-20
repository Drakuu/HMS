import React from "react";
import { ReceptionDashboard,AdminDashboard, HRDashboard, PatientDashboard, Departments, OTPatientDetails, AddStaff, IPDAdmission, AdmittedPatientDetails, IPDForm, DoctorPannel, AddNewDoctor, NewOpd, ManageOpd, OTMain, PatientAppointment, Ward, Inventory, BillList, MedicineList, Calendar, DoctorDetails } from "../pages/reception/ReceptionPages";
import ReceptionLayout from "../layouts/Reception/ReceptionLayout";
import { Route } from "react-router-dom";
import DeletedAppointmentsPage from "../components/ui/DeletedAppointmentsPage";

const ReceptionRoutes = () => {
  return (
    <>
      {/* receptiondashboard */}
      <Route path="/receptiondashboard" element={<ReceptionLayout><ReceptionDashboard /></ReceptionLayout>} />
      <Route path="/hr-dashboard" element={<ReceptionLayout><HRDashboard /></ReceptionLayout>} />
      <Route path="/patient-dashboard" element={<ReceptionLayout><PatientDashboard /></ReceptionLayout>} />
      <Route path="/admin-dashboard" element={<ReceptionLayout><AdminDashboard /></ReceptionLayout>} />

      {/* hr routes */}
      {/* departments routes  */}
      <Route path="/departments" element={<ReceptionLayout>< Departments /></ReceptionLayout>} />

      {/* addstaff */}
      <Route path="/staff" element={<ReceptionLayout>< AddStaff /></ReceptionLayout>} />

      {/* Doctor Routes  */}
      <Route path="/doctors" element={<ReceptionLayout> <DoctorPannel /></ReceptionLayout>} />
      <Route path="/add-doctor" element={<ReceptionLayout><AddNewDoctor mode="create" /></ReceptionLayout>} />
      <Route path="/edit-doctor/:doctorId" element={<ReceptionLayout> <AddNewDoctor mode="edit" /></ReceptionLayout>} />
      <Route path="/doctor-details/:doctorId" element={<ReceptionLayout> <DoctorDetails /></ReceptionLayout>} />

      {/* rooms managmnet routes  */}
      <Route path="/ward-management" element={<ReceptionLayout>< Ward /></ReceptionLayout>} />

      {/* ipd routes  */}
      <Route path="/ipd/ssp" element={<ReceptionLayout> <IPDForm /></ReceptionLayout>} />
      <Route path="/ipd/private" element={<ReceptionLayout><IPDForm /></ReceptionLayout>} />
      <Route path="/ipd/Admitted" element={<ReceptionLayout><IPDAdmission /></ReceptionLayout>} />
      <Route path="/patient-details/:mrno" element={<ReceptionLayout><AdmittedPatientDetails /></ReceptionLayout>} />

      {/* OPD Routes  */}
      <Route path="/opd/newopd" element={<ReceptionLayout><NewOpd mode="create" /></ReceptionLayout>} />
      <Route path="/opd/edit/:patientMRNo" element={<ReceptionLayout><NewOpd mode="edit" /></ReceptionLayout>} />
      <Route path="/opd/manage" element={<ReceptionLayout><ManageOpd /></ReceptionLayout>} />

      {/* appointnment routes  */}
      <Route path="/patient-appointment" element={<ReceptionLayout><PatientAppointment /></ReceptionLayout>} />

      <Route path="/appointment/patient-appointment/deleted" element={<ReceptionLayout><DeletedAppointmentsPage /></ReceptionLayout>} />

      {/* ot routes */}
      <Route path="/OTMain" element={<ReceptionLayout><OTMain /></ReceptionLayout>} />
      <Route path="/OTPatientDetails/:mrno" element={<ReceptionLayout><OTPatientDetails /></ReceptionLayout>} />

      {/* inventory routes  */}
      <Route path="/inventory" element={<ReceptionLayout><Inventory /></ReceptionLayout>} />

      {/* accounts routes  */}
      <Route path="/account/bill-list" element={<ReceptionLayout><BillList /></ReceptionLayout>} />

      {/* Pharmacy route */}
      <Route path="/Med-list" element={<ReceptionLayout><MedicineList /></ReceptionLayout>} />

      {/* calendar routes  */}
      <Route path="/calendar" element={<ReceptionLayout><Calendar /></ReceptionLayout>} />


    </>
  );
};

export default ReceptionRoutes;








