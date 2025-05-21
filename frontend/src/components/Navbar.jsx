import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav className="bg-gray-800 p-4 text-white shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <Link to="/" className="text-6xl font-bold text-white mb-3 md:mb-0 hover:text-blue-300 transition duration-200">
          EcoWaste
        </Link>
        <div className="flex flex-wrap justify-center md:justify-end items-center space-x-4">
          <Link to="/" className="hover:text-blue-300 transition duration-200">Home</Link>
          <Link to="/companies" className="hover:text-blue-300 transition duration-200">Companies</Link>
          
          {/* Admin Links */}
          {isAdmin && (
            <>
              <Link to="/admin-dashboard" className="hover:text-blue-300 transition duration-200">Admin Dashboard</Link>
              <Link to="/admin/services" className="hover:text-blue-300 transition duration-200">Manage Services</Link>
              <Link to="/admin/regions" className="hover:text-blue-300 transition duration-200">Manage Regions</Link>
            </>
          )}

          {/* Company Owner Link */}
          {user && user.role === 'company_owner' && (
            <Link to="/my-company-dashboard" className="hover:text-blue-300 transition duration-200">My Company</Link>
          )}

          {user ? (
            <>
              {/* My Profile Link (for any logged-in user) */}
              <Link to="/my-profile" className="hover:text-blue-300 transition duration-200">My Profile</Link>
              <span className="text-gray-300 text-sm md:text-base px-2 py-1 bg-gray-700 rounded-md">
                Welcome, {user.username} ({user.role})
              </span>
              <button onClick={logout} className="ml-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition duration-200 shadow-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-300 transition duration-200">Login</Link>
              <Link to="/register-company" className="hover:text-blue-300 transition duration-200">Register Company</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
