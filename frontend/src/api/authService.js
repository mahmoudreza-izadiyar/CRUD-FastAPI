import axios from 'axios';

const API_URL = '/api/auth';

// Store the token in localStorage
const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Get the token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Remove the token from localStorage
const removeToken = () => {
  localStorage.removeItem('token');
};

// Configure axios to use the token for all requests
const setAuthHeader = () => {
  const token = getToken();
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Register a new user
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login a user
export const login = async (username, password) => {
  try {
    // Use FormData for login to comply with OAuth2 standards
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axios.post(`${API_URL}/login`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { access_token } = response.data;
    
    // Store token and set header
    setToken(access_token);
    setAuthHeader();
    
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Logout a user
export const logout = async () => {
  try {
    setAuthHeader(); // Make sure the token is in the headers
    await axios.post(`${API_URL}/logout`);
    removeToken();
    delete axios.defaults.headers.common['Authorization'];
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    // Still remove token on client side even if server fails
    removeToken();
    delete axios.defaults.headers.common['Authorization'];
    throw error;
  }
};

// Get the current user's profile
export const getCurrentUser = async () => {
  try {
    setAuthHeader(); // Make sure the token is in the headers
    const response = await axios.get(`${API_URL}/me`);
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    if (error.response && error.response.status === 401) {
      // If unauthorized, remove the token
      removeToken();
      delete axios.defaults.headers.common['Authorization'];
    }
    throw error;
  }
};

// Check if a user is logged in
export const isLoggedIn = () => {
  return !!getToken();
};

// Initialize auth header if token exists
export const initializeAuth = () => {
  setAuthHeader();
};

// Export a default object with all functions
export default {
  register,
  login,
  logout,
  getCurrentUser,
  isLoggedIn,
  initializeAuth,
}; 