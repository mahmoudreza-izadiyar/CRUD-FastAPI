import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { businessService } from '../../services/businessService';
import './BusinessForm.css';

const BusinessForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  // Initial form state
  const initialFormState = {
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: '',
    website: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Fetch business data if editing
  useEffect(() => {
    if (isEditing) {
      const fetchBusiness = async () => {
        setLoading(true);
        try {
          const business = await businessService.getBusinessById(id);
          setFormData({
            name: business.name || '',
            description: business.description || '',
            address: business.address || '',
            city: business.city || '',
            state: business.state || '',
            zip_code: business.zip_code || '',
            phone: business.phone || '',
            email: business.email || '',
            website: business.website || ''
          });
          setSubmitError(null);
        } catch (err) {
          console.error('Error fetching business:', err);
          setSubmitError('Could not load business data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchBusiness();
    }
  }, [id, isEditing]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (formData.website && !/^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}(:[0-9]{1,5})?(\/.*)?$/i.test(formData.website)) {
      newErrors.website = 'Invalid website URL format (should start with http:// or https://)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setSubmitError(null);
    
    try {
      if (isEditing) {
        await businessService.updateBusiness(id, formData);
      } else {
        await businessService.createBusiness(formData);
      }
      
      navigate('/businesses');
    } catch (err) {
      console.error('Error submitting business:', err);
      setSubmitError(
        err.response?.data?.detail || 
        'An error occurred while saving the business. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel form
  const handleCancel = () => {
    navigate(isEditing ? `/businesses/${id}` : '/businesses');
  };
  
  if (loading && isEditing) {
    return <div className="loading-message">Loading business data...</div>;
  }
  
  return (
    <div className="business-form-container">
      <div className="business-form-header">
        <Link to="/businesses" className="back-link">
          <ArrowLeft size={18} />
          Back to Businesses
        </Link>
        <h1>{isEditing ? 'Edit Business' : 'Add New Business'}</h1>
      </div>
      
      <form className="business-form" onSubmit={handleSubmit}>
        {submitError && (
          <div className="form-error-message">{submitError}</div>
        )}
        
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="name">
              Business Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'has-error' : ''}
              placeholder="Enter business name"
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the business"
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2>Location</h2>
          
          <div className="form-group">
            <label htmlFor="address">Street Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="zip_code">ZIP Code</label>
              <input
                type="text"
                id="zip_code"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                placeholder="ZIP Code"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Contact Information</h2>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'has-error' : ''}
              placeholder="Email address"
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className={errors.website ? 'has-error' : ''}
              placeholder="Website URL (e.g., https://example.com)"
            />
            {errors.website && <div className="field-error">{errors.website}</div>}
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Business' : 'Create Business'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessForm; 