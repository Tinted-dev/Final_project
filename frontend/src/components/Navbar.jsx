import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Garbage App</Link>
        <div className="space-x-4">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          <Link to="/companies" className="hover:text-gray-300">Companies</Link>
          
          {/* Show Services Management link only if isAdmin is true */}
          {isAdmin && (
            <Link to="/admin/services" className="hover:text-gray-300">Manage Services</Link>
          )}
          {/* Show Regions Management link only if isAdmin is true */}
          {isAdmin && ( // <--- NEW CONDITIONAL LINK
            <Link to="/admin/regions" className="hover:text-gray-300">Manage Regions</Link>
          )}

          {user ? (
            <>
              <span className="text-gray-300">Welcome, {user.username} ({user.role})</span>
              <button onClick={logout} className="hover:text-gray-300">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300">Login</Link>
              <Link to="/register" className="hover:text-gray-300">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
