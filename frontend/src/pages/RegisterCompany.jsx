import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function RegisterCompany() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    user_email: '',
    name: '',
    email: '',
    phone: '',
    description: '',
    region_id: '',
    services: [],
  });

  const [regions, setRegions] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'collector') {
        navigate('/collector-dashboard');
      } else if (user.role === 'company_owner') {
        navigate('/my-company-dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const regionRes = await axios.get('http://localhost:5000/api/regions/');
        setRegions(regionRes.data);
        const serviceRes = await axios.get('http://localhost:5000/api/services/');
        setAllServices(serviceRes.data);
      } catch (err) {
        console.error("Error fetching regions/services:", err);
        setError('Failed to load regions or services for registration.');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'region_id') {
      setFormData({ ...formData, [name]: value ? Number(value) : '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleServiceChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(
      (opt) => Number(opt.value)
    );
    setFormData((prevData) => ({ ...prevData, services: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { username, password, user_email, name, email, phone, description, region_id, services } = formData;

    if (!username.trim() || !password || !user_email.trim() || !name.trim() || !email.trim() || !phone.trim() || !region_id) {
      setError('Please fill in all required fields (username, password, user email, company name, company email, phone, and select a region).');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register-company', {
        username,
        password,
        user_email,
        name,
        email,
        phone,
        description,
        region_id: Number(region_id),
        services: services.map(Number),
      });

      const { access_token } = response.data;

      localStorage.setItem('access_token', access_token);
      
      alert('Company registered successfully! You are now logged in.');
      navigate('/my-company-dashboard');
    } catch (err) {
      console.error("Company registration failed:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'An unexpected error occurred during company registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl mb-8 font-bold text-center text-gray-800">Register Your Company</h1>
      {error && <p className="text-red-600 text-sm text-center mb-6">{error}</p>}
      
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* User Credentials */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Login Credentials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="username"
              placeholder="Choose a Username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <div className="md:col-span-2">
              <input
                type="email"
                name="user_email"
                placeholder="Your Email (for login)"
                value={formData.user_email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Company Name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <input
              type="email"
              name="email"
              placeholder="Company Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <input
              type="text"
              name="phone"
              placeholder="Company Phone"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <select
              name="region_id"
              value={formData.region_id}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select Company Region</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <div className="md:col-span-2">
              <textarea
                name="description"
                placeholder="Company Description (Optional)"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                disabled={loading}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="services" className="block text-sm font-medium text-gray-700 mb-2">Select Services (Hold Ctrl/Cmd to select multiple)</label>
              <select
                name="services"
                multiple
                value={formData.services.map(String)}
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
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-success"
        >
          {loading ? 'Registering...' : 'Register Company'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
      </p>
    </div>
  );
}
