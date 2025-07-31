// dashboard imports
import ReceptionDashboard from './dashboards/ReceptionDashboard';
import HRDashboard from './dashboards/hrdashboard';
import PatientDashboard from './dashboards/patientdashboard';
import AdminDashboard from './dashboards/AdminDashboard';

// room manahment imports
import Ward from './ward/WardManagment';
import BedDetails from "./ward/BedDetails"
// opd imports
import NewOpd from './opd/NewOpd';
import ManageOpd from './opd/ManageOpd';
// ipd imports
import IPDForm from './ipd/Ipdform';
import IPDAdmission from './ipd/Admision';
import AdmittedPatientDetails from './ipd/AdmittedPatientDetails';
// appointment import
import PatientAppointment from './appointment/PatientAppointment';
//inventory imports
import Inventory from './inventory/Inventory';
//accounts imports
import BillList from './accounts/BillList';
//pharamacy import
import MedicineList from './pharmacy/MedicalList';
import PrescriptionManagement from './pharmacy/PrescriptionManagement';
import StockManagement from './pharmacy/StockManagement';
// calendar import
import Calendar from './calendar/Calendar';
// import operation therater
import OTMain from './operationTheater/OTMain';
import OTPatientDetails from './operationTheater/OTPatientDetails';

export {
  ReceptionDashboard,
  HRDashboard,
  PatientDashboard,
  AdminDashboard,
  IPDForm,
  AdmittedPatientDetails,
  OTPatientDetails,
  IPDAdmission,
  Ward,
  NewOpd,
  OTMain,
  PatientAppointment,
  MedicineList,
  PrescriptionManagement,
  StockManagement,
  ManageOpd,
  Inventory,
  BillList,
  Calendar,
  BedDetails,
  // AddNewDoctor,
  // DoctorPannel,
  // DoctorDetails,
};
