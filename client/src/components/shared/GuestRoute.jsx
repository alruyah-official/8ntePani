import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const GuestRoute = () => {
  const token = localStorage.getItem('token');
  
  // If the user is already authenticated, redirect them to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the guest route (like login or signup)
  return <Outlet />;
};
