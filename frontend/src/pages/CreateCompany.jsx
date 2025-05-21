import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../context/AuthContext'; // Using useAuth hook for cleaner access
import { useNavigate } from 'react-router-dom';

const CreateCompany = () => {
  // Access accessToken from the AuthContext using the useAuth hook
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  // State to manage form input values for all company fields
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    status: 'pending', // Default status as per backend model
    region_id: '', // Will store the ID of the selected region (number)
    services: [], // Will store an array of IDs of selected services (numbers)
  });

  // States for dropdown data
  const [regions, setRegions] = useState([]);
  const [allServices, setAllServices] = useState([]); // Renamed to avoid conflict with 'services' in form state
  const [error, setError] = useState(null); // State to manage and display error messages
  const [loading, setLoading] = useState(false); // State for loading indicator

  // Effect to fetch regions and services when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch regions
        const regionRes = await fetch('http://localhost:5000/api/regions/'); // Ensure trailing slash
        if (!regionRes.ok) {
          throw new Error(`Failed to fetch regions: ${regionRes.statusText}`);
        }
        const regionData = await regionRes.json();
        setRegions(regionData);

        // Fetch services
        const serviceRes = await fetch('http://localhost:5000/api/services/'); // Ensure trailing slash
        if (!serviceRes.ok) {
          throw new Error(`Failed to fetch services: ${serviceRes.statusText}`);
        }
        const serviceData = await serviceRes.json();
        setAllServices(serviceData); // Set to allServices state
      } catch (err) {
        console.error("Error fetching initial data for CreateCompany:", err);
        setError(err.message);
      }
    };
    fetchData();
  }, []); // Empty dependency array means this runs only once on mount

  // Handles changes for most input fields (text, email, phone, description, status, region_id)
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Special handling for region_id to ensure it's a number
    if (name === 'region_id') {
      setForm((prevForm) => ({ ...prevForm, [name]: value ? Number(value) : '' }));
    } else {
      setForm((prevForm) => ({ ...prevForm, [name]: value }));
    }
  };

  // Handles changes specifically for the multi-select services dropdown
  const handleServiceChange = (e) => {
    // Get all selected options and map their values to numbers
    const selected = Array.from(e.target.selectedOptions).map(
      (opt) => Number(opt.value) // CRITICAL: Convert to Number for backend
    );
    setForm((prevForm) => ({ ...prevForm, services: selected }));
  };

  // Handles the form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission
    setError(null);     // Clear any previous errors
    setLoading(true);   // Set loading to true

    // CRITICAL: Check if the access token is available
    if (!accessToken) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      return;
    }

    // Prepare the payload to send to the backend
    // Ensure data types match backend expectations (numbers for IDs, strings for text)
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      description: form.description,
      status: form.status,
      region_id: form.region_id ? Number(form.region_id) : null, // Convert to Number or null
      services: form.services.map(s => Number(s)), // Ensure services are array of numbers
    };

    console.log("CreateCompany: Sending payload:", payload); // For debugging: check the payload before sending

    try {
      // CRITICAL: Ensure the fetch URL has the trailing slash to match backend route
      const res = await fetch('http://localhost:5000/api/companies/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`, // Use the access token from AuthContext
        },
        body: JSON.stringify(payload), // Send the prepared payload
      });

      if (!res.ok) {
        // If response is not OK, parse the error message from the backend
        const errorData = await res.json();
        console.error("CreateCompany: Failed to create company (backend error):", errorData);
        throw new Error(errorData.error || errorData.message || `Error: ${res.statusText}`);
      }

      const data = await res.json(); // Parse the successful response data
      console.log("CreateCompany: Company created successfully:", data);
      navigate('/companies'); // Redirect to the companies list page on success
    } catch (err) {
      console.error("CreateCompany: Network error or unhandled fetch error:", err);
      setError(err.message); // Display the error message to the user
    } finally {
      setLoading(false); // Always set loading to false when the submission process completes
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Company</h1>
      {/* Display error message if any */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name Input */}
        <input
          type="text"
          name="name"
          placeholder="Company Name"
          className="w-full p-2 border border-gray-300 rounded"
          value={form.name}
          onChange={handleChange}
          required
          disabled={loading} // Disable input when loading
        />
        {/* Email Input */}
        <input
          type="email"
          name="email"
          placeholder="Company Email"
          className="w-full p-2 border border-gray-300 rounded"
          value={form.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
        {/* Phone Input */}
        <input
          type="text"
          name="phone"
          placeholder="Company Phone"
          className="w-full p-2 border border-gray-300 rounded"
          value={form.phone}
          onChange={handleChange}
          required
          disabled={loading}
        />
        {/* Description Textarea */}
        <textarea
          name="description"
          placeholder="Description"
          className="w-full p-2 border border-gray-300 rounded"
          value={form.description}
          onChange={handleChange}
          rows="4"
          disabled={loading}
        />
        {/* Status Select */}
        <select
          name="status"
          className="w-full p-2 border border-gray-300 rounded"
          value={form.status}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
        </select>
        {/* Region Select */}
        <select
          name="region_id"
          className="w-full p-2 border border-gray-300 rounded"
          value={form.region_id}
          onChange={handleChange}
          required // Region is likely required by your backend
          disabled={loading}
        >
          <option value="">Select Region</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        {/* Services Multi-select */}
        <select
          name="services"
          multiple // Enable multi-selection
          className="w-full p-2 border border-gray-300 rounded h-32"
          value={form.services.map(String)} // Value must be array of strings for multi-select
          onChange={handleServiceChange}
          disabled={loading}
        >
          {allServices.map((s) => (
            <option key={s.id} value={s.id}> {/* Option value should be number, handleServiceChange converts to string */}
              {s.name}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple services.</p>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading} // Disable button when loading
        >
          {loading ? 'Creating...' : 'Create Company'}
        </button>
      </form>
    </div>
  );
};

export default CreateCompany;