import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, ArrowLeft, Edit, Trash } from 'lucide-react';
import { businessService } from '../../services/businessService';
import RatingList from '../../components/rating/RatingList';
import BusinessRatingSummary from '../../components/rating/BusinessRatingSummary';
import RatingModal from '../../components/rating/RatingModal';
import './BusinessDetail.css';

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // For simplicity, assuming user is logged in with ID 1 - in a real app, get from auth context
  const currentUserId = 1;
  // Modal state
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [currentRating, setCurrentRating] = useState(null);

  // Fetch business and ratings on component mount
  useEffect(() => {
    const fetchBusinessData = async () => {
      setLoading(true);
      try {
        const businessData = await businessService.getBusinessById(id);
        setBusiness(businessData);
        
        const ratingsData = await businessService.getBusinessRatings(id);
        setRatings(ratingsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching business data:', err);
        setError('Failed to load business details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [id]);

  // Handle business deletion
  const handleDeleteBusiness = async () => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      try {
        await businessService.deleteBusiness(id);
        navigate('/businesses');
      } catch (err) {
        console.error('Error deleting business:', err);
        setError('Failed to delete business. Please try again.');
      }
    }
  };

  // Handle adding or editing a rating
  const handleAddEditRating = (rating) => {
    setCurrentRating(rating);
    setIsRatingModalOpen(true);
  };

  // Handle rating submission from modal
  const handleRatingSubmit = async (ratingData) => {
    try {
      const response = await businessService.addOrUpdateRating(id, {
        rating: ratingData.rating,
        comment: ratingData.comment
      });
      
      // If editing, update the rating in the list
      if (currentRating) {
        setRatings(ratings.map(r => 
          r.id === currentRating.id ? { ...response, user_username: r.user_username } : r
        ));
      } else {
        // If adding, fetch all ratings again to get the updated list
        const updatedRatings = await businessService.getBusinessRatings(id);
        setRatings(updatedRatings);
      }
      
      // Refresh business data to get updated rating average
      const updatedBusiness = await businessService.getBusinessById(id);
      setBusiness(updatedBusiness);
      
      setCurrentRating(null);
    } catch (err) {
      console.error('Error submitting rating:', err);
      alert('Failed to submit rating. Please try again.');
    }
  };

  // Handle rating deletion
  const handleDeleteRating = async (ratingId) => {
    try {
      await businessService.deleteRating(id);
      
      // Remove the rating from the list
      setRatings(ratings.filter(r => r.id !== ratingId));
      
      // Refresh business data to get updated rating average
      const updatedBusiness = await businessService.getBusinessById(id);
      setBusiness(updatedBusiness);
    } catch (err) {
      console.error('Error deleting rating:', err);
      alert('Failed to delete rating. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading-message">Loading business details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!business) {
    return <div className="not-found-message">Business not found</div>;
  }

  return (
    <div className="business-detail-container">
      <div className="business-detail-header">
        <Link to="/businesses" className="back-link">
          <ArrowLeft size={18} />
          Back to Businesses
        </Link>
        
        <div className="business-actions">
          <Link to={`/businesses/${id}/edit`} className="edit-business-button">
            <Edit size={16} />
            Edit
          </Link>
          <button className="delete-business-button" onClick={handleDeleteBusiness}>
            <Trash size={16} />
            Delete
          </button>
        </div>
      </div>
      
      <div className="business-detail-content">
        <div className="business-main-info">
          <h1>{business.name}</h1>
          <div className="business-meta">
            <span className="business-rating">
              {business.average_rating.toFixed(1)} stars
            </span>
            <span className="rating-count">
              ({business.total_ratings} {business.total_ratings === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          
          {business.description && (
            <div className="business-description">
              <p>{business.description}</p>
            </div>
          )}
        </div>
        
        <div className="business-contact-info">
          {(business.address || business.city || business.state) && (
            <div className="contact-item">
              <div className="contact-icon">
                <MapPin size={18} />
              </div>
              <div className="contact-text">
                {business.address && <div>{business.address}</div>}
                {(business.city || business.state) && (
                  <div>
                    {business.city && `${business.city}, `}
                    {business.state} {business.zip_code}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {business.phone && (
            <div className="contact-item">
              <div className="contact-icon">
                <Phone size={18} />
              </div>
              <div className="contact-text">
                <a href={`tel:${business.phone}`}>{business.phone}</a>
              </div>
            </div>
          )}
          
          {business.email && (
            <div className="contact-item">
              <div className="contact-icon">
                <Mail size={18} />
              </div>
              <div className="contact-text">
                <a href={`mailto:${business.email}`}>{business.email}</a>
              </div>
            </div>
          )}
          
          {business.website && (
            <div className="contact-item">
              <div className="contact-icon">
                <Globe size={18} />
              </div>
              <div className="contact-text">
                <a href={business.website} target="_blank" rel="noopener noreferrer">
                  {business.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="business-detail-ratings">
        <div className="ratings-header">
          <h2>Ratings & Reviews</h2>
          <button 
            className="add-rating-button"
            onClick={() => handleAddEditRating(null)}
          >
            Write a Review
          </button>
        </div>
        
        <BusinessRatingSummary 
          ratings={ratings}
          business={business}
        />
        
        <RatingList 
          ratings={ratings}
          businessId={business.id}
          onEdit={handleAddEditRating}
          onDelete={handleDeleteRating}
          currentUserId={currentUserId}
        />
      </div>
      
      <RatingModal 
        isOpen={isRatingModalOpen}
        onClose={() => {
          setIsRatingModalOpen(false);
          setCurrentRating(null);
        }}
        currentRating={currentRating}
        businessId={business.id}
        onSubmit={handleRatingSubmit}
      />
    </div>
  );
};

export default BusinessDetail; 