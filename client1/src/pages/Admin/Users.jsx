import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Users.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        joinedDate: 'all',
        sortBy: 'newest'
    });
    const [userStats, setUserStats] = useState({
        total: 0,
        active: 0,
        newThisMonth: 0,
        totalOrders: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        applyFilters();
        calculateStats();
    }, [users, filters]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            const response = await axios.get('/api/users/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Filter out admin users
            const regularUsers = response.data.filter(user => !user.isAdmin);
            setUsers(regularUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/admin/login');
            } else {
                toast.error('Failed to load users');
            }
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...users];

        // Search filter
        if (filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(user =>
                user.name?.toLowerCase().includes(searchTerm) ||
                user.email?.toLowerCase().includes(searchTerm) ||
                user.phone?.toLowerCase().includes(searchTerm)
            );
        }

        // Status filter (for future use - active/inactive users)
        if (filters.status !== 'all') {
            // This would filter by user status if implemented
            // filtered = filtered.filter(user => user.status === filters.status);
        }

        // Joined date filter
        if (filters.joinedDate !== 'all') {
            const now = new Date();
            const dateRanges = {
                'week': 7,
                'month': 30,
                '3months': 90,
                '6months': 180,
                'year': 365
            };

            if (dateRanges[filters.joinedDate]) {
                const cutoffDate = new Date(now.getTime() - dateRanges[filters.joinedDate] * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(user => new Date(user.createdAt) >= cutoffDate);
            }
        }

        // Sort users
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'email':
                    return (a.email || '').localeCompare(b.email || '');
                default:
                    return 0;
            }
        });

        setFilteredUsers(filtered);
    };

    const calculateStats = () => {
        const total = users.length;
        const active = users.length; // All users are considered active for now
        
        const now = new Date();
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const newThisMonth = users.filter(user => 
            new Date(user.createdAt) >= monthAgo
        ).length;

        setUserStats({
            total,
            active,
            newThisMonth,
            totalOrders: 0 // This would come from orders API
        });
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const exportUsers = () => {
        const csvData = filteredUsers.map(user => ({
            'User ID': user._id,
            'Name': user.name || 'N/A',
            'Email': user.email,
            'Phone': user.phone || 'N/A',
            'Join Date': new Date(user.createdAt).toLocaleDateString(),
            'Address': user.address ? 
                `${user.address.street || ''}, ${user.address.city || ''}, ${user.address.state || ''} ${user.address.zipCode || ''}`.trim() : 
                'N/A'
        }));

        const csvContent = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).map(val => 
                typeof val === 'string' && val.includes(',') ? `"${val}"` : val
            ).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        toast.success('Users exported successfully');
    };

    const viewUserDetails = (user) => {
        setSelectedUser(user);
    };

    const sendEmailToUser = (user) => {
        const subject = encodeURIComponent('Message from BoySports Admin');
        const body = encodeURIComponent(`Dear ${user.name || 'Customer'},\n\n\n\nBest regards,\nBoySports Team`);
        window.open(`mailto:${user.email}?subject=${subject}&body=${body}`);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
        return `${Math.ceil(diffDays / 365)} years ago`;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className="users-page">
            <div className="container">
                <div className="users-header">
                    <div className="header-content">
                        <h1 className="page-title">User Management</h1>
                        <p className="page-subtitle">Manage and view all registered users</p>
                    </div>
                    
                    <div className="header-actions">
                        <button 
                            className="export-btn"
                            onClick={exportUsers}
                            disabled={filteredUsers.length === 0}
                        >
                            <span className="btn-icon">📊</span>
                            Export CSV
                        </button>
                        
                        <button 
                            className="refresh-btn"
                            onClick={fetchUsers}
                        >
                            <span className="btn-icon">🔄</span>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* User Statistics */}
                <div className="user-stats">
                    <div className="stat-card total">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>Total Users</h3>
                            <div className="stat-value">{userStats.total}</div>
                        </div>
                    </div>

                    <div className="stat-card active">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>Active Users</h3>
                            <div className="stat-value">{userStats.active}</div>
                        </div>
                    </div>

                    <div className="stat-card new">
                        <div className="stat-icon">🆕</div>
                        <div className="stat-content">
                            <h3>New This Month</h3>
                            <div className="stat-value">{userStats.newThisMonth}</div>
                        </div>
                    </div>

                    <div className="stat-card growth">
                        <div className="stat-icon">📈</div>
                        <div className="stat-content">
                            <h3>Growth Rate</h3>
                            <div className="stat-value">
                                {userStats.total > 0 ? 
                                    `${Math.round((userStats.newThisMonth / userStats.total) * 100)}%` : 
                                    '0%'
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="users-filters">
                    <div className="filters-row">
                        <div className="search-filter">
                            <input
                                type="text"
                                placeholder="Search users by name, email, or phone..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="search-input"
                            />
                            <span className="search-icon">🔍</span>
                        </div>

                        <select
                            value={filters.joinedDate}
                            onChange={(e) => handleFilterChange('joinedDate', e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Time</option>
                            <option value="week">Last Week</option>
                            <option value="month">Last Month</option>
                            <option value="3months">Last 3 Months</option>
                            <option value="6months">Last 6 Months</option>
                            <option value="year">Last Year</option>
                        </select>

                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            className="filter-select"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="name">Sort by Name</option>
                            <option value="email">Sort by Email</option>
                        </select>
                    </div>

                    <div className="results-info">
                        Showing {filteredUsers.length} of {users.length} users
                    </div>
                </div>

                {/* Users Grid */}
                <div className="users-container">
                    {filteredUsers.length === 0 ? (
                        <div className="empty-users">
                            <div className="empty-icon">👥</div>
                            <h3>No users found</h3>
                            <p>No users match your current filters.</p>
                        </div>
                    ) : (
                        <div className="users-grid">
                            {filteredUsers.map(user => (
                                <div key={user._id} className="user-card">
                                    <div className="user-card-header">
                                        <div className="user-avatar">
                                            {getInitials(user.name)}
                                        </div>
                                        <div className="user-status online"></div>
                                    </div>

                                    <div className="user-card-body">
                                        <h3 className="user-name">{user.name || 'No Name'}</h3>
                                        <p className="user-email">{user.email}</p>
                                        
                                        {user.phone && (
                                            <p className="user-phone">📱 {user.phone}</p>
                                        )}

                                        <div className="user-meta">
                                            <div className="meta-item">
                                                <span className="meta-label">Joined:</span>
                                                <span className="meta-value">{formatDate(user.createdAt)}</span>
                                            </div>
                                            
                                            <div className="meta-item">
                                                <span className="meta-label">Active:</span>
                                                <span className="meta-value">{getTimeAgo(user.createdAt)}</span>
                                            </div>

                                            {user.address && user.address.city && (
                                                <div className="meta-item">
                                                    <span className="meta-label">Location:</span>
                                                    <span className="meta-value">
                                                        {user.address.city}, {user.address.state}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="user-tags">
                                            <span className="user-tag customer">Customer</span>
                                            {userStats.newThisMonth && 
                                             new Date(user.createdAt) >= new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()) && (
                                                <span className="user-tag new">New</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="user-card-actions">
                                        <button
                                            onClick={() => viewUserDetails(user)}
                                            className="action-btn view-btn"
                                            title="View Details"
                                        >
                                            <span className="btn-icon">👁️</span>
                                            View Details
                                        </button>
                                        
                                        <button
                                            onClick={() => sendEmailToUser(user)}
                                            className="action-btn email-btn"
                                            title="Send Email"
                                        >
                                            <span className="btn-icon">✉️</span>
                                            Email
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* User Details Modal */}
                {selectedUser && (
                    <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                        <div className="user-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="modal-title">
                                    <div className="modal-avatar">
                                        {getInitials(selectedUser.name)}
                                    </div>
                                    <div>
                                        <h3>{selectedUser.name || 'No Name'}</h3>
                                        <p>{selectedUser.email}</p>
                                    </div>
                                </div>
                                <button 
                                    className="close-btn"
                                    onClick={() => setSelectedUser(null)}
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="modal-body">
                                <div className="user-details-grid">
                                    <div className="detail-section">
                                        <h4>Personal Information</h4>
                                        <div className="detail-item">
                                            <span className="detail-label">Full Name:</span>
                                            <span className="detail-value">{selectedUser.name || 'Not provided'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Email:</span>
                                            <span className="detail-value">{selectedUser.email}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Phone:</span>
                                            <span className="detail-value">{selectedUser.phone || 'Not provided'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">User ID:</span>
                                            <span className="detail-value user-id">{selectedUser._id}</span>
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>Account Information</h4>
                                        <div className="detail-item">
                                            <span className="detail-label">Join Date:</span>
                                            <span className="detail-value">{formatDate(selectedUser.createdAt)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Last Updated:</span>
                                            <span className="detail-value">{formatDate(selectedUser.updatedAt || selectedUser.createdAt)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Account Status:</span>
                                            <span className="detail-value">
                                                <span className="status-badge active">Active</span>
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Account Type:</span>
                                            <span className="detail-value">Customer</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedUser.address && (
                                    <div className="detail-section full-width">
                                        <h4>Address Information</h4>
                                        <div className="address-details">
                                            {selectedUser.address.street && (
                                                <p><strong>Street:</strong> {selectedUser.address.street}</p>
                                            )}
                                            {selectedUser.address.city && (
                                                <p><strong>City:</strong> {selectedUser.address.city}</p>
                                            )}
                                            {selectedUser.address.state && (
                                                <p><strong>State:</strong> {selectedUser.address.state}</p>
                                            )}
                                            {selectedUser.address.zipCode && (
                                                <p><strong>ZIP Code:</strong> {selectedUser.address.zipCode}</p>
                                            )}
                                            {selectedUser.address.country && (
                                                <p><strong>Country:</strong> {selectedUser.address.country}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="modal-actions">
                                    <button
                                        onClick={() => sendEmailToUser(selectedUser)}
                                        className="modal-action-btn email-btn"
                                    >
                                        <span className="btn-icon">✉️</span>
                                        Send Email
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedUser._id);
                                            toast.success('User ID copied to clipboard');
                                        }}
                                        className="modal-action-btn copy-btn"
                                    >
                                        <span className="btn-icon">📋</span>
                                        Copy ID
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;
