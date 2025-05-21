import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate, Link } from 'react-router-dom';

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
    } else if (user.role === 'company_owner') {
      return <Navigate to="/my-company-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
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
        if (result.user.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (result.user.role === 'collector') {
          navigate('/collector-dashboard');
        } else if (result.user.role === 'company_owner') {
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
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl mb-8 font-bold text-center text-gray-800">Welcome Back!</h1>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Username Input */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            autoComplete="username"
            required
            disabled={loading}
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            autoComplete="current-password"
            required
            disabled={loading}
          />
        </div>

        {/* Error Message Display */}
        {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        Don't have a company account? <Link to="/register-company" className="text-blue-600 hover:underline">Register your company here</Link>
      </p>
    </div>
  );
}
