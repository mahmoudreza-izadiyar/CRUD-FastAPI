import React, { useState } from 'react';
import { ChevronUp, ChevronDown, User } from 'lucide-react';
import StarRating from './StarRating';
import './RatingList.css';

/**
 * A component to display a list of ratings with options for sorting
 * 
 * @param {Object} props - Component props
 * @param {Array} props.ratings - Array of rating objects
 * @param {number} props.businessId - ID of the business
 * @param {Function} [props.onEdit] - Callback when user wants to edit their rating
 * @param {Function} [props.onDelete] - Callback when user wants to delete their rating
 * @param {number} [props.currentUserId] - ID of current user to enable edit/delete controls
 */
const RatingList = ({ ratings, businessId, onEdit, onDelete, currentUserId }) => {
  const [sortOption, setSortOption] = useState('newest');
  
  // Sort the ratings based on selected option
  const sortedRatings = [...ratings].sort((a, b) => {
    switch (sortOption) {
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'newest':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });
  
  // Format date in a readable way
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="rating-list-container">
      <div className="rating-list-header">
        <h3>Customer Reviews</h3>
        
        <div className="rating-sort-controls">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      </div>
      
      {sortedRatings.length === 0 ? (
        <div className="no-ratings">
          <p>This business has not been rated yet. Be the first to leave a review!</p>
        </div>
      ) : (
        <div className="ratings-list">
          {sortedRatings.map((rating) => (
            <div key={rating.id} className="rating-item">
              <div className="rating-user">
                <div className="user-avatar">
                  <User size={20} />
                </div>
                <span className="username">{rating.user_username}</span>
              </div>
              
              <div className="rating-details">
                <div className="rating-top">
                  <StarRating value={rating.rating} readOnly showValue />
                  <span className="rating-date">{formatDate(rating.created_at)}</span>
                </div>
                
                {rating.comment && (
                  <div className="rating-comment">
                    <p>{rating.comment}</p>
                  </div>
                )}
                
                {currentUserId && currentUserId === rating.user_id && (
                  <div className="rating-actions">
                    <button 
                      className="edit-button"
                      onClick={() => onEdit(rating)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete your review?')) {
                          onDelete(rating.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RatingList; 