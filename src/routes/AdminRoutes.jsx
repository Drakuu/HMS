import React from 'react'
import { Route } from "react-router-dom";
import { AdminDashboard,} from "../pages/admin/AdminPages"
import AdminLayout from '../layouts/Admin/AdminLayout'

const AdminRoutes = () => {
  return (
    <>

      <Route
        path="/admindashboard"
        element={
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        }
      />
    </>
  )
}

export default AdminRoutes
