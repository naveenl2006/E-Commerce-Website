import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Signup.css';

const Signup = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        agreeToTerms: false
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        if (name === 'password') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*]/.test(password)) strength++;
        setPasswordStrength(strength);
    };

    const getPasswordStrengthText = () => {
        const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        return texts[passwordStrength] || 'Very Weak';
    };

    const getPasswordStrengthColor = () => {
        const colors = ['#e74c3c', '#e67e22', '#f39c12', '#27ae60', '#2ecc71'];
        return colors[passwordStrength] || '#e74c3c';
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return false;
        }
        if (!formData.email.trim()) {
            toast.error('Email is required');
            return false;
        }
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        if (!formData.agreeToTerms) {
            toast.error('Please agree to terms and conditions');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);

        try {
            const { confirmPassword, agreeToTerms, ...submitData } = formData;
            const response = await axios.post('/api/auth/signup', submitData);
            toast.success('Account created successfully!');
            onLogin(response.data.user, response.data.token);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-container">
                <div className="signup-image">
                    <div className="image-content">
                        <h2>Join the Champions!</h2>
                        <p>Create your account and start your journey to athletic excellence</p>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <div className="stat-number">10K+</div>
                                <div className="stat-label">Happy Customers</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">500+</div>
                                <div className="stat-label">Products</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">50+</div>
                                <div className="stat-label">Brands</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">99%</div>
                                <div className="stat-label">Satisfaction</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="signup-content">
                    <div className="signup-header">
                        <h1 className="signup-title">Create Account</h1>
                        <p className="signup-subtitle">Join thousands of young athletes</p>
                    </div>

                    <form onSubmit={handleSubmit} className="signup-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">Full Name</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                        placeholder="Enter your full name"
                                    />
                                    <span className="input-icon">👤</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone" className="form-label">Phone Number</label>
                                <div className="input-wrapper">
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Enter your phone number"
                                    />
                                    <span className="input-icon">📱</span>
                                </div>
                            </div>
                        </div>

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
                                    placeholder="Create a strong password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="password-strength">
                                    <div className="strength-bar">
                                        <div 
                                            className="strength-fill"
                                            style={{
                                                width: `${(passwordStrength / 5) * 100}%`,
                                                backgroundColor: getPasswordStrengthColor()
                                            }}
                                        ></div>
                                    </div>
                                    <span 
                                        className="strength-text"
                                        style={{ color: getPasswordStrengthColor() }}
                                    >
                                        {getPasswordStrengthText()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                            <div className="input-wrapper">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <span className="error-text">Passwords do not match</span>
                            )}
                        </div>

                        <div className="terms-wrapper">
                            <label className="checkbox-wrapper">
                                <input 
                                    type="checkbox" 
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleChange}
                                    className="checkbox" 
                                />
                                <span className="checkmark"></span>
                                I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            className="signup-btn"
                            disabled={loading || !formData.agreeToTerms}
                        >
                            {loading ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="signup-footer">
                        <p>Already have an account? <Link to="/login" className="login-link">Sign In</Link></p>
                    </div>

                    <div className="social-signup">
                        <div className="divider">
                            <span>or sign up with</span>
                        </div>
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
            </div>
        </div>
    );
};

export default Signup;
