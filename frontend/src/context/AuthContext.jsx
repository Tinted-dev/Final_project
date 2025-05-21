import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Ensure this is installed: npm install jwt-decode

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // State to hold the user object (including role) and the access token
  const [user, setUser] = useState(null); // Will store { id, username, email, role }
  const [accessToken, setAccessToken] = useState(null); // Stores the raw JWT token
  const [loading, setLoading] = useState(true); // Manages initial loading state

  // Effect to run once on mount to check for existing token in localStorage
  useEffect(() => {
    console.log("AuthContext: useEffect running to check for token in localStorage.");
    const storedAccessToken = localStorage.getItem('access_token'); // Use consistent key
    
    if (storedAccessToken) {
      setAccessToken(storedAccessToken); // Set the access token state

      // Attempt to fetch user details using the token
      axios.get('http://localhost:5000/api/auth/me', { // Your backend endpoint to get user info from token
        headers: { Authorization: `Bearer ${storedAccessToken}` }
      })
      .then(res => {
        // CRITICAL: Ensure res.data contains the 'role' property from backend
        setUser(res.data); // Set the user object (e.g., { id, username, email, role })
        console.log("AuthContext: User fetched from /me successfully:", res.data);
      })
      .catch((error) => {
        console.error("AuthContext: Failed to fetch user from token, clearing invalid token:", error);
        localStorage.removeItem('access_token'); // Clear invalid or expired token
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false)); // Finish loading regardless of success/failure
    } else {
      console.log("AuthContext: No token found in localStorage. User not authenticated.");
      setLoading(false); // No token, so not loading auth details
    }
  }, []); // Empty dependency array means this runs only once on mount

  // Login function
  const login = async (username, password) => {
    console.log("AuthContext: Attempting login for username:", username);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      // CRITICAL: Ensure response.data contains 'access_token' and 'user' (with 'role')
      const { access_token, user: loggedInUser } = response.data; 

      localStorage.setItem('access_token', access_token); // Store token in localStorage
      setAccessToken(access_token); // Update state with the new token
      setUser(loggedInUser); // Set the user object (e.g., { id, username, email, role })
      console.log("AuthContext: Login successful. Token and user set:", loggedInUser);
      
      // Return the user object (including role) for Login.jsx to use for redirection
      return { success: true, user: loggedInUser };
    } catch (error) {
      console.error("AuthContext: Login API call failed:", error.response?.data || error.message);
      // Re-throw the error so Login.jsx can catch and display specific messages
      throw error; 
    }
  };

  // Register function (assuming it also returns access_token and user)
  const register = async (username, email, password) => {
    console.log("AuthContext: Attempting registration for username:", username);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
      const { access_token, user: registeredUser } = res.data; // Assuming register also returns access_token and user

      localStorage.setItem('access_token', access_token);
      setAccessToken(access_token);
      setUser(registeredUser); // registeredUser should contain the role
      console.log("AuthContext: Registration successful. Token and user set:", registeredUser);
      
      return { success: true, user: registeredUser };
    } catch (error) {
      console.error("AuthContext: Registration API call failed:", error.response?.data || error.message);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    console.log("AuthContext: Logging out, clearing tokens.");
    localStorage.removeItem('access_token'); // Remove from localStorage
    setAccessToken(null); // Clear access token state
    setUser(null); // Clear user state
    navigate('/login'); // Redirect to login page
  };

  // The context value provided to any consuming components
  const contextValue = {
    user, // This object contains { id, username, email, role }
    accessToken, // The raw JWT token
    loading, // True while initial auth check is happening
    login,
    register,
    logout,
    // Helper flags for role-based UI rendering
    isAdmin: user?.role === 'admin',
    isCollector: user?.role === 'collector',
    isUser: user?.role === 'user', // Assuming 'user' is a general role for non-admin/non-collector
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Show loading indicator while authentication status is being determined */}
      {loading ? <div className="text-center mt-20 text-gray-600">Loading authentication...</div> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
