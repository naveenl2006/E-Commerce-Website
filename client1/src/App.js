import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// User Pages
import Home from './pages/User/Home';
import About from './pages/User/About';
import Contact from './pages/User/Contact';
import FAQ from './pages/User/FAQ';
import Login from './pages/User/Login';
import Signup from './pages/User/Signup';
import Products from './pages/User/Products';
import ProductDetails from './pages/User/ProductDetails'; // Add this import
import Cart from './pages/User/Cart';
import Wishlist from './pages/User/Wishlist';
import Checkout from './pages/User/Checkout';
import Profile from './pages/User/Profile';
import Orders from './pages/User/Orders';

// Admin Pages
import AdminLogin from './pages/Admin/AdminLogin';
import Dashboard from './pages/Admin/Dashboard';
import AddProduct from './pages/Admin/AddProduct';
import AllOrders from './pages/Admin/AllOrders';
import Users from './pages/Admin/Users';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} /> {/* Add this route */}
            
            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
            />
            <Route 
              path="/signup" 
              element={user ? <Navigate to="/" /> : <Signup onLogin={handleLogin} />} 
            />
            
            {/* Protected User Routes */}
            <Route 
              path="/cart" 
              element={user && !user.isAdmin ? <Cart /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/wishlist" 
              element={user && !user.isAdmin ? <Wishlist /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/checkout" 
              element={user && !user.isAdmin ? <Checkout /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={user && !user.isAdmin ? <Profile /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/orders" 
              element={user && !user.isAdmin ? <Orders /> : <Navigate to="/login" />} 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/login" 
              element={user?.isAdmin ? <Navigate to="/admin/dashboard" /> : <AdminLogin onLogin={handleLogin} />} 
            />
            <Route 
              path="/admin/dashboard" 
              element={user?.isAdmin ? <Dashboard /> : <Navigate to="/admin/login" />} 
            />
            <Route 
              path="/admin/add-product" 
              element={user?.isAdmin ? <AddProduct /> : <Navigate to="/admin/login" />} 
            />
            <Route 
              path="/admin/orders" 
              element={user?.isAdmin ? <AllOrders /> : <Navigate to="/admin/login" />} 
            />
            <Route 
              path="/admin/users" 
              element={user?.isAdmin ? <Users /> : <Navigate to="/admin/login" />} 
            />
            
          </Routes>
        </main>
        <Footer />
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
