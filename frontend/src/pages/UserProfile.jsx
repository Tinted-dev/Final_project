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
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setFormData(prev => ({
          ...prev,
          username: res.data.username,
          email: res.data.email,
        }));
      } catch (err) {
        console.error("Error fetching user profile:", err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    if (accessToken && user) {
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
    if (password) updatePayload.password = password;

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
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      // Optionally, re-fetch user data to update AuthContext if username/email changed
    } catch (err) {
      console.error("Error updating profile:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <p className="text-center mt-8 text-gray-600">Loading profile...</p>;
  if (!user) return <p className="text-center mt-8 text-red-600">Please log in to view your profile.</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">My Profile</h1>
      {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}
      {successMessage && <p className="text-green-600 text-sm text-center mb-4">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">New Password (leave blank to keep current):</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary"
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
