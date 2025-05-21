import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { user, accessToken, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '', // For new password input
    confirmPassword: '', // For new password confirmation
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch user data on component mount or when user/token changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      if (!accessToken) {
        setLoading(false);
        return; // Handled by the redirect above
      }

      try {
        const res = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        // Populate form with current user data (excluding password for security)
        setFormData(prev => ({
          ...prev,
          username: res.data.username,
          email: res.data.email,
          // Do NOT set password here
        }));
      } catch (err) {
        console.error("Error fetching user profile:", err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    if (accessToken && user) { // Only fetch if authenticated
      fetchUserProfile();
    }
  }, [user, accessToken]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!accessToken) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      return;
    }

    const { username, email, password, confirmPassword } = formData;

    if (password && password !== confirmPassword) {
      setError('New password and confirm password do not match.');
      setLoading(false);
      return;
    }

    const updatePayload = {};
    if (username !== user.username) updatePayload.username = username;
    if (email !== user.email) updatePayload.email = email;
    if (password) updatePayload.password = password; // Only send if a new password is provided

    if (Object.keys(updatePayload).length === 0) {
      setError('No changes detected.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.put('http://localhost:5000/api/users/me', updatePayload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSuccessMessage(res.data.message || 'Profile updated successfully!');
      // Clear password fields after successful update
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      // Optionally, re-fetch user data to update AuthContext if username/email changed
      // (AuthContext's useEffect for /me will handle this on token refresh/re-check)
      // For immediate update, you could dispatch an action to AuthContext
    } catch (err) {
      console.error("Error updating profile:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <p className="text-center mt-8 text-gray-600">Loading profile...</p>;
  if (!user) return <p className="text-center mt-8 text-red-600">Please log in to view your profile.</p>; // Should be caught by redirect, but good fallback

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">My Profile</h1>
      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
      {successMessage && <p className="text-green-600 mb-4 text-center">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">New Password (leave blank to keep current):</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
