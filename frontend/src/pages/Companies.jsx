import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;
export default function Companies() {
  const [allCompanies, setAllCompanies] = useState([]); // Stores all fetched companies
  const [filteredCompanies, setFilteredCompanies] = useState([]); // Stores companies after filtering
  const [regions, setRegions] = useState([]); // Stores available regions for the filter
  const [selectedRegion, setSelectedRegion] = useState(''); // State for the selected region filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch all companies
        const companiesRes = await axios.get('${API_BASE_URL}/companies/');
        setAllCompanies(companiesRes.data);
        setFilteredCompanies(companiesRes.data); // Initially, display all companies

        // Fetch regions for the filter dropdown
        const regionsRes = await axios.get('${API_BASE_URL}/regions/');
        setRegions(regionsRes.data);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError('Failed to load companies or regions.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Effect to apply filter whenever selectedRegion or allCompanies changes
  useEffect(() => {
    if (selectedRegion === '' || selectedRegion === 'all') {
      setFilteredCompanies(allCompanies); // Show all companies if no region selected
    } else {
      const companiesInRegion = allCompanies.filter(company =>
        company.region && company.region.id === Number(selectedRegion)
      );
      setFilteredCompanies(companiesInRegion);
    }
  }, [selectedRegion, allCompanies]);

  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
  };

  if (loading) return <p className="text-center mt-8 text-gray-600">Loading companies and regions...</p>;
  if (error) return <p className="text-center mt-8 text-red-600 font-semibold">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Our Partner Companies</h1>
      
      {/* Region Filter Dropdown */}
      <div className="mb-8 max-w-xs mx-auto">
        <label htmlFor="region-filter" className="block text-sm font-medium text-gray-700 mb-2">Filter by Region:</label>
        <select
          id="region-filter"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          value={selectedRegion}
          onChange={handleRegionChange}
        >
          <option value="all">All Regions</option>
          {regions.map(region => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {filteredCompanies.length === 0 ? (
        <p className="text-center mt-8 text-gray-600">No companies found for the selected region.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{company.name}</h2>
              <p className="text-gray-600 text-sm mb-1">
                <strong className="font-medium">Email:</strong> {company.email || 'N/A'}
              </p>
              <p className="text-gray-600 text-sm mb-1">
                <strong className="font-medium">Phone:</strong> {company.phone || 'N/A'}
              </p>
              <p className="text-gray-600 text-sm mb-1">
                <strong className="font-medium">Region:</strong> {company.region ? company.region.name : 'N/A'}
              </p>
              <p className="text-gray-600 text-sm mb-3">
                <strong className="font-medium">Status:</strong>{' '}
                <span className={`font-bold ${company.status === 'approved' ? 'text-green-600' : company.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {company.status.toUpperCase()}
                </span>
              </p>
              <div className="mt-auto pt-4"> {/* Push button to bottom */}
                <Link
                  to={`/companies/${company.id}`}
                  className="btn-primary inline-block text-center w-full"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
