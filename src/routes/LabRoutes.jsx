import { Route } from 'react-router-dom';
import {
  PatientManagment, Dashboard,
} from '../pages/labs/labsPages'

const LabRoutes = () => {
  return (
    <>
      {/* dashboard routes */}
      <Route path="/lab-dashboard" element={<><Dashboard /></>} />
      {/* patient routes */}
      <Route path="/add-patient" element={<><PatientManagment /></>} />

      {/* labs routs */}
      <Route path="/lab-test" element={<><LabTestForm /></>} />
    </>
  )
}

export default LabRoutes
