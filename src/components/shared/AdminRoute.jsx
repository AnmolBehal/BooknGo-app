// ─── AdminRoute ───
// Guards admin-only pages by checking if the authenticated user's email matches the admin email.

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
