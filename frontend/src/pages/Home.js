import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to FastAPI CRUD</h1>
        <p>A simple application to manage items and businesses with ratings</p>
        
        <div className="home-features">
          <div className="feature-card">
            <h2>Items</h2>
            <p>View, create, update, and delete items in the system.</p>
            <Link to="/items" className="feature-link">
              Browse Items
            </Link>
          </div>
          
          <div className="feature-card">
            <h2>Businesses</h2>
            <p>Explore businesses and see their ratings and reviews.</p>
            <Link to="/businesses" className="feature-link">
              Browse Businesses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 