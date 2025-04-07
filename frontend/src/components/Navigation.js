import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <Package className="brand-icon" />
            <span className="brand-text">Items Catalog</span>
          </Link>
        </div>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <div className="user-info">
                <User className="user-icon" />
                <span className="username">{user.username}</span>
              </div>
              <button onClick={handleLogout} className="nav-button logout-button">
                <LogOut className="logout-icon" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-button login-button">
                Login
              </Link>
              <Link to="/register" className="nav-button register-button">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 