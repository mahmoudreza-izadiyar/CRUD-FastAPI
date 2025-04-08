import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Store, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './MenuBar.css';

const MenuBar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toggleMenu();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header className="menu-bar">
      <div className="menu-container">
        <div className="menu-logo">
          <Link to="/" className="logo-link">
            YelpClone
          </Link>
        </div>

        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`menu-nav ${isMenuOpen ? 'open' : ''}`}>
          <ul className="menu-list">
            <li className="menu-item">
              <Link 
                to="/businesses" 
                className={`menu-link ${isActive('/businesses') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <Store size={18} />
                <span>Businesses</span>
              </Link>
            </li>
            <li className="menu-item">
              <Link 
                to="/items" 
                className={`menu-link ${isActive('/items') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <ShoppingBag size={18} />
                <span>Items</span>
              </Link>
            </li>
            
            {isAuthenticated ? (
              <li className="menu-item auth-item">
                <button 
                  className="menu-link logout-button" 
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </li>
            ) : (
              <>
                <li className="menu-item auth-item">
                  <Link 
                    to="/login" 
                    className={`menu-link ${isActive('/login') ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    <LogIn size={18} />
                    <span>Login</span>
                  </Link>
                </li>
                <li className="menu-item auth-item">
                  <Link 
                    to="/register" 
                    className={`menu-link ${isActive('/register') ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    <UserPlus size={18} />
                    <span>Register</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default MenuBar; 