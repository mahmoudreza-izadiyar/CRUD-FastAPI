import React from 'react';
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './ItemCard.css';

const ItemCard = ({ item, onEdit, onDelete }) => {
  // Format price as currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100); // Assuming price is stored in cents
  };

  // Format date to a readable form
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="item-card">
      <div className="item-card-header">
        <h3 className="item-card-title">{item.name}</h3>
        <div className="item-card-status">
          {item.is_active ? (
            <FaCheckCircle className="status-icon active" title="Active" />
          ) : (
            <FaTimesCircle className="status-icon inactive" title="Inactive" />
          )}
        </div>
      </div>
      
      <div className="item-card-body">
        <p className="item-card-description">
          {item.description || 'No description provided'}
        </p>
        <p className="item-card-price">{formatPrice(item.price)}</p>
      </div>
      
      <div className="item-card-footer">
        <div className="item-card-date">
          Created: {formatDate(item.created_at)}
        </div>
        <div className="item-card-actions">
          <button 
            className="item-card-button edit"
            onClick={() => onEdit(item)}
            aria-label="Edit item"
          >
            <FaEdit />
          </button>
          <button 
            className="item-card-button delete"
            onClick={() => onDelete(item.id)}
            aria-label="Delete item"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard; 