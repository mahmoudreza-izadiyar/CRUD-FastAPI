/**
 * API Configuration
 * Central configuration for API endpoints
 */

// Base URL for API requests
export const API_BASE_URL = 'http://localhost:8000/api';

// Endpoints
export const ENDPOINTS = {
  BUSINESSES: `${API_BASE_URL}/businesses`,
  ITEMS: `${API_BASE_URL}/items`,
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/token`,
    REGISTER: `${API_BASE_URL}/users/register`,
    CURRENT_USER: `${API_BASE_URL}/users/me`
  }
};

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Helper to add authorization header when token is available
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}; 