import React from 'react';
import { format } from 'date-fns';
import { Tag, Clock } from 'lucide-react';
import './ItemCard.css';

const ItemCard = ({ item, onEdit, onDelete }) => {
  return (
    <div className="item-card">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="item-card-title">{item.name}</h3>
          <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>
            {item.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <p className="item-card-description">{item.description}</p>
        
        <div className="price-container">
          <Tag className="price-icon" />
          <span className="item-card-price">
            ${(item.price / 100).toFixed(2)}
          </span>
        </div>
        
        <div className="date-container">
          <Clock className="date-icon" />
          <span>Updated {format(new Date(item.updated_at), 'MMM d, yyyy')}</span>
        </div>
        
        <div className="item-card-actions">
          <button 
            className="item-card-button edit"
            onClick={() => onEdit(item)}
            aria-label="Edit item"
          >
            Edit
          </button>
          <button 
            className="item-card-button delete"
            onClick={() => onDelete(item.id)}
            aria-label="Delete item"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard; 