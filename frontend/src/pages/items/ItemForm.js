import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { itemService } from '../../services/itemService';
import { businessService } from '../../services/businessService';
import './ItemForm.css';

const ItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    business_id: ''
  });
  
  const [businesses, setBusinesses] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const data = await businessService.getAllBusinesses();
        setBusinesses(data);
      } catch (err) {
        console.error('Error fetching businesses:', err);
      }
    };

    const fetchItem = async () => {
      if (isEditMode) {
        try {
          setInitialLoading(true);
          const data = await itemService.getItemById(id);
          setFormData({
            name: data.name || '',
            description: data.description || '',
            price: data.price ? data.price.toString() : '',
            business_id: data.business_id || ''
          });
        } catch (err) {
          console.error('Error fetching item:', err);
          setSubmitError('Failed to load item data. Please try again later.');
        } finally {
          setInitialLoading(false);
        }
      }
    };

    fetchBusinesses();
    fetchItem();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.business_id) {
      newErrors.business_id = 'Business is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setSubmitError(null);
    
    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price)
      };
      
      if (isEditMode) {
        await itemService.updateItem(id, itemData);
      } else {
        await itemService.createItem(itemData);
      }
      
      navigate('/items');
    } catch (err) {
      console.error('Error saving item:', err);
      setSubmitError(
        isEditMode
          ? 'Failed to update item. Please try again later.'
          : 'Failed to create item. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="item-form-container">
        <div className="loading-message">Loading item data...</div>
      </div>
    );
  }

  return (
    <div className="item-form-container">
      <div className="item-form-header">
        <h1>{isEditMode ? 'Edit Item' : 'Add New Item'}</h1>
      </div>
      
      <form className="item-form" onSubmit={handleSubmit}>
        {submitError && <div className="form-error-message">{submitError}</div>}
        
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Item name"
            className={errors.name ? 'error' : ''}
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
            placeholder="Item description"
            rows="4"
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <div className="field-error">{errors.description}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <div className="price-input-wrapper">
            <span className="price-symbol">$</span>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`price-input ${errors.price ? 'error' : ''}`}
            />
          </div>
          {errors.price && <div className="field-error">{errors.price}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="business_id">Business</label>
          <select
            id="business_id"
            name="business_id"
            value={formData.business_id}
            onChange={handleChange}
            className={errors.business_id ? 'error' : ''}
          >
            <option value="">Select a business</option>
            {businesses.map(business => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
          {errors.business_id && <div className="field-error">{errors.business_id}</div>}
        </div>
        
        <div className="form-actions">
          <Link to="/items" className="cancel-button">
            <ArrowLeft size={16} />
            Cancel
          </Link>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm; 