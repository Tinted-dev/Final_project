import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RegionsManagement = () => {
  const { accessToken, isAdmin, loading: authLoading } = useAuth();
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editRegionId, setEditRegionId] = useState(null);

  const fetchRegions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/regions/`);
      setRegions(res.data);
    } catch (err) {
      console.error("Error fetching regions:", err);
      setError('Failed to fetch regions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (isAdmin) {
        fetchRegions();
      } else {
        setError("Access Denied: You do not have permission to view this page.");
      }
    }
  }, [isAdmin, authLoading]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!accessToken || !isAdmin) {
      setError('Unauthorized: You must be an admin to perform this action.');
      return;
    }

    const headers = { Authorization: `Bearer ${accessToken}` };

    try {
      if (editRegionId) {
        await axios.put(`${API_BASE_URL}/regions/${editRegionId}`, form, { headers });
        alert('Region updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/regions/`, form, { headers });
        alert('Region created successfully!');
      }
      setForm({ name: '', description: '' });
      setEditRegionId(null);
      fetchRegions();
    } catch (err) {
      console.error("Error submitting region:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to save region.');
    }
  };

  const handleEditClick = (region) => {
    setEditRegionId(region.id);
    setForm({ name: region.name, description: region.description || '' });
  };

  const handleDelete = async (regionId) => {
    if (!window.confirm('Are you sure you want to delete this region? This action cannot be undone.')) return;
    setError(null);
    if (!accessToken || !isAdmin) {
      setError('Unauthorized: You must be an admin to perform this action.');
      return;
    }

    const headers = { Authorization: `Bearer ${accessToken}` };

    try {
      await axios.delete(`${API_BASE_URL}/${regionId}`, { headers });
      alert('Region deleted successfully!');
      fetchRegions();
    } catch (err) {
      console.error("Error deleting region:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to delete region.');
    }
  };

  if (authLoading) return <p className="text-center mt-8 text-gray-600">Loading authentication...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;
  if (!isAdmin) return <p className="text-center mt-8 text-red-600">Access Denied: You must be an administrator to manage regions.</p>;
  if (loading) return <p className="text-center mt-8 text-gray-600">Loading regions...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Manage Regions</h1>

      {/* Create/Edit Region Form */}
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mb-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">{editRegionId ? 'Edit Region' : 'Create New Region'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Region Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description:</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="submit"
              className="btn-primary"
            >
              {editRegionId ? 'Update Region' : 'Create Region'}
            </button>
            {editRegionId && (
              <button
                type="button"
                onClick={() => {
                  setEditRegionId(null);
                  setForm({ name: '', description: '' });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Regions List */}
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Existing Regions</h2>
      {regions.length === 0 ? (
        <p className="text-center text-gray-600 py-4">No regions found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regions.map((region) => (
            <div key={region.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{region.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{region.description || 'No description'}</p>
              </div>
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => handleEditClick(region)}
                  className="btn-warning flex-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(region.id)}
                  className="btn-danger flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegionsManagement;
