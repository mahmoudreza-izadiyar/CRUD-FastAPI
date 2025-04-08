import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Pencil, Trash, ArrowLeft } from 'lucide-react';
import { itemService } from '../../services/itemService';
import { useAuth } from '../../contexts/AuthContext';
import './ItemDetail.css';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const data = await itemService.getItemById(id);
        setItem(data);
        setError(null);
      } catch (err) {
        setError('Failed to load item details. Please try again later.');
        console.error('Error fetching item:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await itemService.deleteItem(id);
        navigate('/items');
      } catch (err) {
        setError('Failed to delete item. Please try again later.');
        console.error('Error deleting item:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="item-detail-container">
        <div className="loading-message">Loading item details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="item-detail-container">
        <div className="error-message">{error}</div>
        <div className="action-buttons">
          <Link to="/items" className="back-button">
            <ArrowLeft size={16} />
            Back to Items
          </Link>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="item-detail-container">
        <div className="error-message">Item not found</div>
        <div className="action-buttons">
          <Link to="/items" className="back-button">
            <ArrowLeft size={16} />
            Back to Items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="item-detail-container">
      <div className="item-detail-card">
        <div className="item-detail-header">
          <h1>{item.name}</h1>
          {isAuthenticated && (
            <div className="item-actions">
              <button 
                className="edit-button" 
                onClick={() => navigate(`/items/${id}/edit`)}
              >
                <Pencil size={18} />
                Edit
              </button>
              <button 
                className="delete-button"
                onClick={handleDelete}
              >
                <Trash size={18} />
                Delete
              </button>
            </div>
          )}
        </div>
        
        <div className="item-detail-content">
          <div className="item-price-section">
            <span className="item-price">${item.price.toFixed(2)}</span>
          </div>
          
          <div className="item-info-section">
            <h2>Description</h2>
            <p className="item-description">{item.description}</p>
          </div>
          
          {item.business && (
            <div className="item-business-section">
              <h2>Business</h2>
              <div className="business-info">
                <Link to={`/businesses/${item.business.id}`} className="business-link">
                  {item.business.name}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="action-buttons">
        <Link to="/items" className="back-button">
          <ArrowLeft size={16} />
          Back to Items
        </Link>
      </div>
    </div>
  );
};

export default ItemDetail; 