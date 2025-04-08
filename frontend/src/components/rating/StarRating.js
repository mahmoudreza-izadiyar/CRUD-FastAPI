import React from 'react';
import './StarRating.css';

/**
 * A star rating component for displaying or selecting ratings
 * 
 * @param {Object} props - Component props
 * @param {number} props.value - Current rating value (1-5)
 * @param {Function} [props.onChange] - Callback when rating is changed (only for interactive mode)
 * @param {boolean} [props.readOnly=false] - Whether the rating is read-only
 * @param {boolean} [props.interactive=false] - Whether the rating is interactive
 * @param {string} [props.size='medium'] - Size of the stars ('small', 'medium', 'large')
 * @param {string} [props.className] - Additional CSS class
 */
const StarRating = ({ 
  value = 0, 
  onChange, 
  readOnly = false, 
  interactive = false,
  size = 'medium', 
  className = '' 
}) => {
  // Round the value to nearest half star
  const roundedValue = Math.round(value * 2) / 2;
  
  // Handle click on a star
  const handleStarClick = (rating) => {
    if (!readOnly && interactive && onChange) {
      onChange(rating);
    }
  };
  
  // Determine the fill level for each star (0, 0.5, or 1)
  const getStarFill = (position) => {
    const difference = roundedValue - position;
    
    if (difference >= 0) {
      return 1; // Full star
    } else if (difference > -1 && difference < 0) {
      return 0.5; // Half star
    } else {
      return 0; // Empty star
    }
  };
  
  // Determine the CSS class based on star fill level and component props
  const getStarClass = (position) => {
    const fill = getStarFill(position);
    let classes = ['star'];
    
    // Add size class
    classes.push(`star-${size}`);
    
    // Add fill class
    if (fill === 1) {
      classes.push('star-full');
    } else if (fill === 0.5) {
      classes.push('star-half');
    } else {
      classes.push('star-empty');
    }
    
    return classes.join(' ');
  };
  
  // Render stars as buttons if interactive, otherwise as spans
  const renderStar = (position) => {
    const starClass = getStarClass(position);
    
    return interactive && !readOnly ? (
      <button
        key={position}
        type="button"
        className={starClass}
        onClick={() => handleStarClick(position)}
        aria-label={`Rate ${position} out of 5 stars`}
      >
        <span className="star-icon">★</span>
      </button>
    ) : (
      <span
        key={position}
        className={starClass}
        role={readOnly ? 'img' : undefined}
        aria-label={readOnly ? `${roundedValue} out of 5 stars` : undefined}
      >
        <span className="star-icon">★</span>
      </span>
    );
  };
  
  // Generate all 5 stars
  const stars = [1, 2, 3, 4, 5].map(renderStar);
  
  return (
    <div className={`star-rating ${className}`} data-rating={roundedValue}>
      {stars}
    </div>
  );
};

export default StarRating; 