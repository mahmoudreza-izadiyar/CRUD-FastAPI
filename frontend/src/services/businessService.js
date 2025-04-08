import axios from 'axios';
import { API_URL, DEFAULT_HEADERS } from '../config/apiConfig';
import { getAuthHeader } from '../utils/authUtils';

/**
 * Fetches all businesses with optional filtering
 * @param {Object} options - Query parameters for filtering
 * @param {number} options.skip - Number of records to skip
 * @param {number} options.limit - Maximum number of records to return
 * @param {string} options.name - Search by business name
 * @returns {Promise<Array>} - Promise resolving to array of businesses
 */
const getAllBusinesses = async (options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (options.skip) queryParams.append('skip', options.skip);
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.name) queryParams.append('name', options.name);
    
    const queryString = queryParams.toString();
    const url = `${API_URL}/businesses${queryString ? `?${queryString}` : ''}`;
    
    console.log('Fetching businesses from:', url);
    
    const headers = {
      ...DEFAULT_HEADERS,
      ...getAuthHeader()
    };
    
    console.log('Request headers:', headers);
    
    const response = await axios.get(url, { headers });
    console.log('Businesses API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching businesses:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Fetches a single business by ID
 * @param {string} id - Business ID
 * @returns {Promise<Object>} - Promise resolving to business data
 */
const getBusinessById = async (id) => {
  try {
    const headers = {
      ...DEFAULT_HEADERS,
      ...getAuthHeader()
    };
    
    const response = await axios.get(`${API_URL}/businesses/${id}`, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Creates a new business
 * @param {Object} businessData - Business data to create
 * @returns {Promise<Object>} - Promise resolving to created business
 */
const createBusiness = async (businessData) => {
  try {
    const headers = {
      ...DEFAULT_HEADERS,
      ...getAuthHeader()
    };
    
    const response = await axios.post(`${API_URL}/businesses`, businessData, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Updates an existing business
 * @param {string} id - Business ID to update
 * @param {Object} businessData - Updated business data
 * @returns {Promise<Object>} - Promise resolving to updated business
 */
const updateBusiness = async (id, businessData) => {
  try {
    const headers = {
      ...DEFAULT_HEADERS,
      ...getAuthHeader()
    };
    
    const response = await axios.put(`${API_URL}/businesses/${id}`, businessData, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes a business by ID
 * @param {string} id - Business ID to delete
 * @returns {Promise<Object>} - Promise resolving to deletion confirmation
 */
const deleteBusiness = async (id) => {
  try {
    const headers = {
      ...DEFAULT_HEADERS,
      ...getAuthHeader()
    };
    
    const response = await axios.delete(`${API_URL}/businesses/${id}`, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get ratings for a business
 * 
 * @param {number} businessId - Business ID
 * @param {Object} params - Query parameters
 * @param {number} params.skip - Number of ratings to skip
 * @param {number} params.limit - Maximum number of ratings to return
 * @returns {Promise} Promise with response data
 */
const getBusinessRatings = async (businessId, params = {}) => {
  try {
    const headers = {
      ...DEFAULT_HEADERS,
      ...getAuthHeader()
    };
    
    const response = await axios.get(`${API_URL}/businesses/${businessId}/ratings`, { 
      params,
      headers 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Add or update a rating for a business
 * 
 * @param {number} businessId - Business ID
 * @param {Object} ratingData - Rating data
 * @returns {Promise} Promise with response data
 */
const addOrUpdateRating = async (businessId, ratingData) => {
  try {
    const headers = {
      ...DEFAULT_HEADERS,
      ...getAuthHeader()
    };
    
    const response = await axios.post(`${API_URL}/businesses/${businessId}/ratings`, ratingData, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a rating for a business
 * 
 * @param {number} businessId - Business ID
 * @returns {Promise} Promise with response data
 */
const deleteRating = async (businessId) => {
  try {
    const headers = {
      ...DEFAULT_HEADERS,
      ...getAuthHeader()
    };
    
    await axios.delete(`${API_URL}/businesses/${businessId}/ratings/me`, { headers });
    return true;
  } catch (error) {
    throw error;
  }
};

export const businessService = {
  getAllBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinessRatings,
  addOrUpdateRating,
  deleteRating
}; 