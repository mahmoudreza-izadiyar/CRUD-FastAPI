import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MenuBar from './components/common/MenuBar';
import NotFoundPage from './pages/NotFoundPage';
import LoginForm from './pages/auth/LoginForm';
import RegisterForm from './pages/auth/RegisterForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import BusinessList from './pages/businesses/BusinessList';
import BusinessDetail from './pages/businesses/BusinessDetail';
import BusinessForm from './pages/businesses/BusinessForm';
import ItemList from './pages/items/ItemList';
import ItemDetail from './pages/items/ItemDetail';
import ItemForm from './pages/items/ItemForm';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <MenuBar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<BusinessList />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              
              {/* Business Routes */}
              <Route path="/businesses" element={<BusinessList />} />
              <Route 
                path="/businesses/new" 
                element={
                  <ProtectedRoute>
                    <BusinessForm />
                  </ProtectedRoute>
                } 
              />
              <Route path="/businesses/:id" element={<BusinessDetail />} />
              <Route 
                path="/businesses/:id/edit" 
                element={
                  <ProtectedRoute>
                    <BusinessForm />
                  </ProtectedRoute>
                } 
              />
              
              {/* Item Routes */}
              <Route path="/items" element={<ItemList />} />
              <Route 
                path="/items/new" 
                element={
                  <ProtectedRoute>
                    <ItemForm />
                  </ProtectedRoute>
                } 
              />
              <Route path="/items/:id" element={<ItemDetail />} />
              <Route 
                path="/items/:id/edit" 
                element={
                  <ProtectedRoute>
                    <ItemForm />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App; 