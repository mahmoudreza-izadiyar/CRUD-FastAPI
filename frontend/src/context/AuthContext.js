import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../api/authService';
import toast from 'react-hot-toast';

// Create the auth context
const AuthContext = createContext();

// Auth context provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Setup axios auth header
        authService.initializeAuth();
        
        // Only fetch user data if user is logged in
        if (authService.isLoggedIn()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // In case of error, clear any invalid tokens
        if (error.response && error.response.status === 401) {
          toast.error('Session expired. Please log in again.');
        }
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  // Login handler
  const login = async (username, password) => {
    setLoading(true);
    try {
      await authService.login(username, password);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      toast.success('Login successful!');
      return true;
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (userData) => {
    setLoading(true);
    try {
      await authService.register(userData);
      toast.success('Registration successful! You can now log in.');
      return true;
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully');
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails on the server, we still log out the user locally
      setUser(null);
      toast.success('Logged out successfully');
      return true;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    initialized,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 