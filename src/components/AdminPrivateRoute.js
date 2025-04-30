import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';

const AdminPrivateRoute = ({ children }) => {
  const { adminUser } = useAdmin();
  
  if (!adminUser) {
    // If no admin user, redirect to admin login
    return <Navigate to="/admin/login" />;
  }
  
  return children;
};

export default AdminPrivateRoute; 