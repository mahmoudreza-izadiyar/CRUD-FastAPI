import React from 'react';
import ItemCard from './ItemCard';
import './ItemGrid.css';

const ItemGrid = ({ items, onEdit, onDelete, loading, error }) => {
  if (loading) {
    return (
      <div className="item-grid-loading">
        <div className="loader"></div>
        <p>Loading items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="item-grid-error">
        <p>Error loading items: {error.message}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="item-grid-empty">
        <p>No items found. Add some items to get started!</p>
      </div>
    );
  }

  return (
    <div className="item-grid">
      {items.map((item) => (
        <div className="item-grid-cell" key={item.id}>
          <ItemCard
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
};

export default ItemGrid; 