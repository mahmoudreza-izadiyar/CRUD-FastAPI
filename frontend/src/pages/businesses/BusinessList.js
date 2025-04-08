import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Phone, Star, Plus, Edit, Trash } from 'lucide-react';
import { businessService } from '../../services/businessService';
import './BusinessList.css';

const BusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minRating: '',
    maxRating: '',
    sortBy: ''
  });

  // Fetch businesses on component mount and when filters change
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const params = {
          name: searchTerm || undefined,
          min_rating: filters.minRating || undefined,
          max_rating: filters.maxRating || undefined,
          sort_by_rating: filters.sortBy || undefined
        };
        
        const data = await businessService.getAllBusinesses(params);
        setBusinesses(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching businesses:', err);
        setError('Failed to load businesses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [searchTerm, filters]);

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle business deletion
  const handleDeleteBusiness = async (id) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      try {
        await businessService.deleteBusiness(id);
        setBusinesses(prev => prev.filter(business => business.id !== id));
      } catch (err) {
        console.error('Error deleting business:', err);
        setError('Failed to delete business. Please try again.');
      }
    }
  };

  // Render rating stars
  const renderRatingStars = (rating) => {
    return (
      <div className="business-rating">
        <span className="star-icon"><Star size={16} fill="#FFD700" color="#FFD700" /></span>
        <span>{rating.toFixed(1)}</span>
        <span className="rating-count">({rating > 0 ? 'Based on reviews' : 'No reviews yet'})</span>
      </div>
    );
  };

  return (
    <div className="business-list-container">
      <div className="business-list-header">
        <h1>Businesses</h1>
        <Link to="/businesses/new" className="add-business-button">
          <Plus size={16} />
          Add Business
        </Link>
      </div>

      <div className="business-list-filters">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filter-controls">
          <select 
            name="minRating" 
            value={filters.minRating} 
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Min Rating</option>
            <option value="1">1+ Star</option>
            <option value="2">2+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>

          <select 
            name="maxRating" 
            value={filters.maxRating} 
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Max Rating</option>
            <option value="5">Up to 5 Stars</option>
            <option value="4">Up to 4 Stars</option>
            <option value="3">Up to 3 Stars</option>
            <option value="2">Up to 2 Stars</option>
            <option value="1">Up to 1 Star</option>
          </select>

          <select 
            name="sortBy" 
            value={filters.sortBy} 
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Sort By</option>
            <option value="desc">Highest Rated</option>
            <option value="asc">Lowest Rated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Loading businesses...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : businesses.length === 0 ? (
        <div className="no-businesses">
          <p>No businesses found. Try adjusting your filters or add a new business.</p>
        </div>
      ) : (
        <div className="business-grid">
          {businesses.map(business => (
            <div key={business.id} className="business-card">
              <div className="business-card-header">
                <h2>
                  <Link to={`/businesses/${business.id}`}>
                    {business.name}
                  </Link>
                </h2>
                <div className="business-actions">
                  <Link to={`/businesses/${business.id}/edit`} className="edit-button">
                    <Edit size={16} />
                  </Link>
                  <button 
                    className="delete-button" 
                    onClick={() => handleDeleteBusiness(business.id)}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>

              {renderRatingStars(business.average_rating)}

              <div className="business-details">
                {business.address && (
                  <div className="business-detail">
                    <MapPin size={16} />
                    <span>
                      {business.address}, {business.city}, {business.state} {business.zip_code}
                    </span>
                  </div>
                )}
                
                {business.phone && (
                  <div className="business-detail">
                    <Phone size={16} />
                    <span>{business.phone}</span>
                  </div>
                )}
              </div>

              <div className="business-description">
                {business.description ? (
                  <p>{business.description.length > 100 
                    ? `${business.description.substring(0, 100)}...` 
                    : business.description}
                  </p>
                ) : (
                  <p className="no-description">No description available</p>
                )}
              </div>

              <div className="business-card-footer">
                <Link to={`/businesses/${business.id}`} className="view-details-link">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessList; 