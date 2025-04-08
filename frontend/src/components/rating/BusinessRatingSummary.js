import React from 'react';
import StarRating from './StarRating';
import './BusinessRatingSummary.css';

/**
 * A component to display the summary of ratings for a business
 * 
 * @param {Object} props - Component props
 * @param {Array} props.ratings - Array of rating objects
 * @param {Object} props.business - Business object
 */
const BusinessRatingSummary = ({ ratings, business }) => {
  // Calculate the average rating
  const calculateAverage = () => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return parseFloat((sum / ratings.length).toFixed(1));
  };

  // Get the distribution of ratings (how many 5-stars, 4-stars, etc.)
  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // For 1 to 5 stars
    
    if (ratings && ratings.length > 0) {
      ratings.forEach(rating => {
        // Adjust index for zero-based array (5 stars = index 4)
        distribution[rating.rating - 1]++;
      });
    }
    
    return distribution;
  };

  const averageRating = calculateAverage();
  const distribution = getRatingDistribution();
  const totalRatings = ratings ? ratings.length : 0;

  // Calculate percentage for each rating level
  const getPercentage = (count) => {
    if (totalRatings === 0) return 0;
    return Math.round((count / totalRatings) * 100);
  };

  return (
    <div className="business-rating-summary">
      <div className="rating-summary-header">
        <h3>Customer Ratings</h3>
      </div>
      
      <div className="rating-summary-content">
        <div className="average-rating-section">
          <div className="average-rating-value">{averageRating.toFixed(1)}</div>
          <div className="average-rating-stars">
            <StarRating value={averageRating} readOnly size="large" />
          </div>
          <div className="total-ratings">
            {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
          </div>
        </div>
        
        <div className="rating-distribution">
          {[5, 4, 3, 2, 1].map(starValue => (
            <div key={starValue} className="distribution-row">
              <span className="star-label">{starValue} star</span>
              <div className="distribution-bar-container">
                <div 
                  className="distribution-bar"
                  style={{ width: `${getPercentage(distribution[starValue - 1])}%` }}
                ></div>
              </div>
              <span className="distribution-percentage">
                {getPercentage(distribution[starValue - 1])}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessRatingSummary; 