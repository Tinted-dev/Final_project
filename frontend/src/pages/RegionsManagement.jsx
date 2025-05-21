import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // To get accessToken and check isAdmin

const RegionsManagement = () => {
  const { accessToken, isAdmin, loading: authLoading } = useAuth(); // Get auth state
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editRegionId, setEditRegionId] = useState(null); // ID of region being edited

  // Fetch all regions
  const fetchRegions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/regions/');
      setRegions(res.data);
    } catch (err) {
      console.error("Error fetching regions:", err);
      setError('Failed to fetch regions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if authentication is loaded and user is an admin
    if (!authLoading) {
      if (isAdmin) {
        fetchRegions();
      } else {
        setError("Access Denied: You must be an administrator to manage regions.");
      }
    }
  }, [isAdmin, authLoading]); // Depend on isAdmin and authLoading to re-evaluate

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Create/Update Region Submission
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
        // Update existing region
        await axios.put(`http://localhost:5000/api/regions/${editRegionId}`, form, { headers });
        alert('Region updated successfully!');
      } else {
        // Create new region
        await axios.post('http://localhost:5000/api/regions/', form, { headers });
        alert('Region created successfully!');
      }
      setForm({ name: '', description: '' }); // Clear form
      setEditRegionId(null); // Exit edit mode
      fetchRegions(); // Re-fetch regions to update list
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
      await axios.delete(`http://localhost:5000/api/regions/${regionId}`, { headers });
      alert('Region deleted successfully!');
      fetchRegions(); // Re-fetch regions
    } catch (err) {
      console.error("Error deleting region:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to delete region.');
    }
  };

  if (authLoading) return <p className="text-center mt-8">Loading authentication...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;
  if (!isAdmin) return <p className="text-center mt-8 text-red-600">Access Denied: You must be an administrator to manage regions.</p>;
  if (loading) return <p className="text-center mt-8">Loading regions...</p>;


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Manage Regions</h1>

      {/* Create/Edit Region Form */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">{editRegionId ? 'Edit Region' : 'Create New Region'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Region Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Regions List */}
      <h2 className="text-2xl font-semibold mb-4 text-center">Existing Regions</h2>
      {regions.length === 0 ? (
        <p className="text-center text-gray-600">No regions found.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.map((region) => (
            <li key={region.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">{region.name}</h3>
              <p className="text-gray-700 mb-3">{region.description || 'No description'}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditClick(region)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(region.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RegionsManagement;
