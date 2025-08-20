import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
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
            const response = await axios.post('/api/auth/admin/login', formData);
            toast.success('Admin login successful!');
            onLogin(response.data.user, response.data.token);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Admin login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-container">
                <div className="admin-login-content">
                    <div className="admin-login-header">
                        <div className="admin-logo">
                            <span className="logo-icon">🛡️</span>
                            <span className="logo-text">Admin Portal</span>
                        </div>
                        <h1 className="admin-login-title">Administrator Login</h1>
                        <p className="admin-login-subtitle">Access the BoySports management dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="admin-login-form">
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Admin Email</label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Enter admin email"
                                />
                                <span className="input-icon">👤</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Admin Password</label>
                            <div className="input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Enter admin password"
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
                                Remember this device
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            className="admin-login-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <span className="btn-icon">🔐</span>
                                    Access Dashboard
                                </>
                            )}
                        </button>
                    </form>

                    <div className="admin-login-footer">
                        <div className="security-notice">
                            <div className="notice-icon">🔒</div>
                            <div className="notice-text">
                                <strong>Secure Access</strong>
                                <p>This is a protected admin area. All activities are logged and monitored.</p>
                            </div>
                        </div>
                        
                        <div className="login-help">
                            <p>Need help accessing your account?</p>
                            <button className="help-link" disabled>
                                Contact System Administrator
                            </button>
                        </div>
                        
                        <div className="back-to-store">
                            <Link to="/" className="back-link">
                                ← Back to Store
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="admin-login-features">
                    <div className="features-content">
                        <h2>Admin Dashboard Features</h2>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">📊</div>
                                <h3>Analytics Dashboard</h3>
                                <p>Monitor sales, revenue, and customer insights</p>
                            </div>
                            
                            <div className="feature-card">
                                <div className="feature-icon">📦</div>
                                <h3>Product Management</h3>
                                <p>Add, edit, and manage your product catalog</p>
                            </div>
                            
                            <div className="feature-card">
                                <div className="feature-icon">🛒</div>
                                <h3>Order Management</h3>
                                <p>Track and update customer orders</p>
                            </div>
                            
                            <div className="feature-card">
                                <div className="feature-icon">👥</div>
                                <h3>User Management</h3>
                                <p>Manage customer accounts and permissions</p>
                            </div>
                            
                            <div className="feature-card">
                                <div className="feature-icon">💰</div>
                                <h3>Revenue Tracking</h3>
                                <p>Monitor earnings and financial reports</p>
                            </div>
                            
                            <div className="feature-card">
                                <div className="feature-icon">⚙️</div>
                                <h3>System Settings</h3>
                                <p>Configure store settings and preferences</p>
                            </div>
                        </div>
                        
                        <div className="admin-stats">
                            <div className="stat-item">
                                <div className="stat-icon">🏪</div>
                                <div className="stat-info">
                                    <span className="stat-label">Store Status</span>
                                    <span className="stat-value">Online</span>
                                </div>
                            </div>
                            
                            <div className="stat-item">
                                <div className="stat-icon">🔄</div>
                                <div className="stat-info">
                                    <span className="stat-label">Last Update</span>
                                    <span className="stat-value">2 mins ago</span>
                                </div>
                            </div>
                            
                            <div className="stat-item">
                                <div className="stat-icon">🛡️</div>
                                <div className="stat-info">
                                    <span className="stat-label">Security</span>
                                    <span className="stat-value">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
