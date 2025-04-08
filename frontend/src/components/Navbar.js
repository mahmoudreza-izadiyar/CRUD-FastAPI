import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  
  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          FastAPI CRUD
        </Link>
        
        <div className="navbar-menu">
          <Link 
            to="/items" 
            className={`navbar-item ${isActive('/items') ? 'active' : ''}`}
          >
            Items
          </Link>
          <Link 
            to="/businesses" 
            className={`navbar-item ${isActive('/businesses') ? 'active' : ''}`}
          >
            Businesses
          </Link>
        </div>
        
        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="navbar-item">Profile</Link>
              <button className="navbar-button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-item">Login</Link>
              <Link to="/register" className="navbar-button">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 