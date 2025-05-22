import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken, isAdmin } = useAuth();

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
    axios.get(`${API_BASE_URL}/companies/${id}`)
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
    axios.get('${API_BASE_URL}/regions/')
      .then(res => setRegions(res.data))
      .catch(err => console.error("Error fetching regions:", err));
  }, []);

  useEffect(() => {
    axios.get('${API_BASE_URL}/services/')
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

      await axios.put(`${API_BASE_URL}/${company.id}`, dataToSend, { headers });
      
      axios.get(`${API_BASE_URL}/companies/${id}`)
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

      await axios.delete(`${API_BASE_URL}/companies/${company.id}`, { headers });
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
        <form onSubmit={handleUpdate} className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg space-y-6">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Edit Company</h3>
          <div>
            <label htmlFor="name" className="block mb-2 font-medium text-gray-700">Name</label>
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
            <label htmlFor="description" className="block mb-2 font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-2 font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
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
            />
          </div>
          <div>
            <label htmlFor="status" className="block mb-2 font-medium text-gray-700">Status</label>
            <input
              type="text"
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="region_id" className="block mb-2 font-medium text-gray-700">Region</label>
            <select
              id="region_id"
              name="region_id"
              value={form.region_id}
              onChange={handleChange}
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
            >
              {allServices.map(service => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple services.</p>
          </div>

          {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="submit"
              className="btn-primary"
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

          {isAdmin && (
            <div className="mt-8 flex space-x-3 justify-end">
              <button
                onClick={() => setEditMode(true)}
                className="btn-warning"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger"
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
