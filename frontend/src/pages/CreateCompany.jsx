import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const CreateCompany = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    status: 'pending', // Default status
    region_id: '',
    services: [],
  });

  const [regions, setRegions] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const regionRes = await axios.get(`${API_BASE_URL}/regions/`);
        setRegions(regionRes.data);
        const serviceRes = await axios.get(`${API_BASE_URL}/services/`);
        setAllServices(serviceRes.data);
      } catch (err) {
        console.error("Error fetching initial data for CreateCompany:", err);
        setError(err.message);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'region_id') {
      setForm((prevForm) => ({ ...prevForm, [name]: value ? Number(value) : '' }));
    } else {
      setForm((prevForm) => ({ ...prevForm, [name]: value }));
    }
  };

  const handleServiceChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(
      (opt) => Number(opt.value)
    );
    setForm((prevForm) => ({ ...prevForm, services: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!accessToken) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      description: form.description,
      status: form.status,
      region_id: form.region_id ? Number(form.region_id) : null,
      services: form.services.map(s => Number(s)),
    };

    try {
      await axios.post(`${API_BASE_URL}/companies/`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      alert('Company created successfully!');
      navigate('/companies');
    } catch (err) {
      console.error("CreateCompany: Failed to create company (backend error):", err.response?.data || err.message);
      setError(err.response?.data?.error || err.response?.data?.message || `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Create New Company</h1>
      {error && <p className="text-red-600 text-sm text-center mb-6">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
          <input
            type="text"
            name="name"
            placeholder="e.g., Green Waste Solutions"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
          <input
            type="email"
            name="email"
            placeholder="e.g., info@greenwaste.com"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Company Phone</label>
          <input
            type="text"
            name="phone"
            placeholder="e.g., +1234567890"
            value={form.phone}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            placeholder="Brief description of the company and its mission."
            value={form.description}
            onChange={handleChange}
            rows="4"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label htmlFor="region_id" className="block text-sm font-medium text-gray-700 mb-2">Region</label>
          <select
            name="region_id"
            value={form.region_id}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select Region</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="services" className="block text-sm font-medium text-gray-700 mb-2">Services Offered</label>
          <select
            name="services"
            multiple
            value={form.services.map(String)}
            onChange={handleServiceChange}
            disabled={loading}
            className="h-40"
          >
            {allServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple services.</p>
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Company'}
        </button>
      </form>
    </div>
  );
};

export default CreateCompany;
