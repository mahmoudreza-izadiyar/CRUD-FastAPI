import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../services/apiConfig';
import { getToken, setToken, removeToken, parseToken, getAuthHeader } from '../utils/authUtils';

// Create context
const AuthContext = createContext();

// Default headers for API requests
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token exists and fetch user data when component mounts
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      console.log('Initial token check:', token ? 'Token exists' : 'No token found');
      
      if (token) {
        try {
          const userInfo = await fetchCurrentUser();
          console.log('User info fetched successfully:', userInfo);
          setCurrentUser(userInfo);
        } catch (err) {
          // Token might be invalid or expired
          console.error('Error loading user data:', err);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Fetch current user data from API
  const fetchCurrentUser = async () => {
    try {
      console.log('Fetching current user from:', ENDPOINTS.AUTH.CURRENT_USER);
      const authHeader = getAuthHeader();
      console.log('Auth header:', authHeader);
      
      const response = await axios.get(ENDPOINTS.AUTH.CURRENT_USER, {
        headers: {
          ...DEFAULT_HEADERS,
          ...authHeader
        }
      });
      
      console.log('Current user API response:', response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching current user:', err.response ? err.response.data : err.message);
      throw err;
    }
  };

  // Login user with username and password
  const login = async (username, password) => {
    setError(null);
    
    try {
      console.log('Attempting login for user:', username);
      console.log('Login endpoint:', ENDPOINTS.AUTH.LOGIN);
      
      const response = await axios.post(ENDPOINTS.AUTH.LOGIN, {
        username,
        password
      });
      
      console.log('Login response received:', response.status);
      
      const { access_token } = response.data;
      console.log('Token received:', access_token ? 'Yes' : 'No');
      
      if (!access_token) {
        console.error('No access token in response data');
        throw new Error('No access token received');
      }
      
      // Store token
      setToken(access_token);
      console.log('Token stored in localStorage');
      
      // Fetch and set user data
      const userInfo = await fetchCurrentUser();
      setCurrentUser(userInfo);
      
      return userInfo;
    } catch (err) {
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.response) {
        // Handle specific error responses
        console.error('Login error response:', err.response.status, err.response.data);
        if (err.response.status === 401) {
          errorMessage = 'Invalid username or password.';
        } else if (err.response.data && err.response.data.detail) {
          errorMessage = err.response.data.detail;
        }
      } else {
        console.error('Login error:', err.message);
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Register new user
  const register = async (userData) => {
    setError(null);
    
    try {
      console.log('Registering new user:', userData.username);
      console.log('Register endpoint:', ENDPOINTS.AUTH.REGISTER);
      
      await axios.post(ENDPOINTS.AUTH.REGISTER, userData);
      console.log('Registration successful, attempting login');
      
      // Auto login after registration
      return await login(userData.username, userData.password);
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response && err.response.data) {
        console.error('Registration error response:', err.response.status, err.response.data);
        // Handle specific error responses
        if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        }
      } else {
        console.error('Registration error:', err.message);
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Logout user
  const logout = () => {
    console.log('Logging out user');
    removeToken();
    setCurrentUser(null);
    console.log('User logged out, token removed');
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 