import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Login.css';

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/login', formData);
            toast.success('Login successful!');
            onLogin(response.data.user, response.data.token);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-content">
                    <div className="login-header">
                        <h1 className="login-title">Welcome Back!</h1>
                        <p className="login-subtitle">Sign in to your account to continue shopping</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Enter your email"
                                />
                                <span className="input-icon">📧</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Password</label>
                            <div className="input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="checkbox-wrapper">
                                <input type="checkbox" className="checkbox" />
                                <span className="checkmark"></span>
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="forgot-link">
                                Forgot Password?
                            </Link>
                        </div>

                        <button 
                            type="submit" 
                            className="login-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link></p>
                        <div className="divider">
                            <span>or</span>
                        </div>
                        <p>Are you an admin? <Link to="/admin/login" className="admin-link">Admin Login</Link></p>
                    </div>

                    <div className="social-login">
                        <p className="social-text">Or continue with</p>
                        <div className="social-buttons">
                            <button className="social-btn google-btn">
                                <span className="social-icon">🔍</span>
                                Google
                            </button>
                            <button className="social-btn facebook-btn">
                                <span className="social-icon">📘</span>
                                Facebook
                            </button>
                        </div>
                    </div>
                </div>

                <div className="login-image">
                    <div className="image-content">
                        <h2>Premium Sports Gear</h2>
                        <p>Join thousands of young athletes who trust BoySports for their sporting needs</p>
                        <div className="features-list">
                            <div className="feature">
                                <span className="feature-icon">✅</span>
                                Premium Quality Products
                            </div>
                            <div className="feature">
                                <span className="feature-icon">🚚</span>
                                Free Shipping on Orders $50+
                            </div>
                            <div className="feature">
                                <span className="feature-icon">🔄</span>
                                Easy 30-Day Returns
                            </div>
                            <div className="feature">
                                <span className="feature-icon">💬</span>
                                24/7 Customer Support
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
