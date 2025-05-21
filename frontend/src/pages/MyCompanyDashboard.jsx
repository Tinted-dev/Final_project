import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyCompanyDashboard = () => {
  const { user, accessToken, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    status: '', // Company owner might not edit status directly
    region_id: '',
    services: [],
  });

  const [regions, setRegions] = useState([]);
  const [allServices, setAllServices] = useState([]);

  // Redirect if not a company_owner or not authenticated
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'company_owner')) {
      navigate('/login'); // Redirect to login if not authenticated or not a company_owner
    }
  }, [user, authLoading, navigate]);

  // Fetch company details for the logged-in company_owner
  useEffect(() => {
    const fetchMyCompany = async () => {
      setLoading(true);
      setError(null);
      if (!accessToken || !user || user.role !== 'company_owner') {
        setLoading(false);
        return; // Handled by the redirect above
      }

      try {
        // Fetch the company associated with the logged-in user
        const res = await axios.get('http://localhost:5000/api/companies/my-company', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
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
      } catch (err) {
        console.error("Error fetching my company details:", err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load your company details.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'company_owner' && accessToken) {
      fetchMyCompany();
    }
  }, [user, accessToken]); // Re-fetch if user or token changes

  // Fetch regions and all services for the form dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const regionRes = await axios.get('http://localhost:5000/api/regions/');
        setRegions(regionRes.data);
        const serviceRes = await axios.get('http://localhost:5000/api/services/');
        setAllServices(serviceRes.data);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        // Don't set global error, just log for dropdowns
      }
    };
    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    if (!accessToken || !user || user.role !== 'company_owner' || !company) {
      setError('Unauthorized or company not loaded.');
      return;
    }

    const headers = { Authorization: `Bearer ${accessToken}` };
    const dataToSend = {
      ...form,
      region_id: form.region_id ? Number(form.region_id) : null,
      services: form.services.map(Number),
    };

    try {
      // Company owner can only update their own company
      await axios.put(`http://localhost:5000/api/companies/${company.id}`, dataToSend, { headers });
      
      // Re-fetch company details to update the displayed information
      const res = await axios.get('http://localhost:5000/api/companies/my-company', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setCompany(res.data);
      setEditMode(false); // Exit edit mode
      alert('Company profile updated successfully!');
    } catch (err) {
      console.error('Update failed:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.msg || err.response?.data?.error || 'An unexpected error occurred during update.');
    }
  };

  // No delete functionality for company owners (admin only)

  if (authLoading || loading) return <p className="text-center mt-8 text-gray-600">Loading company dashboard...</p>;
  if (error) return <p className="text-center mt-8 text-red-600 font-semibold">{error}</p>;
  if (!company) return <p className="text-center mt-8 text-gray-600">No company profile found for this user.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">My Company Dashboard</h1>
      
      {editMode ? (
        // Render the Edit Form when in editMode
        <form onSubmit={handleUpdate} className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Edit My Company Profile</h3>
          <div className="mb-4">
            <label htmlFor="name" className="block mb-1 font-medium text-gray-700">Company Name</label>
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
            <label htmlFor="email" className="block mb-1 font-medium text-gray-700">Company Email</label>
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
          {/* Status might not be editable by company owner, or shown as read-only */}
          <div className="mb-4">
            <label htmlFor="status" className="block mb-1 font-medium text-gray-700">Status</label>
            <input
              type="text"
              id="status"
              name="status"
              value={form.status}
              readOnly // Make status read-only for company owner
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
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
            <label htmlFor="services" className="block mb-1 font-medium text-gray-700">Services</label>
            <select
              id="services"
              name="services"
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
        // Render the Company Details View
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

          <div className="mt-6 space-x-2">
            <button
              onClick={() => setEditMode(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
            >
              Edit My Company Profile
            </button>
            {/* Company owners typically don't delete their own company from here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCompanyDashboard;
