import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // If a user is already logged in, redirect them based on their role
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user.role === 'collector') {
      return <Navigate to="/collector-dashboard" replace />;
    } else if (user.role === 'company_owner') { // <--- NEW: Redirect company_owner
      return <Navigate to="/my-company-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />; // Default for other users
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { username, password } = formData;

    if (!username.trim() || !password) {
      setError('Username and password are required.');
      setLoading(false);
      return;
    }

    try {
      const result = await login(username, password);

      if (result && result.success && result.user) {
        // After successful login, check the role from the returned user object
        if (result.user.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (result.user.role === 'collector') {
          navigate('/collector-dashboard');
        } else if (result.user.role === 'company_owner') { // <--- NEW: Redirect company_owner
          navigate('/my-company-dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(result && result.message ? result.message : 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error("Login attempt failed:", err);
      if (err.response && err.response.data && err.response.data.msg) {
          setError(err.response.data.msg);
      } else {
          setError('An unexpected error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl mb-6 font-semibold text-center">Login</h1>
      <form onSubmit={handleSubmit} noValidate>
        {/* Username Input */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            autoComplete="username"
            required
            disabled={loading}
          />
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            autoComplete="current-password"
            required
            disabled={loading}
          />
        </div>

        {/* Error Message Display */}
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
