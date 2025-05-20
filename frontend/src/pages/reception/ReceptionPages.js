// dashboard imports 
import ReceptionDashboard from "./dashboards/ReceptionDashboard";
import HRDashboard from "./dashboards/hrdashboard";
import PatientDashboard from "./dashboards/patientdashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
// hr imports 
// depatments imports 
import Departments from "./hr/departments/Departments";
// docotrs imports 
import AddNewDoctor from "./hr/doctor/AddNewDoctor";
import DoctorPannel from "./hr/doctor/DoctorPannel";
import DoctorDetails from "./hr/doctor/DoctorDetails";
//staff imports
import AddStaff from "./hr/staff/AddStaff"
// room manahment imports 
import Ward from "./ward/WardManagment";
// opd imports 
import NewOpd from "./opd/NewOpd";
import ManageOpd from "./opd/ManageOpd";
// ipd imports 
import IPDForm from "./ipd/Ipdform";
import IPDAdmission from "./ipd/Admision";
import AdmittedPatientDetails  from "./ipd/AdmittedPatientDetails";
// appointment import 
import PatientAppointment from "./appointment/PatientAppointment"
//inventory imports
import Inventory from "./inventory/Inventory"
//accounts imports 
import BillList from "./accounts/BillList";
//pharamacy import
import MedicineList from "./pharmacy/MedicalList";
// calendar import 
import Calendar from "./calendar/Calendar";
// import operation therater 
import OTMain from "./operationTheater/OTMain";
import OTPatientDetails  from "./operationTheater/OTPatientDetails";

export { ReceptionDashboard,HRDashboard,PatientDashboard, AdminDashboard, Departments, IPDForm, AdmittedPatientDetails,OTPatientDetails, IPDAdmission, DoctorPannel, Ward, AddNewDoctor, NewOpd,OTMain, PatientAppointment,MedicineList, ManageOpd, AddStaff, Inventory, BillList, Calendar ,DoctorDetails};
