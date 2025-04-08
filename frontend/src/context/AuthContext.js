import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ENDPOINTS, DEFAULT_HEADERS } from '../services/apiConfig';
import toast from 'react-hot-toast';

// Create the context
const AuthContext = createContext(null);

// Provider component that wraps your app and makes auth available to any child component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await axios.get(`${ENDPOINTS.USERS}/me`, {
            headers: {
              ...DEFAULT_HEADERS,
              Authorization: `Bearer ${storedToken}`
            }
          });
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login functionality
  const login = async (username, password) => {
    try {
      const response = await axios.post(`${ENDPOINTS.AUTH}/token`, 
        // Form data for token endpoint
        new URLSearchParams({
          username,
          password
        }), 
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      const { access_token, token_type } = response.data;
      const tokenValue = `${token_type} ${access_token}`;
      
      localStorage.setItem('token', tokenValue);
      setToken(tokenValue);
      
      // Fetch user details
      const userResponse = await axios.get(`${ENDPOINTS.USERS}/me`, {
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: tokenValue
        }
      });
      
      setUser(userResponse.data);
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.detail || 'Login failed. Please try again.');
      return false;
    }
  };

  // Register functionality
  const register = async (email, username, password) => {
    try {
      await axios.post(`${ENDPOINTS.USERS}`, {
        email,
        username,
        password
      }, {
        headers: DEFAULT_HEADERS
      });
      
      toast.success('Registration successful! You can now log in.');
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.response?.data?.detail || 'Registration failed. Please try again.');
      return false;
    }
  };

  // Logout functionality
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('You have been logged out.');
  };

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Context value to be provided
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook that shorthands the useContext(AuthContext)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 