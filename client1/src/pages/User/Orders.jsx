import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchOrders();
        
        // Check if redirected from successful order placement
        if (location.state?.orderPlaced) {
            toast.success(`Order #${location.state.orderId} placed successfully!`);
        }
    }, [location.state]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get('/api/orders/user', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                toast.error('Failed to load orders');
            }
        } finally {
            setLoading(false);
        }
    };

    const getFilteredOrders = () => {
        let filtered = [...orders];

        // Apply filter
        if (filter !== 'all') {
            filtered = filtered.filter(order => 
                order.status.toLowerCase().replace(' ', '_') === filter
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.orderDate) - new Date(a.orderDate);
                case 'oldest':
                    return new Date(a.orderDate) - new Date(b.orderDate);
                case 'amount_high':
                    return b.totalAmount - a.totalAmount;
                case 'amount_low':
                    return a.totalAmount - b.totalAmount;
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'pending': '#f39c12',
            'processing': '#3498db',
            'shipped': '#9b59b6',
            'delivered': '#27ae60',
            'cancelled': '#e74c3c'
        };
        return statusColors[status.toLowerCase()] || '#6c757d';
    };

    const getStatusIcon = (status) => {
        const statusIcons = {
            'pending': '⏳',
            'processing': '⚙️',
            'shipped': '🚚',
            'delivered': '✅',
            'cancelled': '❌'
        };
        return statusIcons[status.toLowerCase()] || '📦';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const cancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/orders/${orderId}/status`, 
                { status: 'Cancelled' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setOrders(orders.map(order => 
                order._id === orderId 
                    ? { ...order, status: 'Cancelled' }
                    : order
            ));
            
            toast.success('Order cancelled successfully');
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('Failed to cancel order');
        }
    };

    const reorderItems = async (order) => {
        try {
            const token = localStorage.getItem('token');
            
            // Add all items from the order to cart
            for (const item of order.items) {
                await axios.post('/api/users/cart', {
                    productId: item.product._id,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            toast.success('Items added to cart successfully!');
            navigate('/cart');
        } catch (error) {
            console.error('Error reordering items:', error);
            toast.error('Failed to add items to cart');
        }
    };

    const trackOrder = (order) => {
        setSelectedOrder(order);
    };

    const downloadInvoice = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/orders/${orderId}/invoice`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${orderId}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
            
            toast.success('Invoice downloaded successfully');
        } catch (error) {
            console.error('Error downloading invoice:', error);
            toast.error('Failed to download invoice');
        }
    };

    const getOrderProgress = (status) => {
        const progressSteps = {
            'pending': 25,
            'processing': 50,
            'shipped': 75,
            'delivered': 100,
            'cancelled': 0
        };
        return progressSteps[status.toLowerCase()] || 0;
    };

    const filteredOrders = getFilteredOrders();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your orders...</p>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="container">
                <div className="orders-header">
                    <div className="header-content">
                        <h1 className="page-title">My Orders</h1>
                        <p className="page-subtitle">Track and manage your orders</p>
                    </div>
                    
                    <div className="header-stats">
                        <div className="stat-card">
                            <span className="stat-number">{orders.length}</span>
                            <span className="stat-label">Total Orders</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">
                                {orders.filter(order => order.status === 'Delivered').length}
                            </span>
                            <span className="stat-label">Delivered</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">
                                ${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                            </span>
                            <span className="stat-label">Total Spent</span>
                        </div>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="empty-orders">
                        <div className="empty-orders-icon">📦</div>
                        <h2>No orders yet</h2>
                        <p>You haven't placed any orders. Start shopping to see your orders here!</p>
                        <div className="empty-orders-actions">
                            <button 
                                className="btn-primary"
                                onClick={() => navigate('/products')}
                            >
                                Start Shopping
                            </button>
                            <button 
                                className="btn-secondary"
                                onClick={() => navigate('/wishlist')}
                            >
                                View Wishlist
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Filters and Sorting */}
                        <div className="orders-controls">
                            <div className="filters">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">All Orders</option>
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="amount_high">Amount: High to Low</option>
                                    <option value="amount_low">Amount: Low to High</option>
                                </select>
                            </div>
                            
                            <div className="results-info">
                                Showing {filteredOrders.length} of {orders.length} orders
                            </div>
                        </div>

                        {/* Orders List */}
                        <div className="orders-list">
                            {filteredOrders.map(order => (
                                <div key={order._id} className="order-card">
                                    <div className="order-header">
                                        <div className="order-info">
                                            <h3 className="order-id">Order #{order._id.slice(-8).toUpperCase()}</h3>
                                            <p className="order-date">Placed on {formatDate(order.orderDate)}</p>
                                        </div>
                                        
                                        <div className="order-status">
                                            <span 
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(order.status) }}
                                            >
                                                <span className="status-icon">{getStatusIcon(order.status)}</span>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="order-progress">
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill"
                                                style={{ 
                                                    width: `${getOrderProgress(order.status)}%`,
                                                    backgroundColor: getStatusColor(order.status)
                                                }}
                                            ></div>
                                        </div>
                                        <div className="progress-steps">
                                            <span className={`step ${getOrderProgress(order.status) >= 25 ? 'active' : ''}`}>
                                                Placed
                                            </span>
                                            <span className={`step ${getOrderProgress(order.status) >= 50 ? 'active' : ''}`}>
                                                Processing
                                            </span>
                                            <span className={`step ${getOrderProgress(order.status) >= 75 ? 'active' : ''}`}>
                                                Shipped
                                            </span>
                                            <span className={`step ${getOrderProgress(order.status) >= 100 ? 'active' : ''}`}>
                                                Delivered
                                            </span>
                                        </div>
                                    </div>

                                    <div className="order-items">
                                        <h4>Items ({order.items.length})</h4>
                                        <div className="items-preview">
                                            {order.items.slice(0, 3).map((item, index) => (
                                                <div key={index} className="item-preview">
                                                    <img 
                                                        src={item.product.image} 
                                                        alt={item.product.name}
                                                        className="item-image"
                                                    />
                                                    <div className="item-details">
                                                        <span className="item-name">{item.product.name}</span>
                                                        <span className="item-quantity">Qty: {item.quantity}</span>
                                                        <span className="item-price">${item.price}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {order.items.length > 3 && (
                                                <div className="more-items">
                                                    +{order.items.length - 3} more items
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="order-summary">
                                        <div className="summary-row">
                                            <span>Subtotal:</span>
                                            <span>${(order.totalAmount * 0.86).toFixed(2)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Tax:</span>
                                            <span>${(order.totalAmount * 0.08).toFixed(2)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Shipping:</span>
                                            <span>${(order.totalAmount * 0.06).toFixed(2)}</span>
                                        </div>
                                        <div className="summary-row total">
                                            <span>Total:</span>
                                            <span>${order.totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="order-actions">
                                        <button 
                                            className="action-btn track-btn"
                                            onClick={() => trackOrder(order)}
                                        >
                                            <span className="btn-icon">📍</span>
                                            Track Order
                                        </button>
                                        
                                        <button 
                                            className="action-btn reorder-btn"
                                            onClick={() => reorderItems(order)}
                                        >
                                            <span className="btn-icon">🔄</span>
                                            Reorder
                                        </button>
                                        
                                        <button 
                                            className="action-btn invoice-btn"
                                            onClick={() => downloadInvoice(order._id)}
                                        >
                                            <span className="btn-icon">📄</span>
                                            Invoice
                                        </button>
                                        
                                        {(order.status === 'Pending' || order.status === 'Processing') && (
                                            <button 
                                                className="action-btn cancel-btn"
                                                onClick={() => cancelOrder(order._id)}
                                            >
                                                <span className="btn-icon">❌</span>
                                                Cancel
                                            </button>
                                        )}
                                        
                                        {order.status === 'Delivered' && (
                                            <button 
                                                className="action-btn review-btn"
                                                onClick={() => navigate(`/products/${order.items[0].product._id}`)}
                                            >
                                                <span className="btn-icon">⭐</span>
                                                Review
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Order Tracking Modal */}
                {selectedOrder && (
                    <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                        <div className="tracking-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Track Order #{selectedOrder._id.slice(-8).toUpperCase()}</h3>
                                <button 
                                    className="close-btn"
                                    onClick={() => setSelectedOrder(null)}
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="modal-body">
                                <div className="tracking-timeline">
                                    <div className={`timeline-item ${getOrderProgress(selectedOrder.status) >= 25 ? 'completed' : ''}`}>
                                        <div className="timeline-dot">📝</div>
                                        <div className="timeline-content">
                                            <h4>Order Placed</h4>
                                            <p>{formatDate(selectedOrder.orderDate)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className={`timeline-item ${getOrderProgress(selectedOrder.status) >= 50 ? 'completed' : ''}`}>
                                        <div className="timeline-dot">⚙️</div>
                                        <div className="timeline-content">
                                            <h4>Processing</h4>
                                            <p>Your order is being prepared</p>
                                        </div>
                                    </div>
                                    
                                    <div className={`timeline-item ${getOrderProgress(selectedOrder.status) >= 75 ? 'completed' : ''}`}>
                                        <div className="timeline-dot">🚚</div>
                                        <div className="timeline-content">
                                            <h4>Shipped</h4>
                                            <p>Your order is on the way</p>
                                        </div>
                                    </div>
                                    
                                    <div className={`timeline-item ${getOrderProgress(selectedOrder.status) >= 100 ? 'completed' : ''}`}>
                                        <div className="timeline-dot">✅</div>
                                        <div className="timeline-content">
                                            <h4>Delivered</h4>
                                            <p>Order delivered successfully</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="shipping-info">
                                    <h4>Shipping Address</h4>
                                    <div className="address-card">
                                        <p>{selectedOrder.shippingAddress?.street}</p>
                                        <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}</p>
                                        <p>{selectedOrder.shippingAddress?.country}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
