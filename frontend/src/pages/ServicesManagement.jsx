import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ServicesManagement = () => {
  const { accessToken, isAdmin, loading: authLoading } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editServiceId, setEditServiceId] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/services/');
      setServices(res.data);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError('Failed to fetch services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (isAdmin) {
        fetchServices();
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
      if (editServiceId) {
        await axios.put(`http://localhost:5000/api/services/${editServiceId}`, form, { headers });
        alert('Service updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/services/', form, { headers });
        alert('Service created successfully!');
      }
      setForm({ name: '', description: '' });
      setEditServiceId(null);
      fetchServices();
    } catch (err) {
      console.error("Error submitting service:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to save service.');
    }
  };

  const handleEditClick = (service) => {
    setEditServiceId(service.id);
    setForm({ name: service.name, description: service.description || '' });
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) return;
    setError(null);
    if (!accessToken || !isAdmin) {
      setError('Unauthorized: You must be an admin to perform this action.');
      return;
    }

    const headers = { Authorization: `Bearer ${accessToken}` };

    try {
      await axios.delete(`http://localhost:5000/api/services/${serviceId}`, { headers });
      alert('Service deleted successfully!');
      fetchServices();
    } catch (err) {
      console.error("Error deleting service:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to delete service.');
    }
  };

  if (authLoading) return <p className="text-center mt-8 text-gray-600">Loading authentication...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;
  if (!isAdmin) return <p className="text-center mt-8 text-red-600">Access Denied: You must be an administrator to manage services.</p>;
  if (loading) return <p className="text-center mt-8 text-gray-600">Loading services...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Manage Services</h1>

      {/* Create/Edit Service Form */}
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mb-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">{editServiceId ? 'Edit Service' : 'Create New Service'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Service Name:</label>
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
              {editServiceId ? 'Update Service' : 'Create Service'}
            </button>
            {editServiceId && (
              <button
                type="button"
                onClick={() => {
                  setEditServiceId(null);
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

      {/* Services List */}
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Existing Services</h2>
      {services.length === 0 ? (
        <p className="text-center text-gray-600 py-4">No services found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.description || 'No description'}</p>
              </div>
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => handleEditClick(service)}
                  className="btn-warning flex-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
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

export default ServicesManagement;
