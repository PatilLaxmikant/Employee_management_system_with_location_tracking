// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = () => {
  const { user } = useAuth();

  // If user is loaded and is an admin, show the admin page.
  // Otherwise, redirect them to the regular user dashboard.
  return user && user.is_admin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
