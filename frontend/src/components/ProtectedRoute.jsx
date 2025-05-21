import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading: authLoading, accessToken } = useAuth();

  console.log("ProtectedRoute: Rendering..."); // <--- DEBUG LOG 1
  console.log(`ProtectedRoute: authLoading: ${authLoading}, user: ${user ? user.username : 'null'}, user.role: ${user?.role}, accessToken: ${!!accessToken}`); // <--- DEBUG LOG 2

  if (authLoading) {
    console.log("ProtectedRoute: Auth is loading, returning loading message."); // <--- DEBUG LOG 3
    return <p className="text-center mt-20 text-gray-600">Loading authentication...</p>;
  }

  if (!user || !accessToken) {
    console.log("ProtectedRoute: User not authenticated or token missing, redirecting to login."); // <--- DEBUG LOG 4
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(`ProtectedRoute: User role '${user.role}' not in allowed roles [${allowedRoles.join(', ')}], redirecting to unauthorized.`); // <--- DEBUG LOG 5
    // You might want a specific unauthorized page here, or just redirect home/login
    return <Navigate to="/login" replace />; // Or to a /unauthorized page
  }

  console.log("ProtectedRoute: Conditions met, rendering children."); // <--- DEBUG LOG 6
  return children;
};

export default ProtectedRoute;
