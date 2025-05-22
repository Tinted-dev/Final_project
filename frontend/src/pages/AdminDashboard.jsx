import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const { accessToken, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingCompanies = async () => {
    setLoading(true);
    setError(null);
    if (!accessToken || !isAdmin) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/companies/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const filteredCompanies = res.data.filter(company => company.status === 'pending');
      setPendingCompanies(filteredCompanies);
    } catch (err) {
      console.error("Error fetching pending companies:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to fetch pending companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchPendingCompanies();
    }
  }, [isAdmin, authLoading]);

  const handleStatusUpdate = async (companyId, newStatus) => {
    setError(null);
    if (!accessToken || !isAdmin) {
      setError('Unauthorized: You must be an admin to perform this action.');
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/companies/${companyId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      alert(`Company status updated to ${newStatus}!`);
      fetchPendingCompanies();
    } catch (err) {
      console.error(`Error updating company status to ${newStatus}:`, err.response?.data || err.message);
      setError(err.response?.data?.error || `Failed to update company status to ${newStatus}.`);
    }
  };

  if (authLoading) return <p className="text-center mt-8 text-gray-600">Loading authentication...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;
  if (!isAdmin) return <p className="text-center mt-8 text-red-600">Access Denied: You must be an administrator to view this dashboard.</p>;
  if (loading) return <p className="text-center mt-8 text-gray-600">Loading pending companies...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Admin Dashboard</h1>

      {/* Pending Company Approvals Section */}
      <div className="mb-10 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-5 text-center text-gray-800">Pending Company Approvals</h2>
        {pendingCompanies.length === 0 ? (
          <p className="text-center text-gray-600 py-4">No companies currently pending approval.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingCompanies.map(company => (
              <div key={company.id} className="bg-gray-50 p-5 rounded-lg shadow-md border border-yellow-400 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{company.name}</h3>
                  <p className="text-gray-600 text-sm mb-1"><strong>Email:</strong> {company.email}</p>
                  <p className="text-gray-600 text-sm mb-1"><strong>Phone:</strong> {company.phone}</p>
                  <p className="text-gray-600 text-sm mb-3"><strong>Region:</strong> {company.region ? company.region.name : 'N/A'}</p>
                  <p className="text-gray-600 text-sm mb-4"><strong>Status:</strong> <span className="font-bold text-yellow-600">{company.status.toUpperCase()}</span></p>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => handleStatusUpdate(company.id, 'approved')}
                    className="btn-success flex-1"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(company.id, 'rejected')}
                    className="btn-danger flex-1"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Other Admin sections can go here (e.g., links to Manage Services, Manage Regions, Manage Users) */}
      <div className="mt-12 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Admin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
                onClick={() => navigate('/companies/new')} /* <--- NEW BUTTON */
                className="btn-primary"
            >
                Create New Company
            </button>
            <button
                onClick={() => navigate('/admin/services')}
                className="btn-secondary"
            >
                Manage Services
            </button>
            <button
                onClick={() => navigate('/admin/regions')}
                className="btn-secondary"
            >
                Manage Regions
            </button>
            <button
                onClick={() => navigate('/admin/users')}
                className="btn-secondary"
            >
                Manage Users
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
