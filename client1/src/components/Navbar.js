import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">⚽</span>
                    BoySports
                </Link>

                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                        Home
                    </Link>
                    <Link to="/products" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                        Products
                    </Link>
                    <Link to="/about" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                        About
                    </Link>
                    <Link to="/contact" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                        Contact
                    </Link>
                    <Link to="/faq" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                        FAQ
                    </Link>

                    {user ? (
                        <>
                            {!user.isAdmin ? (
                                <>
                                    <Link to="/cart" className="navbar-link cart-link" onClick={() => setIsMenuOpen(false)}>
                                        <span className="cart-icon">🛒</span>
                                        Cart
                                    </Link>
                                    <Link to="/wishlist" className="navbar-link wishlist-link" onClick={() => setIsMenuOpen(false)}>
                                        <span className="wishlist-icon">❤️</span>
                                        Wishlist
                                    </Link>
                                    <Link to="/profile" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                                        Profile
                                    </Link>
                                    <Link to="/orders" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                                        Orders
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/admin/dashboard" className="navbar-link admin-link" onClick={() => setIsMenuOpen(false)}>
                                        Dashboard
                                    </Link>
                                    <Link to="/admin/add-product" className="navbar-link admin-link" onClick={() => setIsMenuOpen(false)}>
                                        Add Product
                                    </Link>
                                    <Link to="/admin/orders" className="navbar-link admin-link" onClick={() => setIsMenuOpen(false)}>
                                        All Orders
                                    </Link>
                                    <Link to="/admin/users" className="navbar-link admin-link" onClick={() => setIsMenuOpen(false)}>
                                        Users
                                    </Link>
                                </>
                            )}
                            <button className="navbar-btn logout-btn" onClick={handleLogout}>
                                Logout
                            </button>
                            <span className="user-greeting">Hi, {user.name}!</span>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar-btn login-btn" onClick={() => setIsMenuOpen(false)}>
                                Login
                            </Link>
                            <Link to="/signup" className="navbar-btn signup-btn" onClick={() => setIsMenuOpen(false)}>
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                <div className="navbar-toggle" onClick={toggleMenu}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
