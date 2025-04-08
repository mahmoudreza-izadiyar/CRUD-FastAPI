import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Edit, Trash, Plus } from 'lucide-react';
import { itemService } from '../../services/itemService';
import './ItemList.css';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch items on component mount and when search term changes
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const params = searchTerm ? { name: searchTerm } : {};
        const data = await itemService.getAllItems(params);
        setItems(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError('Failed to load items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle item deletion
  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await itemService.deleteItem(id);
        setItems(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error('Error deleting item:', err);
        setError('Failed to delete item. Please try again.');
      }
    }
  };

  return (
    <div className="item-list-container">
      <div className="item-list-header">
        <h1>Items</h1>
        <Link to="/items/new" className="add-item-button">
          <Plus size={16} />
          Add Item
        </Link>
      </div>

      <div className="item-list-filters">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Loading items...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : items.length === 0 ? (
        <div className="no-items">
          <p>No items found. Try adjusting your search or add a new item.</p>
        </div>
      ) : (
        <div className="item-grid">
          {items.map(item => (
            <div key={item.id} className="item-card">
              <div className="item-card-header">
                <h2>
                  <Link to={`/items/${item.id}`}>
                    {item.name}
                  </Link>
                </h2>
                <div className="item-actions">
                  <Link to={`/items/${item.id}/edit`} className="edit-button">
                    <Edit size={16} />
                  </Link>
                  <button 
                    className="delete-button" 
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>

              <div className="item-details">
                <p className="item-price">${item.price}</p>
                {item.description && (
                  <p className="item-description">
                    {item.description.length > 100 
                      ? `${item.description.substring(0, 100)}...` 
                      : item.description}
                  </p>
                )}
              </div>

              <div className="item-card-footer">
                <Link to={`/items/${item.id}`} className="view-details-link">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemList; 