import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, X } from 'lucide-react';
import { getItems, createItem, updateItem, deleteItem } from '../api/itemService';
import ItemGrid from './ItemGrid';
import ItemForm from './ItemForm';
import ItemCard from './ItemCard';
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
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-gray-900 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Items Catalog</h1>
          </div>
          
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchItems()}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Total Items: <span className="font-semibold">{items.length}</span>
            </p>

            <div className="flex gap-4">
              <button
                className="filter-button"
                onClick={handleFilterToggle}
              >
                <Filter className="w-5 h-5 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>

              <button
                className="add-button"
                onClick={handleAddClick}
              >
                + Add Item
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="filter-field">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price ($)</label>
                  <input
                    type="number"
                    name="min_price"
                    value={filters.min_price}
                    onChange={handleFilterChange}
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="filter-field">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price ($)</label>
                  <input
                    type="number"
                    name="max_price"
                    value={filters.max_price}
                    onChange={handleFilterChange}
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="filter-field">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    name="is_active" 
                    value={filters.is_active} 
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4 gap-3">
                <button 
                  className="clear-filters-button" 
                  onClick={handleClearFilters}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </button>
                
                <button 
                  className="apply-filters-button" 
                  onClick={() => fetchItems()}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {showForm ? (
          <div className="form-container">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{currentItem ? 'Edit Item' : 'Add New Item'}</h2>
            <ItemForm 
              item={currentItem} 
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        ) : (
          <>
            {items.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">No items found.</p>
                {searchTerm && (
                  <p className="text-gray-400 mt-2">
                    Try adjusting your search term or clear the search to see all items.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage; 