import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  // --- CRITICAL DEBUG LOG: This should be the absolute first log you see from this component ---
  console.log("AdminDashboard: Component function started at the very top.");
  // --- End CRITICAL DEBUG LOG ---

  const { accessToken, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingCompanies = async () => {
    setLoading(true);
    setError(null);
    console.log("AdminDashboard: fetchPendingCompanies called.");
    if (!accessToken || !isAdmin) {
      console.log(`AdminDashboard: fetchPendingCompanies - Skipping fetch. accessToken: ${!!accessToken}, isAdmin: ${isAdmin}.`);
      setLoading(false);
      return;
    }
    try {
      console.log("AdminDashboard: Attempting to fetch companies from /api/companies/...");
      const res = await axios.get('http://localhost:5000/api/companies/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      console.log("AdminDashboard: All companies fetched successfully:", res.data);
      
      const filteredCompanies = res.data.filter(company => {
        console.log(`AdminDashboard: Checking company ID ${company.id}, status: '${company.status}'`);
        return company.status === 'pending';
      });
      
      console.log("AdminDashboard: Filtered pending companies:", filteredCompanies);
      
      setPendingCompanies(filteredCompanies);
    } catch (err) {
      console.error("Error fetching pending companies:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to fetch pending companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(`AdminDashboard: useEffect triggered. authLoading: ${authLoading}, isAdmin: ${isAdmin}.`);
    if (!authLoading && isAdmin) {
      console.log("AdminDashboard: useEffect conditions met, calling fetchPendingCompanies.");
      fetchPendingCompanies();
    } else {
      console.log("AdminDashboard: useEffect conditions NOT met. Not calling fetchPendingCompanies.");
    }
  }, [isAdmin, authLoading]);

  const handleStatusUpdate = async (companyId, newStatus) => {
    setError(null);
    if (!accessToken || !isAdmin) {
      setError('Unauthorized: You must be an admin to perform this action.');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/companies/${companyId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      alert(`Company status updated to ${newStatus}!`);
      fetchPendingCompanies();
    } catch (err) {
      console.error(`Error updating company status to ${newStatus}:`, err.response?.data || err.message);
      setError(err.response?.data?.error || `Failed to update company status to ${newStatus}.`);
    }
  };

  console.log("AdminDashboard: Rendering with pendingCompanies state:", pendingCompanies);

  if (authLoading) {
    console.log("AdminDashboard: Displaying 'Loading authentication...'");
    return <p className="text-center mt-8 text-gray-600">Loading authentication...</p>;
  }
  if (error) {
    console.log("AdminDashboard: Displaying error:", error);
    return <p className="text-center mt-8 text-red-600">{error}</p>;
  }
  if (!isAdmin) {
    console.log("AdminDashboard: Displaying 'Access Denied' because isAdmin is false.");
    return <p className="text-center mt-8 text-red-600">Access Denied: You must be an administrator to view this dashboard.</p>;
  }
  if (loading) {
    console.log("AdminDashboard: Displaying 'Loading pending companies...'");
    return <p className="text-center mt-8 text-gray-600">Loading pending companies...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

      {/* Pending Company Approvals Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-center">Pending Company Approvals</h2>
        {pendingCompanies.length === 0 ? (
          <p className="text-center text-gray-600">No companies currently pending approval.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingCompanies.map(company => (
              <li key={company.id} className="bg-white p-4 rounded-lg shadow-md border border-yellow-300">
                <h3 className="text-xl font-semibold mb-2">{company.name}</h3>
                <p className="text-gray-700"><strong>Email:</strong> {company.email}</p>
                <p className="text-gray-700"><strong>Phone:</strong> {company.phone}</p>
                <p className="text-gray-700"><strong>Region:</strong> {company.region ? company.region.name : 'N/A'}</p>
                <p className="text-gray-700 mb-3"><strong>Status:</strong> <span className="font-bold text-yellow-600">{company.status.toUpperCase()}</span></p>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleStatusUpdate(company.id, 'approved')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(company.id, 'rejected')}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Deny
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Other Admin sections can go here (e.g., links to Manage Services, Manage Regions, Manage Users) */}
      <div className="mt-10 text-center">
        <h2 className="text-2xl font-semibold mb-4">Admin Tools</h2>
        <div className="flex flex-wrap justify-center gap-4">
            <button
                onClick={() => navigate('/admin/services')}
                className="bg-gray-700 hover:bg-gray-900 text-white px-6 py-3 rounded-lg shadow-md transition duration-300"
            >
                Manage Services
            </button>
            <button
                onClick={() => navigate('/admin/regions')}
                className="bg-gray-700 hover:bg-gray-900 text-white px-6 py-3 rounded-lg shadow-md transition duration-300"
            >
                Manage Regions
            </button>
            <button
                onClick={() => navigate('/admin/users')} /* Assuming you implement this next */
                className="bg-gray-700 hover:bg-gray-900 text-white px-6 py-3 rounded-lg shadow-md transition duration-300"
            >
                Manage Users
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
