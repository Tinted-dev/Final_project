import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth(); // isAdmin is still used for admin-specific links

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Garbage App</Link>
        <div className="space-x-4">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          <Link to="/companies" className="hover:text-gray-300">Companies</Link>
          
          {/* Admin Links */}
          {isAdmin && (
            <>
              <Link to="/admin/services" className="hover:text-gray-300">Manage Services</Link>
              <Link to="/admin/regions" className="hover:text-gray-300">Manage Regions</Link>
            </>
          )}

          {/* Company Owner Link (remains) */}
          {user && user.role === 'company_owner' && (
            <Link to="/my-company-dashboard" className="hover:text-gray-300">My Company</Link>
          )}

          {user ? (
            <>
              {/* My Profile Link (for any logged-in user) */}
              <Link to="/my-profile" className="hover:text-gray-300">My Profile</Link> {/* <--- NEW LINK */}
              <span className="text-gray-300">Welcome, {user.username} ({user.role})</span>
              <button onClick={logout} className="hover:text-gray-300">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300">Login</Link>
              <Link to="/register-company" className="hover:text-gray-300">Register Company</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
