import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Import axios for fetching regions/services

export default function RegisterCompany() {
  const { user, register } = useAuth(); // Use the general register function if it can handle company registration
  const navigate = useNavigate();

  // Combined form state for user credentials and company details
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    user_email: '', // Email for the user account
    name: '',       // Company name
    email: '',      // Company email
    phone: '',
    description: '',
    region_id: '',
    services: [],   // Array of selected service IDs
  });

  const [regions, setRegions] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in (though typically register is for unauthenticated users)
  useEffect(() => {
    if (user) {
      // Redirect based on role if already logged in
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'collector') {
        navigate('/collector-dashboard');
      } else if (user.role === 'company_owner') {
        navigate('/my-company-dashboard'); // Redirect company owners to their specific dashboard
      } else {
        navigate('/'); // Default for other users
      }
    }
  }, [user, navigate]);

  // Fetch regions and services on component mount
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

    // Basic validation
    if (!username.trim() || !password || !user_email.trim() || !name.trim() || !email.trim() || !phone.trim() || !region_id) {
      setError('Please fill in all required fields (username, password, user email, company name, company email, phone, and select a region).');
      setLoading(false);
      return;
    }

    try {
      // Call the new register-company endpoint directly
      const response = await axios.post('http://localhost:5000/api/auth/register-company', {
        username,
        password,
        user_email,
        name,
        email,
        phone,
        description,
        region_id: Number(region_id), // Ensure it's a number
        services: services.map(Number), // Ensure services are numbers
      });

      const { access_token, user: registeredUser } = response.data;

      // Manually set token and user in AuthContext (or call login if AuthContext's register doesn't handle this)
      // For now, assuming AuthContext's 'register' is for simple user registration,
      // so we'll handle the token/user state directly here, then trigger AuthContext update.
      localStorage.setItem('access_token', access_token);
      // Trigger AuthContext's useEffect to pick up the new token and user state
      // A more robust way would be to have AuthContext's login/register handle the response.
      // For simplicity, we'll just navigate, and AuthContext's useEffect will run.
      
      alert('Company registered successfully! You are now logged in.');
      navigate('/my-company-dashboard'); // Redirect to the company owner's dashboard
    } catch (err) {
      console.error("Company registration failed:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'An unexpected error occurred during company registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl mb-6 font-semibold text-center">Register Your Company</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* User Credentials */}
        <h2 className="text-xl font-semibold mt-6 mb-2">Login Credentials</h2>
        <input
          type="text"
          name="username"
          placeholder="Choose a Username"
          className="w-full p-2 border border-gray-300 rounded"
          value={formData.username}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-2 border border-gray-300 rounded"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="email"
          name="user_email"
          placeholder="Your Email (for login)"
          className="w-full p-2 border border-gray-300 rounded"
          value={formData.user_email}
          onChange={handleChange}
          required
          disabled={loading}
        />

        {/* Company Details */}
        <h2 className="text-xl font-semibold mt-6 mb-2">Company Information</h2>
        <input
          type="text"
          name="name"
          placeholder="Company Name"
          className="w-full p-2 border border-gray-300 rounded"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="email"
          name="email"
          placeholder="Company Email"
          className="w-full p-2 border border-gray-300 rounded"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="text"
          name="phone"
          placeholder="Company Phone"
          className="w-full p-2 border border-gray-300 rounded"
          value={formData.phone}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <textarea
          name="description"
          placeholder="Company Description (Optional)"
          className="w-full p-2 border border-gray-300 rounded"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          disabled={loading}
        />
        <select
          name="region_id"
          className="w-full p-2 border border-gray-300 rounded"
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
        <select
          name="services"
          multiple
          className="w-full p-2 border border-gray-300 rounded h-32"
          value={formData.services.map(String)}
          onChange={handleServiceChange}
          disabled={loading}
        >
          <option value="" disabled>Select Services (Hold Ctrl/Cmd)</option>
          {allServices.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple services.</p>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registering...' : 'Register Company'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
      </p>
    </div>
  );
}
