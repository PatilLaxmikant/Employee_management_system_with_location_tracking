/* ========== src/components/PublicRoute.jsx ========== */
// This component redirects logged-in users away from public pages.
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = () => {
  const { token } = useAuth();
  
  // If a token exists, the user is logged in. Redirect them to the dashboard.
  // Otherwise, show the public page they requested (e.g., Login).
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;