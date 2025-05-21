import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Import useAuth

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accessToken, isAdmin, isCollector } = useAuth(); // Destructure isAdmin and isCollector

  // Logging for debugging (keep for now, remove later)
  useEffect(() => {
    console.log("CompanyDetails.jsx: User object:", user);
    console.log("CompanyDetails.jsx: isAdmin:", isAdmin);
    console.log("CompanyDetails.jsx: isCollector:", isCollector);
  }, [user, isAdmin, isCollector]);

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    status: '',
    region_id: '',
    services: [],
  });

  const [regions, setRegions] = useState([]);
  const [allServices, setAllServices] = useState([]);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:5000/api/companies/${id}`)
      .then(res => {
        setCompany(res.data);
        setForm({
          name: res.data.name,
          description: res.data.description || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          status: res.data.status || '',
          region_id: res.data.region ? res.data.region.id : '',
          services: res.data.services ? res.data.services.map(s => s.id) : [],
        });
      })
      .catch((err) => {
        console.error("Error fetching company details:", err);
        setError('Failed to load company details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/regions/') // Trailing slash
      .then(res => setRegions(res.data))
      .catch(err => console.error("Error fetching regions:", err));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/services/') // Trailing slash
      .then(res => setAllServices(res.data))
      .catch(err => console.error("Error fetching services:", err));
  }, []);

  const handleChange = e => {
    const { name, value, type, options } = e.target;
    if (type === 'select-multiple') {
      const selectedValues = Array.from(options).filter(option => option.selected).map(option => Number(option.value));
      setForm(prev => ({ ...prev, [name]: selectedValues }));
    } else if (name === 'region_id') {
      setForm(prev => ({ ...prev, [name]: value ? Number(value) : '' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setError('');
    try {
      if (!accessToken) {
        setError('Authentication token not found. Please log in.');
        return;
      }

      const headers = { Authorization: `Bearer ${accessToken}` };

      const dataToSend = {
          ...form,
          region_id: form.region_id ? Number(form.region_id) : null,
          services: form.services.map(Number)
      };

      await axios.put(`http://localhost:5000/api/companies/${company.id}`, dataToSend, { headers });
      
      axios.get(`http://localhost:5000/api/companies/${id}`)
        .then(res => setCompany(res.data))
        .catch(err => console.error("Error re-fetching company after update:", err))
        .finally(() => setEditMode(false));
        
      alert('Company updated successfully!');

    } catch (err) {
      console.error('Update failed:', err.response ? err.response.data : err.message);
      const errorMessage = err.response && err.response.data && err.response.data.error 
                                 ? err.response.data.error 
                                 : 'An unexpected error occurred during update.';
      setError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) return;
    setError('');
    try {
      if (!accessToken) {
        setError('Authentication token not found. Please log in.');
        return;
      }

      const headers = { Authorization: `Bearer ${accessToken}` };

      await axios.delete(`http://localhost:5000/api/companies/${company.id}`, { headers });
      alert('Company deleted successfully!');
      navigate('/companies');
    } catch (err) {
      console.error('Delete failed:', err.response ? err.response.data : err.message);
      const errorMessage = err.response && err.response.data && err.response.data.error 
                                 ? err.response.data.error 
                                 : 'An unexpected error occurred during deletion.';
      setError(errorMessage);
    }
  };

  if (loading) return <p className="text-center mt-8 text-gray-600">Loading company details...</p>;
  if (error) return <p className="text-center mt-8 text-red-600 font-semibold">{error}</p>;
  if (!company) return <p className="text-center mt-8 text-gray-600">Company not found.</p>;

  return (
    <div className="container mx-auto p-4">
      {editMode ? (
        <form onSubmit={handleUpdate} className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Edit Company</h3>
          <div className="mb-4">
            <label htmlFor="name" className="block mb-1 font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block mb-1 font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phone" className="block mb-1 font-medium text-gray-700">Phone</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="status" className="block mb-1 font-medium text-gray-700">Status</label>
            <input
              type="text"
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="region_id" className="block mb-1 font-medium text-gray-700">Region</label>
            <select
              id="region_id"
              name="region_id"
              value={form.region_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a region</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="service_ids" className="block mb-1 font-medium text-gray-700">Services</label>
            <select
              id="service_ids"
              name="service_ids"
              multiple
              value={form.services.map(String)}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 h-32 focus:ring-blue-500 focus:border-blue-500"
            >
              {allServices.map(service => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple services.</p>
          </div>

          {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
          <div className="flex space-x-2 justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">{company.name}</h2>
          <p className="text-gray-700 mb-2"><strong>Email:</strong> {company.email || 'N/A'}</p>
          <p className="text-gray-700 mb-2"><strong>Phone:</strong> {company.phone || 'N/A'}</p>
          <p className="text-gray-700 mb-2"><strong>Status:</strong> {company.status || 'N/A'}</p>
          <p className="text-gray-700 mb-2"><strong>Region:</strong> {company.region ? company.region.name : 'N/A'}</p>
          <p className="text-gray-700 mb-4"><strong>Description:</strong> {company.description || 'No description available'}</p>
          
          <p className="text-gray-700 mt-4 font-semibold">Services:</p>
          {company.services && company.services.length > 0 ? (
            <ul className="list-disc list-inside ml-4">
              {company.services.map(service => (
                <li key={service.id} className="text-gray-700">{service.name} ({service.description || 'No description'})</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 ml-4">No services provided.</p>
            )}

          {/* Show Edit/Delete buttons only if user is admin */}
          {isAdmin && ( // <--- Conditional rendering for the buttons
            <div className="mt-6 space-x-2">
              <button
                onClick={() => setEditMode(true)}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
