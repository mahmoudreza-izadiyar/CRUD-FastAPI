import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import './RatingForm.css';

/**
 * A form component for adding or editing ratings
 * 
 * @param {Object} props - Component props
 * @param {Object} [props.currentRating] - Current rating object if editing
 * @param {number} props.businessId - ID of the business being rated
 * @param {Function} props.onSubmit - Callback when the form is submitted
 * @param {Function} props.onCancel - Callback when the form is cancelled
 */
const RatingForm = ({ currentRating, businessId, onSubmit, onCancel }) => {
  // Form state
  const [rating, setRating] = useState(currentRating ? currentRating.rating : 0);
  const [comment, setComment] = useState(currentRating ? currentRating.comment : '');
  const [ratingError, setRatingError] = useState('');
  const [commentError, setCommentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form state when currentRating changes
  useEffect(() => {
    if (currentRating) {
      setRating(currentRating.rating);
      setComment(currentRating.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
    // Reset errors
    setRatingError('');
    setCommentError('');
  }, [currentRating]);

  // Get rating label based on selected stars
  const getRatingLabel = () => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select your rating';
    }
  };

  // Validate form fields
  const validateForm = () => {
    let isValid = true;
    
    // Validate rating
    if (rating === 0) {
      setRatingError('Please select a rating');
      isValid = false;
    } else {
      setRatingError('');
    }
    
    // Validate comment
    if (!comment.trim()) {
      setCommentError('Please enter your review');
      isValid = false;
    } else if (comment.trim().length < 10) {
      setCommentError('Your review must be at least 10 characters');
      isValid = false;
    } else {
      setCommentError('');
    }
    
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data to submit
      const ratingData = {
        rating,
        comment,
        businessId,
        id: currentRating ? currentRating.id : undefined
      };
      
      // Call onSubmit prop with form data
      await onSubmit(ratingData);
      
      // Reset form if not editing
      if (!currentRating) {
        setRating(0);
        setComment('');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="rating-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <label className="rating-form-label">Your Rating</label>
        <div className="star-rating-container">
          <StarRating 
            value={rating} 
            onChange={setRating} 
            size="large" 
            interactive={true}
          />
          <span className="rating-label">{getRatingLabel()}</span>
        </div>
        {ratingError && <div className="form-error">{ratingError}</div>}
      </div>
      
      <div className="form-section">
        <label htmlFor="comment" className="rating-form-label">Your Review</label>
        <textarea
          id="comment"
          className={`rating-comment-input ${commentError ? 'has-error' : ''}`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your experience here... (minimum 10 characters)"
          rows={5}
        />
        {commentError && <div className="form-error">{commentError}</div>}
      </div>
      
      <div className="form-actions">
        <button 
          type="button" 
          className="cancel-button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? 'Submitting...' 
            : currentRating 
              ? 'Update Review' 
              : 'Submit Review'
          }
        </button>
      </div>
    </form>
  );
};

export default RatingForm; 