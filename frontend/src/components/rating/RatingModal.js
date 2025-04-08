import React, { useEffect } from 'react';
import RatingForm from './RatingForm';
import './RatingModal.css';

/**
 * A modal component for adding or editing ratings
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback when the modal is closed
 * @param {Object} [props.currentRating] - Current rating object if editing
 * @param {number} props.businessId - ID of the business being rated
 * @param {Function} props.onSubmit - Callback when the form is submitted
 */
const RatingModal = ({ isOpen, onClose, currentRating, businessId, onSubmit }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  // Don't render anything if modal is not open
  if (!isOpen) return null;
  
  // Handle overlay click - close modal when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('rating-modal-overlay')) {
      onClose();
    }
  };
  
  return (
    <div className="rating-modal-overlay" onClick={handleOverlayClick}>
      <div className="rating-modal-content">
        <div className="rating-modal-header">
          <h2>{currentRating ? 'Edit Your Review' : 'Add Your Review'}</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="rating-modal-body">
          <RatingForm 
            currentRating={currentRating}
            businessId={businessId}
            onSubmit={(data) => {
              onSubmit(data);
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default RatingModal; 