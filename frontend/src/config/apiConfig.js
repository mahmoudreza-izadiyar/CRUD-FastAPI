/**
 * Base API URL for backend services
 */
export const API_URL = 'http://localhost:8000/api';

/**
 * Default headers to include with all API requests
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

/**
 * API endpoints organized by resource
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/auth/token`,
    REGISTER: `${API_URL}/users`,
    CURRENT_USER: `${API_URL}/users/me`
  },
  BUSINESSES: `${API_URL}/businesses`,
  ITEMS: `${API_URL}/items`,
  RATINGS: `${API_URL}/ratings`
}; 