import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Import useAuth

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAdmin, isCollector } = useAuth(); // Destructure user, isAdmin, isCollector

  // Logging for debugging (keep for now, remove later)
  useEffect(() => {
    console.log("Companies.jsx: User object:", user);
    console.log("Companies.jsx: isAdmin:", isAdmin);
    console.log("Companies.jsx: isCollector:", isCollector);
  }, [user, isAdmin, isCollector]);

  const fetchCompanies = async () => {
    setLoading(true);
    setError('');
    try {
      const url = selectedRegion
        ? `http://localhost:5000/api/companies?region_id=${selectedRegion}`
        : 'http://localhost:5000/api/companies';
      
      const res = await axios.get(url);
      setCompanies(res.data);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError('Failed to fetch companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [selectedRegion]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/regions/'); // Trailing slash
        setRegions(res.data);
      } catch (err) {
        console.error("Error fetching regions:", err);
      }
    };
    fetchRegions();
  }, []);

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };

  if (loading) return <p>Loading companies...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Companies</h2>
      {/* Show "Add New Company" only if user is admin */}
      {isAdmin && ( // <--- CHANGED: Only isAdmin can see this button
        <Link
          to="/companies/new"
          className="inline-block mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Add New Company
        </Link>
      )}

      {/* Region Filter Dropdown */}
      <div className="mb-4">
        <label htmlFor="region-filter" className="block text-gray-700 text-sm font-bold mb-2">
          Filter by Region:
        </label>
        <select
          id="region-filter"
          value={selectedRegion}
          onChange={handleRegionChange}
          className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">All Regions</option>
          {regions.map(region => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-3">
        {companies.map(company => (
          <li key={company.id} className="border rounded p-4 shadow-sm hover:shadow-md transition">
            <Link to={`/companies/${company.id}`} className="text-lg font-semibold text-blue-600 hover:underline">
              {company.name}
            </Link>
            <p className="text-gray-700"><strong>Email:</strong> {company.email || 'N/A'}</p>
            <p className="text-gray-700"><strong>Phone:</strong> {company.phone || 'N/A'}</p>
            <p className="text-gray-700"><strong>Status:</strong> {company.status || 'N/A'}</p>
            <p className="text-gray-700"><strong>Region:</strong> {company.region ? company.region.name : 'N/A'}</p>
            <p className="text-gray-700">{company.description || 'No description available'}</p>
            
            <p className="text-gray-700 mt-2"><strong>Services:</strong></p>
            {company.services && company.services.length > 0 ? (
              <ul className="list-disc list-inside ml-4">
                {company.services.map(service => (
                  <li key={service.id}>{service.name} ({service.description || 'No description'})</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 ml-4">No services provided.</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
