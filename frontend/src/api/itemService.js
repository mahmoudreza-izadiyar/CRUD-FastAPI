import axios from 'axios';

const API_URL = '/items';

// Get all items
export const getItems = async (filters = {}) => {
  try {
    // Build query params for filtering
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.min_price) params.append('min_price', filters.min_price);
    if (filters.max_price) params.append('max_price', filters.max_price);
    
    // Only add is_active if it's true or false (not empty string or undefined)
    if (filters.is_active === true) {
      params.append('is_active', 'true');
    } else if (filters.is_active === false) {
      params.append('is_active', 'false');
    }
    
    const response = await axios.get(API_URL + '/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
};

// Get single item by ID
export const getItemById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching item with ID ${id}:`, error);
    throw error;
  }
};

// Create new item
export const createItem = async (itemData) => {
  try {
    const response = await axios.post(API_URL + '/', itemData);
    return response.data;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

// Update item
export const updateItem = async (id, itemData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, itemData);
    return response.data;
  } catch (error) {
    console.error(`Error updating item with ID ${id}:`, error);
    throw error;
  }
};

// Delete item
export const deleteItem = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting item with ID ${id}:`, error);
    throw error;
  }
}; 