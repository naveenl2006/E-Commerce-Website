import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        recentOrders: [],
        topProducts: [],
        revenueData: [],
        userGrowth: []
    });
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('7days');
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, [selectedPeriod]);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            // Simulate API calls - Replace with actual endpoints
            const [usersRes, ordersRes, productsRes] = await Promise.all([
                axios.get('/api/users/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/orders/admin', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/products', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const orders = ordersRes.data;
            const users = usersRes.data;
            const products = productsRes.data;

            const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
            const pendingOrders = orders.filter(order => order.status === 'Pending').length;
            const recentOrders = orders.slice(0, 5);

            // Mock data for charts - Replace with actual calculations
            const revenueData = generateMockRevenueData(selectedPeriod);
            const userGrowth = generateMockUserGrowth(selectedPeriod);
            const topProducts = generateTopProducts(products, orders);

            setStats({
                totalUsers: users.length,
                totalOrders: orders.length,
                totalProducts: products.length,
                totalRevenue,
                pendingOrders,
                recentOrders,
                topProducts,
                revenueData,
                userGrowth
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/admin/login');
            } else {
                toast.error('Failed to load dashboard data');
            }
        } finally {
            setLoading(false);
        }
    };

    const generateMockRevenueData = (period) => {
        const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: Math.floor(Math.random() * 1000) + 200
            });
        }
        return data;
    };

    const generateMockUserGrowth = (period) => {
        const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                users: Math.floor(Math.random() * 20) + 5
            });
        }
        return data;
    };

    const generateTopProducts = (products, orders) => {
        const productSales = {};
        
        orders.forEach(order => {
            order.items.forEach(item => {
                const productId = item.product._id || item.product;
                if (productSales[productId]) {
                    productSales[productId].quantity += item.quantity;
                    productSales[productId].revenue += item.price * item.quantity;
                } else {
                    const product = products.find(p => p._id === productId);
                    if (product) {
                        productSales[productId] = {
                            ...product,
                            quantity: item.quantity,
                            revenue: item.price * item.quantity
                        };
                    }
                }
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': '#f39c12',
            'Processing': '#3498db',
            'Shipped': '#9b59b6',
            'Delivered': '#27ae60',
            'Cancelled': '#e74c3c'
        };
        return colors[status] || '#6c757d';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getGrowthPercentage = (current, previous) => {
        if (previous === 0) return 100;
        return ((current - previous) / previous * 100).toFixed(1);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-header">
                    <div className="header-content">
                        <h1 className="page-title">Admin Dashboard</h1>
                        <p className="page-subtitle">Welcome back! Here's what's happening with your store.</p>
                    </div>
                    
                    <div className="header-actions">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="period-select"
                        >
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                        </select>
                        
                        <button className="refresh-btn" onClick={fetchDashboardData}>
                            <span className="refresh-icon">🔄</span>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card revenue-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <h3>Total Revenue</h3>
                            <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
                            <div className="stat-change positive">
                                <span className="change-icon">📈</span>
                                +12.5% from last period
                            </div>
                        </div>
                    </div>

                    <div className="stat-card orders-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-content">
                            <h3>Total Orders</h3>
                            <div className="stat-value">{stats.totalOrders}</div>
                            <div className="stat-change positive">
                                <span className="change-icon">📈</span>
                                +8.2% from last period
                            </div>
                        </div>
                    </div>

                    <div className="stat-card users-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>Total Users</h3>
                            <div className="stat-value">{stats.totalUsers}</div>
                            <div className="stat-change positive">
                                <span className="change-icon">📈</span>
                                +15.3% from last period
                            </div>
                        </div>
                    </div>

                    <div className="stat-card products-card">
                        <div className="stat-icon">🏷️</div>
                        <div className="stat-content">
                            <h3>Total Products</h3>
                            <div className="stat-value">{stats.totalProducts}</div>
                            <div className="stat-change">
                                <span className="change-icon">➡️</span>
                                No change
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts and Tables */}
                <div className="dashboard-content">
                    <div className="left-column">
                        {/* Revenue Chart */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>Revenue Overview</h3>
                                <div className="chart-legend">
                                    <span className="legend-item">
                                        <span className="legend-color revenue-color"></span>
                                        Revenue
                                    </span>
                                </div>
                            </div>
                            <div className="chart-container">
                                <div className="simple-chart">
                                    {stats.revenueData.map((data, index) => (
                                        <div 
                                            key={index} 
                                            className="chart-bar"
                                            style={{ 
                                                height: `${(data.revenue / Math.max(...stats.revenueData.map(d => d.revenue))) * 100}%` 
                                            }}
                                            title={`${data.date}: ${formatCurrency(data.revenue)}`}
                                        >
                                            <div className="bar-value">{formatCurrency(data.revenue)}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="chart-labels">
                                    {stats.revenueData.map((data, index) => (
                                        <span key={index} className="chart-label">{data.date}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>Recent Orders</h3>
                                <Link to="/admin/orders" className="view-all-link">
                                    View All →
                                </Link>
                            </div>
                            <div className="orders-table">
                                {stats.recentOrders.length === 0 ? (
                                    <div className="empty-state">
                                        <span className="empty-icon">📦</span>
                                        <p>No recent orders</p>
                                    </div>
                                ) : (
                                    <div className="table-content">
                                        <div className="table-header">
                                            <span>Order ID</span>
                                            <span>Customer</span>
                                            <span>Status</span>
                                            <span>Amount</span>
                                            <span>Date</span>
                                        </div>
                                        {stats.recentOrders.map(order => (
                                            <div key={order._id} className="table-row">
                                                <span className="order-id">
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </span>
                                                <span className="customer-name">
                                                    {order.user?.name || 'Unknown'}
                                                </span>
                                                <span className="order-status">
                                                    <span 
                                                        className="status-badge"
                                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </span>
                                                <span className="order-amount">
                                                    {formatCurrency(order.totalAmount)}
                                                </span>
                                                <span className="order-date">
                                                    {formatDate(order.orderDate)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="right-column">
                        {/* Quick Actions */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>Quick Actions</h3>
                            </div>
                            <div className="quick-actions">
                                <Link to="/admin/add-product" className="action-btn add-product">
                                    <span className="action-icon">➕</span>
                                    <span className="action-text">Add Product</span>
                                </Link>
                                
                                <Link to="/admin/orders" className="action-btn manage-orders">
                                    <span className="action-icon">📋</span>
                                    <span className="action-text">Manage Orders</span>
                                </Link>
                                
                                <Link to="/admin/users" className="action-btn view-users">
                                    <span className="action-icon">👤</span>
                                    <span className="action-text">View Users</span>
                                </Link>
                                
                                <button className="action-btn export-data">
                                    <span className="action-icon">📊</span>
                                    <span className="action-text">Export Data</span>
                                </button>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>Top Selling Products</h3>
                            </div>
                            <div className="top-products">
                                {stats.topProducts.length === 0 ? (
                                    <div className="empty-state">
                                        <span className="empty-icon">🏷️</span>
                                        <p>No product sales data</p>
                                    </div>
                                ) : (
                                    stats.topProducts.map((product, index) => (
                                        <div key={product._id} className="product-item">
                                            <div className="product-rank">#{index + 1}</div>
                                            <img 
                                                src={product.image} 
                                                alt={product.name}
                                                className="product-image"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/50x50/667eea/ffffff?text=P';
                                                }}
                                            />
                                            <div className="product-details">
                                                <h4 className="product-name">{product.name}</h4>
                                                <p className="product-stats">
                                                    {product.quantity} sold • {formatCurrency(product.revenue)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>System Status</h3>
                            </div>
                            <div className="system-status">
                                <div className="status-item">
                                    <div className="status-indicator online"></div>
                                    <div className="status-info">
                                        <span className="status-label">Website</span>
                                        <span className="status-value">Online</span>
                                    </div>
                                </div>
                                
                                <div className="status-item">
                                    <div className="status-indicator online"></div>
                                    <div className="status-info">
                                        <span className="status-label">Database</span>
                                        <span className="status-value">Connected</span>
                                    </div>
                                </div>
                                
                                <div className="status-item">
                                    <div className="status-indicator warning"></div>
                                    <div className="status-info">
                                        <span className="status-label">Pending Orders</span>
                                        <span className="status-value">{stats.pendingOrders}</span>
                                    </div>
                                </div>
                                
                                <div className="status-item">
                                    <div className="status-indicator online"></div>
                                    <div className="status-info">
                                        <span className="status-label">Payment Gateway</span>
                                        <span className="status-value">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
