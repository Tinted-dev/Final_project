import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const EditCompany = () => {
  const { id } = useParams();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [form, setForm] = useState({
    name: '',
    description: '',
    region_id: '',
    services: [],
  });
  const [regions, setRegions] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regionRes, serviceRes] = await Promise.all([
          fetch('${API_BASE_URL}/regions'),
          fetch('${API_BASE_URL}/services'),
        ]);

        if (!regionRes.ok || !serviceRes.ok) {
          throw new Error('Failed to fetch regions or services');
        }

        const regions = await regionRes.json();
        const services = await serviceRes.json();

        setRegions(regions);
        setServices(services);

        const companyRes = await fetch(`${API_BASE_URL}/companies/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!companyRes.ok) {
          throw new Error('Failed to fetch company details');
        }

        const data = await companyRes.json();

        setForm({
          name: data.name || '',
          description: data.description || '',
          region_id: data.region_id || '',
          services: data.services ? data.services.map(s => s.id) : [],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (id && token) fetchData();
  }, [id, token]);

  return (
    <div className="container mt-5">
      <h2>Edit Company</h2>
      {/* Your form JSX goes here */}
    </div>
  );
};

export default EditCompany;
