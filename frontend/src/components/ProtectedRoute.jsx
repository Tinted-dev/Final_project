import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// `allowedRoles` will be an array of roles that are allowed to access this route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth(); // Get user and loading state from AuthContext

  if (loading) {
    return <div>Loading authentication...</div>; // Or a spinner
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles are specified, check if the user's role is in the allowed list
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user.role || !allowedRoles.includes(user.role)) {
      // User is logged in but doesn't have the required role
      // Redirect to a forbidden page or home, or show an access denied message
      console.warn(`Access Denied: User role '${user.role}' not in allowed roles: ${allowedRoles.join(', ')}`);
      return <Navigate to="/" replace />; // Redirect to home or an access denied page
    }
  }

  // If user is logged in and has the allowed role (or no specific roles are required)
  return children ? children : <Outlet />;
};

export default ProtectedRoute;