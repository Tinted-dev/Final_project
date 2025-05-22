import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_URL;
export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null); // Will store { id, username, email, role, company_id? }
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthContext: useEffect running to check for token in localStorage.");
    const storedAccessToken = localStorage.getItem('access_token');
    
    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
      
      axios.get(`${API_BASE_URL}/users/me`, { // <--- CHANGED: New endpoint for /me
        headers: { Authorization: `Bearer ${storedAccessToken}` }
      })
      .then(res => {
        setUser(res.data);
        console.log("AuthContext: User fetched from /me successfully:", res.data);
      })
      .catch((error) => {
        console.error("AuthContext: Failed to fetch user from token, clearing invalid token:", error);
        localStorage.removeItem('access_token');
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
    } else {
      console.log("AuthContext: No token found in localStorage. User not authenticated.");
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    console.log("AuthContext: Attempting login for username:", username);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/token`, { username, password });
      const { access_token, user: loggedInUser } = response.data; 

      localStorage.setItem('access_token', access_token);
      setAccessToken(access_token);
      setUser(loggedInUser);
      console.log("AuthContext: Login successful. Token and user set:", loggedInUser);
      
      return { success: true, user: loggedInUser };
    } catch (error) {
      console.error("AuthContext: Login API call failed:", error.response?.data || error.message);
      throw error; 
    }
  };

  const register = async (username, email, password) => {
    console.log("AuthContext: Attempting standard user registration for username:", username);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, { username, email, password });
      const { access_token, user: registeredUser } = res.data;

      localStorage.setItem('access_token', access_token);
      setAccessToken(access_token);
      setUser(registeredUser);
      console.log("AuthContext: Standard registration successful. Token and user set:", registeredUser);
      
      return { success: true, user: registeredUser };
    } catch (error) {
      console.error("AuthContext: Standard Registration API call failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    console.log("AuthContext: Logging out, clearing tokens.");
    localStorage.removeItem('access_token');
    setAccessToken(null);
    setUser(null);
    navigate('/login');
  };

  const contextValue = {
    user,
    accessToken,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
    isCollector: user?.role === 'collector',
    isUser: user?.role === 'user',
    isCompanyOwner: user?.role === 'company_owner',
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {loading ? <div className="text-center mt-20 text-gray-600">Loading authentication...</div> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
