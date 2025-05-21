import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // To get accessToken

const ServicesManagement = () => {
  const { accessToken, isAdmin } = useAuth(); // Only admins can access this page
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editServiceId, setEditServiceId] = useState(null); // ID of service being edited

  // Fetch all services
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
    // Only fetch if user is an admin (frontend check)
    if (isAdmin) {
      fetchServices();
    } else if (!loading) {
      setError("You do not have permission to view this page.");
    }
  }, [isAdmin, loading]); // Depend on isAdmin and loading to re-evaluate

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Create/Update Service Submission
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
        // Update existing service
        await axios.put(`http://localhost:5000/api/services/${editServiceId}`, form, { headers });
        alert('Service updated successfully!');
      } else {
        // Create new service
        await axios.post('http://localhost:5000/api/services/', form, { headers });
        alert('Service created successfully!');
      }
      setForm({ name: '', description: '' }); // Clear form
      setEditServiceId(null); // Exit edit mode
      fetchServices(); // Re-fetch services to update list
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
      fetchServices(); // Re-fetch services
    } catch (err) {
      console.error("Error deleting service:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to delete service.');
    }
  };

  if (loading) return <p className="text-center mt-8">Loading services...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;
  if (!isAdmin) return <p className="text-center mt-8 text-red-600">Access Denied: You must be an administrator to manage services.</p>;


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Manage Services</h1>

      {/* Create/Edit Service Form */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">{editServiceId ? 'Edit Service' : 'Create New Service'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Service Name:</label>
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
              {editServiceId ? 'Update Service' : 'Create Service'}
            </button>
            {editServiceId && (
              <button
                type="button"
                onClick={() => {
                  setEditServiceId(null);
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

      {/* Services List */}
      <h2 className="text-2xl font-semibold mb-4 text-center">Existing Services</h2>
      {services.length === 0 ? (
        <p className="text-center text-gray-600">No services found.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <li key={service.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
              <p className="text-gray-700 mb-3">{service.description || 'No description'}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditClick(service)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
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

export default ServicesManagement;
