import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { getItems, createItem, updateItem, deleteItem } from '../api/itemService';
import ItemGrid from './ItemGrid';
import ItemForm from './ItemForm';
import toast, { Toaster } from 'react-hot-toast';
import './HomePage.css';

const HomePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    is_active: ''
  });

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Process filter values before API call
  const processFilters = (filterValues) => {
    const processedFilters = { ...filterValues };
    
    // Convert prices to integers if they exist
    if (processedFilters.min_price) {
      processedFilters.min_price = Math.floor(parseFloat(processedFilters.min_price) * 100);
    }
    
    if (processedFilters.max_price) {
      processedFilters.max_price = Math.floor(parseFloat(processedFilters.max_price) * 100);
    }
    
    // Convert is_active string to boolean
    if (processedFilters.is_active === 'true') {
      processedFilters.is_active = true;
    } else if (processedFilters.is_active === 'false') {
      processedFilters.is_active = false;
    } else {
      // If empty or invalid, remove it
      delete processedFilters.is_active;
    }
    
    return processedFilters;
  };

  const fetchItems = async (searchParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const processedFilters = processFilters({
        ...filters,
        ...searchParams
      });
      
      const fetchedItems = await getItems({
        name: searchTerm,
        ...processedFilters
      });
      setItems(fetchedItems);
    } catch (err) {
      setError(err);
      toast.error('Failed to load items');
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentItem(null);
    setShowForm(true);
  };

  const handleEditClick = (item) => {
    setCurrentItem(item);
    setShowForm(true);
  };

  const handleDeleteClick = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(itemId);
        setItems(items.filter(item => item.id !== itemId));
        toast.success('Item deleted successfully');
      } catch (err) {
        toast.error('Failed to delete item');
        console.error(err);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (currentItem) {
        // Update existing item
        const updatedItem = await updateItem(currentItem.id, formData);
        setItems(items.map(item => 
          item.id === currentItem.id ? updatedItem : item
        ));
        toast.success('Item updated successfully');
      } else {
        // Create new item
        const newItem = await createItem(formData);
        setItems([...items, newItem]);
        toast.success('Item created successfully');
      }
      setShowForm(false);
    } catch (err) {
      toast.error(currentItem ? 'Failed to update item' : 'Failed to create item');
      console.error(err);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      min_price: '',
      max_price: '',
      is_active: ''
    });
    setSearchTerm('');
    fetchItems({
      name: '',
      min_price: '',
      max_price: '',
      is_active: ''
    });
  };

  return (
    <div className="home-page">
      <Toaster position="top-right" />
      
      <header className="page-header">
        <h1>Inventory Items</h1>
        <button className="add-button" onClick={handleAddClick}>
          <FaPlus /> Add Item
        </button>
      </header>

      <div className="search-filter-container">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <FaSearch />
            </button>
          </div>
          
          <button 
            type="button" 
            className="filter-toggle-button"
            onClick={handleFilterToggle}
          >
            <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </form>

        {showFilters && (
          <div className="filters-container">
            <div className="filter-group">
              <label>Min Price ($)</label>
              <input
                type="number"
                name="min_price"
                value={filters.min_price}
                onChange={handleFilterChange}
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="filter-group">
              <label>Max Price ($)</label>
              <input
                type="number"
                name="max_price"
                value={filters.max_price}
                onChange={handleFilterChange}
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="filter-group">
              <label>Status</label>
              <select 
                name="is_active" 
                value={filters.is_active} 
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            
            <button 
              className="clear-filters-button" 
              onClick={handleClearFilters}
            >
              <FaTimes /> Clear Filters
            </button>
            
            <button 
              className="apply-filters-button" 
              onClick={() => fetchItems()}
            >
              Apply Filters
            </button>
          </div>
        )}
      </div>

      {showForm ? (
        <div className="form-container">
          <h2>{currentItem ? 'Edit Item' : 'Add New Item'}</h2>
          <ItemForm 
            item={currentItem} 
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <ItemGrid
          items={items}
          loading={loading}
          error={error}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}
    </div>
  );
};

export default HomePage; 