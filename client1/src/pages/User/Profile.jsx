import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [showChangePassword, setShowChangePassword] = useState(false);
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India'
        }
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        smsNotifications: false,
        orderUpdates: true,
        promotionalEmails: true,
        newsletter: true
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const userData = localStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                
                // Fetch complete profile data from API
                const response = await axios.get('/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const profileInfo = response.data;
                setProfileData({
                    name: profileInfo.name || '',
                    email: profileInfo.email || '',
                    phone: profileInfo.phone || '',
                    address: {
                        street: profileInfo.address?.street || '',
                        city: profileInfo.address?.city || '',
                        state: profileInfo.address?.state || '',
                        zipCode: profileInfo.address?.zipCode || '',
                        country: profileInfo.address?.country || 'India'
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                toast.error('Failed to load profile information');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setProfileData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setProfileData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handlePreferenceChange = (e) => {
        setPreferences({
            ...preferences,
            [e.target.name]: e.target.checked
        });
    };

    const validateProfileForm = () => {
        if (!profileData.name.trim()) {
            toast.error('Name is required');
            return false;
        }
        
        if (!profileData.email.trim()) {
            toast.error('Email is required');
            return false;
        }
        
        if (!profileData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error('Please enter a valid email address');
            return false;
        }
        
        if (profileData.phone && !profileData.phone.match(/^[\+]?[\d\s\-\(\)]{10,15}$/)) {
            toast.error('Please enter a valid phone number');
            return false;
        }
        
        return true;
    };

    const validatePasswordForm = () => {
        if (!passwordData.currentPassword) {
            toast.error('Current password is required');
            return false;
        }
        
        if (passwordData.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return false;
        }
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return false;
        }
        
        return true;
    };

    const updateProfile = async () => {
        if (!validateProfileForm()) return;
        
        setUpdating(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('/api/users/profile', profileData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update local storage
            const updatedUser = { ...user, ...response.data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    const changePassword = async () => {
        if (!validatePasswordForm()) return;
        
        setUpdating(true);
        
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowChangePassword(false);
            toast.success('Password changed successfully!');
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setUpdating(false);
        }
    };

    const updatePreferences = async () => {
        setUpdating(true);
        
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/users/preferences', preferences, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success('Preferences updated successfully!');
        } catch (error) {
            console.error('Error updating preferences:', error);
            toast.error('Failed to update preferences');
        } finally {
            setUpdating(false);
        }
    };

    const deleteAccount = async () => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete your account? This action cannot be undone.'
        );
        
        if (!confirmDelete) return;
        
        const doubleConfirm = window.prompt(
            'Type "DELETE" to confirm account deletion:'
        );
        
        if (doubleConfirm !== 'DELETE') {
            toast.error('Account deletion cancelled');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete('/api/users/account', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.success('Account deleted successfully');
            navigate('/');
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error('Failed to delete account');
        }
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getMemberSince = () => {
        if (user?.createdAt) {
            return new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
            });
        }
        return 'Recently';
    };

    // Indian states list
    const indianStates = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", 
        "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", 
        "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", 
        "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
        "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
    ];

    // US states list
    const usStates = [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
        "Delaware", "Florida", "Georgia", "Illinois", "Indiana", "New York", "Texas", "Washington"
    ];

    // Get states based on selected country
    const getStatesList = () => {
        switch (profileData.address.country) {
            case 'India':
                return indianStates;
            case 'United States':
                return usStates;
            default:
                return [];
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <div className="avatar-circle">
                            {getInitials(profileData.name || 'User')}
                        </div>
                        <button className="change-avatar-btn" title="Change Avatar">
                            📷
                        </button>
                    </div>
                    
                    <div className="profile-info">
                        <h1 className="profile-name">{profileData.name || 'User'}</h1>
                        <p className="profile-email">{profileData.email}</p>
                        <p className="member-since">Member since {getMemberSince()}</p>
                        <div className="profile-badges">
                            <span className="badge verified">✅ Verified</span>
                            <span className="badge member">👑 Premium Member</span>
                        </div>
                    </div>
                    
                    <div className="profile-stats">
                        <div className="stat">
                            <span className="stat-number">0</span>
                            <span className="stat-label">Orders</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">0</span>
                            <span className="stat-label">Wishlist</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">0</span>
                            <span className="stat-label">Reviews</span>
                        </div>
                    </div>
                </div>

                <div className="profile-content">
                    <div className="profile-tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                            onClick={() => setActiveTab('personal')}
                        >
                            <span className="tab-icon">👤</span>
                            Personal Info
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <span className="tab-icon">🔒</span>
                            Security
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
                            onClick={() => setActiveTab('preferences')}
                        >
                            <span className="tab-icon">⚙️</span>
                            Preferences
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'danger' ? 'active' : ''}`}
                            onClick={() => setActiveTab('danger')}
                        >
                            <span className="tab-icon">⚠️</span>
                            Account
                        </button>
                    </div>

                    <div className="tab-content">
                        {/* Personal Information Tab */}
                        {activeTab === 'personal' && (
                            <div className="tab-panel personal-panel">
                                <h2 className="panel-title">Personal Information</h2>
                                
                                <div className="form-section">
                                    <h3 className="section-title">Basic Details</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={profileData.name}
                                                onChange={handleProfileChange}
                                                className="form-input"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label className="form-label">Email Address *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={profileData.email}
                                                onChange={handleProfileChange}
                                                className="form-input"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label className="form-label">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={profileData.phone}
                                                onChange={handleProfileChange}
                                                className="form-input"
                                                placeholder="Enter your phone number"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h3 className="section-title">Address Information</h3>
                                    <div className="form-grid">
                                        <div className="form-group full-width">
                                            <label className="form-label">Street Address</label>
                                            <input
                                                type="text"
                                                name="address.street"
                                                value={profileData.address.street}
                                                onChange={handleProfileChange}
                                                className="form-input"
                                                placeholder="123 Main Street, Apt 4B"
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label className="form-label">City</label>
                                            <input
                                                type="text"
                                                name="address.city"
                                                value={profileData.address.city}
                                                onChange={handleProfileChange}
                                                className="form-input"
                                                placeholder="City"
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label className="form-label">Country</label>
                                            <select
                                                name="address.country"
                                                value={profileData.address.country}
                                                onChange={handleProfileChange}
                                                className="form-select"
                                            >
                                                <option value="India">India</option>
                                                <option value="United States">United States</option>
                                                <option value="Canada">Canada</option>
                                            </select>
                                        </div>
                                        
                                        <div className="form-group">
                                            <label className="form-label">State</label>
                                            <select
                                                name="address.state"
                                                value={profileData.address.state}
                                                onChange={handleProfileChange}
                                                className="form-select"
                                            >
                                                <option value="">Select State</option>
                                                {getStatesList().map(state => (
                                                    <option key={state} value={state}>{state}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div className="form-group">
                                            <label className="form-label">ZIP/Postal Code</label>
                                            <input
                                                type="text"
                                                name="address.zipCode"
                                                value={profileData.address.zipCode}
                                                onChange={handleProfileChange}
                                                className="form-input"
                                                placeholder={profileData.address.country === 'India' ? '110001' : '12345'}
                                                maxLength="10"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-actions">
                                        <button 
                                            className="btn-primary"
                                            onClick={updateProfile}
                                            disabled={updating}
                                        >
                                            {updating ? (
                                                <>
                                                    <span className="btn-spinner"></span>
                                                    Updating...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="tab-panel security-panel">
                                <h2 className="panel-title">Security Settings</h2>
                                
                                <div className="security-section">
                                    <div className="security-item">
                                        <div className="security-info">
                                            <h3>Password</h3>
                                            <p>Change your password regularly to keep your account secure</p>
                                        </div>
                                        <button 
                                            className="btn-secondary"
                                            onClick={() => setShowChangePassword(!showChangePassword)}
                                        >
                                            {showChangePassword ? 'Cancel' : 'Change Password'}
                                        </button>
                                    </div>
                                    
                                    {showChangePassword && (
                                        <div className="password-form">
                                            <div className="form-group">
                                                <label className="form-label">Current Password</label>
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    className="form-input"
                                                    placeholder="Enter current password"
                                                />
                                            </div>
                                            
                                            <div className="form-group">
                                                <label className="form-label">New Password</label>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    className="form-input"
                                                    placeholder="Enter new password"
                                                />
                                            </div>
                                            
                                            <div className="form-group">
                                                <label className="form-label">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    className="form-input"
                                                    placeholder="Confirm new password"
                                                />
                                            </div>
                                            
                                            <div className="form-actions">
                                                <button 
                                                    className="btn-primary"
                                                    onClick={changePassword}
                                                    disabled={updating}
                                                >
                                                    {updating ? (
                                                        <>
                                                            <span className="btn-spinner"></span>
                                                            Changing...
                                                        </>
                                                    ) : (
                                                        'Change Password'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="security-section">
                                    <div className="security-item">
                                        <div className="security-info">
                                            <h3>Two-Factor Authentication</h3>
                                            <p>Add an extra layer of security to your account</p>
                                        </div>
                                        <button className="btn-secondary" disabled>
                                            Coming Soon
                                        </button>
                                    </div>
                                </div>

                                <div className="security-section">
                                    <div className="security-item">
                                        <div className="security-info">
                                            <h3>Login History</h3>
                                            <p>View your recent login activity</p>
                                        </div>
                                        <button className="btn-secondary" disabled>
                                            View History
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <div className="tab-panel preferences-panel">
                                <h2 className="panel-title">Notification Preferences</h2>
                                
                                <div className="preferences-section">
                                    <h3 className="section-title">Email Notifications</h3>
                                    <div className="preference-items">
                                        <div className="preference-item">
                                            <div className="preference-info">
                                                <h4>Order Updates</h4>
                                                <p>Receive notifications about your order status</p>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    name="orderUpdates"
                                                    checked={preferences.orderUpdates}
                                                    onChange={handlePreferenceChange}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                        
                                        <div className="preference-item">
                                            <div className="preference-info">
                                                <h4>Promotional Emails</h4>
                                                <p>Get notified about sales, discounts, and new products</p>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    name="promotionalEmails"
                                                    checked={preferences.promotionalEmails}
                                                    onChange={handlePreferenceChange}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                        
                                        <div className="preference-item">
                                            <div className="preference-info">
                                                <h4>Newsletter</h4>
                                                <p>Subscribe to our weekly newsletter</p>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    name="newsletter"
                                                    checked={preferences.newsletter}
                                                    onChange={handlePreferenceChange}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="preferences-section">
                                    <h3 className="section-title">SMS Notifications</h3>
                                    <div className="preference-items">
                                        <div className="preference-item">
                                            <div className="preference-info">
                                                <h4>SMS Notifications</h4>
                                                <p>Receive SMS updates for important notifications</p>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    name="smsNotifications"
                                                    checked={preferences.smsNotifications}
                                                    onChange={handlePreferenceChange}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div className="form-actions">
                                        <button 
                                            className="btn-primary"
                                            onClick={updatePreferences}
                                            disabled={updating}
                                        >
                                            {updating ? (
                                                <>
                                                    <span className="btn-spinner"></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Preferences'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Danger Zone Tab */}
                        {activeTab === 'danger' && (
                            <div className="tab-panel danger-panel">
                                <h2 className="panel-title">Account Management</h2>
                                
                                <div className="danger-section">
                                    <div className="danger-item">
                                        <div className="danger-info">
                                            <h3>Export Account Data</h3>
                                            <p>Download a copy of your account data including orders, wishlist, and profile information</p>
                                        </div>
                                        <button className="btn-secondary">
                                            Export Data
                                        </button>
                                    </div>
                                </div>

                                <div className="danger-section">
                                    <div className="danger-item">
                                        <div className="danger-info">
                                            <h3>Deactivate Account</h3>
                                            <p>Temporarily deactivate your account. You can reactivate it anytime by logging in.</p>
                                        </div>
                                        <button className="btn-warning" disabled>
                                            Deactivate
                                        </button>
                                    </div>
                                </div>

                                <div className="danger-section danger-zone">
                                    <div className="danger-item">
                                        <div className="danger-info">
                                            <h3>Delete Account</h3>
                                            <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                                        </div>
                                        <button 
                                            className="btn-danger"
                                            onClick={deleteAccount}
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
