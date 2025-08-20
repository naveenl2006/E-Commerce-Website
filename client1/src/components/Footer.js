import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3 className="footer-title">
                            <span className="footer-logo-icon">⚽</span>
                            BoySports
                        </h3>
                        <p className="footer-description">
                            Your ultimate destination for premium boys sportswear. 
                            Quality gear for young athletes and sports enthusiasts.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-link" aria-label="Facebook">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a href="#" className="social-link" aria-label="Twitter">
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="#" className="social-link" aria-label="YouTube">
                                <i className="fab fa-youtube"></i>
                            </a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4 className="section-title">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/" className="footer-link">Home</Link></li>
                            <li><Link to="/products" className="footer-link">Products</Link></li>
                            <li><Link to="/about" className="footer-link">About Us</Link></li>
                            <li><Link to="/contact" className="footer-link">Contact</Link></li>
                            <li><Link to="/faq" className="footer-link">FAQ</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4 className="section-title">Categories</h4>
                        <ul className="footer-links">
                            <li><a href="#" className="footer-link">T-Shirts</a></li>
                            <li><a href="#" className="footer-link">Shorts</a></li>
                            <li><a href="#" className="footer-link">Tracksuits</a></li>
                            <li><a href="#" className="footer-link">Shoes</a></li>
                            <li><a href="#" className="footer-link">Accessories</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4 className="section-title">Customer Service</h4>
                        <ul className="footer-links">
                            <li><a href="#" className="footer-link">Shipping Info</a></li>
                            <li><a href="#" className="footer-link">Returns</a></li>
                            <li><a href="#" className="footer-link">Size Guide</a></li>
                            <li><a href="#" className="footer-link">Track Order</a></li>
                            <li><a href="#" className="footer-link">Support</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4 className="section-title">Contact Info</h4>
                        <div className="contact-info">
                            <div className="contact-item">
                                <span className="contact-icon">📍</span>
                                <span>123 Sports Avenue, Athletic City, AC 12345</span>
                            </div>
                            <div className="contact-item">
                                <span className="contact-icon">📞</span>
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div className="contact-item">
                                <span className="contact-icon">✉️</span>
                                <span>info@boysports.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-bottom-content">
                        <p>&copy; 2025 BoySports. All rights reserved.</p>
                        <div className="footer-bottom-links">
                            <a href="#" className="footer-bottom-link">Privacy Policy</a>
                            <a href="#" className="footer-bottom-link">Terms of Service</a>
                            <a href="#" className="footer-bottom-link">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
