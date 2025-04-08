import axios from 'axios';
import { ENDPOINTS, DEFAULT_HEADERS } from '../config/apiConfig';
import { getAuthHeader } from '../utils/authUtils';

const API_URL = ENDPOINTS.ITEMS;

/**
 * Fetch all items with optional filtering
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.skip - Number of items to skip for pagination
 * @param {number} params.limit - Maximum number of items to return
 * @param {string} params.name - Filter items by name
 * @returns {Promise} Promise with response data
 */
const getAllItems = async (params = {}) => {
  try {
    console.log('Fetching items from:', API_URL, 'with params:', params);
    
    const headers = {
      ...DEFAULT_HEADERS,
      ...getAuthHeader()
    };
    
    console.log('Request headers:', headers);
    
    const response = await axios.get(API_URL, { 
      params,
      headers 
    });
    
    console.log('Items API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching items:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Fetch a single item by ID
 * 
 * @param {number} id - Item ID
 * @returns {Promise} Promise with response data
 */
const getItemById = async (id) => {
  try {
    const headers = {
      ...DEFAULT_HEADERS,
      ...getAuthHeader()
    };
    
    const response = await axios.get(`${API_URL}/${id}`, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new item
 * 
 * @param {Object} itemData - Item data
 * @returns {Promise} Promise with response data
 */
const createItem = async (itemData) => {
  try {
    const headers = {
      ...DEFAULT_HEADERS,
      ...getAuthHeader()
    };
    
    const response = await axios.post(API_URL, itemData, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing item
 * 
 * @param {number} id - Item ID
 * @param {Object} itemData - Item data to update
 * @returns {Promise} Promise with response data
 */
const updateItem = async (id, itemData) => {
  try {
    const headers = {
      ...DEFAULT_HEADERS,
      ...getAuthHeader()
    };
    
    const response = await axios.put(`${API_URL}/${id}`, itemData, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete an item
 * 
 * @param {number} id - Item ID
 * @returns {Promise} Promise with response data
 */
const deleteItem = async (id) => {
  try {
    const headers = {
      ...DEFAULT_HEADERS,
      ...getAuthHeader()
    };
    
    const response = await axios.delete(`${API_URL}/${id}`, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const itemService = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
}; 