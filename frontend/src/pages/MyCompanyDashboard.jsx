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
    region_id: '',
    services: [],
  });

  const [regions, setRegions] = useState([]);
  const [allServices, setAllServices] = useState([]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'company_owner')) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchMyCompany = async () => {
      setLoading(true);
      setError(null);
      if (!accessToken || !user || user.role !== 'company_owner') {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/companies/my-company', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setCompany(res.data);
        setForm({
          name: res.data.name,
          description: res.data.description || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
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
  }, [user, accessToken]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const regionRes = await axios.get('http://localhost:5000/api/regions/');
        setRegions(regionRes.data);
        const serviceRes = await axios.get('http://localhost:5000/api/services/');
        setAllServices(serviceRes.data);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
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
    if (!accessToken || !user || user.role !== 'company_owner' || !company || company.status !== 'approved') {
      setError('Unauthorized or company not approved for editing.');
      return;
    }

    const headers = { Authorization: `Bearer ${accessToken}` };
    const dataToSend = {
      ...form,
      region_id: form.region_id ? Number(form.region_id) : null,
      services: form.services.map(Number),
    };

    try {
      await axios.put(`http://localhost:5000/api/companies/${company.id}`, dataToSend, { headers });
      
      const res = await axios.get('http://localhost:5000/api/companies/my-company', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setCompany(res.data);
      setEditMode(false);
      alert('Company profile updated successfully!');
    } catch (err) {
      console.error('Update failed:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.msg || err.response?.data?.error || 'An unexpected error occurred during update.');
    }
  };

  if (authLoading || loading) return <p className="text-center mt-8 text-gray-600">Loading company dashboard...</p>;
  if (error) return <p className="text-center mt-8 text-red-600 font-semibold">{error}</p>;
  if (!company) return <p className="text-center mt-8 text-gray-600">No company profile found for this user.</p>;

  const isApproved = company.status === 'approved';

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">My Company Dashboard</h1>
      
      {!isApproved && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-lg shadow-md" role="alert">
          <p className="font-bold">Company Status: {company.status.toUpperCase()}</p>
          <p>Your company profile is currently {company.status}. Please await administrator approval to enable full features.</p>
        </div>
      )}

      {editMode ? (
        <form onSubmit={handleUpdate} className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg space-y-6">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Edit My Company Profile</h3>
          <div>
            <label htmlFor="name" className="block mb-2 font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={!isApproved}
            />
          </div>
          <div>
            <label htmlFor="description" className="block mb-2 font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              disabled={!isApproved}
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-2 font-medium text-gray-700">Company Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={!isApproved}
            />
          </div>
          <div>
            <label htmlFor="phone" className="block mb-2 font-medium text-gray-700">Phone</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              disabled={!isApproved}
            />
          </div>
          <div>
            <label htmlFor="status" className="block mb-2 font-medium text-gray-700">Status</label>
            <input
              type="text"
              id="status"
              name="status"
              value={company.status}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="region_id" className="block mb-2 font-medium text-gray-700">Region</label>
            <select
              id="region_id"
              name="region_id"
              value={form.region_id}
              onChange={handleChange}
              disabled={!isApproved}
            >
              <option value="">Select a region</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="services" className="block mb-2 font-medium text-gray-700">Services</label>
            <select
              id="services"
              name="services"
              multiple
              value={form.services.map(String)}
              onChange={handleChange}
              className="h-40"
              disabled={!isApproved}
            >
              {allServices.map(service => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple services.</p>
          </div>

          {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="submit"
              className="btn-primary"
              disabled={!isApproved}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">{company.name}</h2>
          <div className="space-y-3 text-gray-700">
            <p><strong>Email:</strong> {company.email || 'N/A'}</p>
            <p><strong>Phone:</strong> {company.phone || 'N/A'}</p>
            <p><strong>Status:</strong>{' '}
              <span className={`font-bold ${company.status === 'approved' ? 'text-green-600' : company.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                {company.status.toUpperCase()}
              </span>
            </p>
            <p><strong>Region:</strong> {company.region ? company.region.name : 'N/A'}</p>
            <p><strong>Description:</strong> {company.description || 'No description available'}</p>
            
            <h3 className="text-lg font-semibold mt-5 mb-2">Services Offered:</h3>
            {company.services && company.services.length > 0 ? (
              <ul className="list-disc list-inside ml-4 space-y-1">
                {company.services.map(service => (
                  <li key={service.id} className="text-gray-700">
                    {service.name} ({service.description || 'No description'})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ml-4 text-gray-600">No services provided.</p>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setEditMode(true)}
              className="btn-warning"
              disabled={!isApproved}
            >
              Edit My Company Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCompanyDashboard;
