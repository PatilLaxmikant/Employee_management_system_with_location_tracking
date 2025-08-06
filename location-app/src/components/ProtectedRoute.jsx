/* ========== src/components/ProtectedRoute.jsx ========== */
// This component protects pages that should only be seen by logged-in users.
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { token } = useAuth();

  // If there is no token, the user is not logged in. Redirect them to the login page.
  // Otherwise, show the protected page they requested (e.g., Dashboard).
  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
