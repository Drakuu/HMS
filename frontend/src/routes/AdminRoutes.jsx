import React from 'react'
import { Route } from "react-router-dom";
import { AdminDashboard, AdminPaitient, AddNew } from "../pages/admin/AdminPages"
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

      <Route
        path="/adminpaitient"
        element={
          <AdminLayout>
            <AdminPaitient />
          </AdminLayout>
        }
      />



      <Route
        path="/addnew"
        element={
          <AdminLayout>
            <AddNew />
          </AdminLayout>
        }
      />
    </>
  )
}

export default AdminRoutes
