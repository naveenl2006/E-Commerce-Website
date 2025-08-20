import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEdit, FaSearch, FaFilter, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './AllOrders.css';

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchTerm, statusFilter, sortBy]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.get('/api/orders/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin/login');
      } else {
        toast.error('Error loading orders');
      }
      setLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = orders.filter(order => {
      const matchesSearch = 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => 
          item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt);
        case 'oldest':
          return new Date(a.orderDate || a.createdAt) - new Date(b.orderDate || b.createdAt);
        case 'highest':
          return b.totalAmount - a.totalAmount;
        case 'lowest':
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (updating) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`/api/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setOrders(prev => prev.map(order =>
        order._id === orderId ? { ...order, status: newStatus } : order
      ));

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error updating order status');
    } finally {
      setUpdating(false);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
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

  const exportOrders = () => {
    const csvData = filteredOrders.map(order => ({
      'Order ID': order._id,
      'Customer Name': order.user?.name || 'Unknown',
      'Customer Email': order.user?.email || 'Unknown',
      'Status': order.status,
      'Total Amount': order.totalAmount,
      'Order Date': new Date(order.orderDate || order.createdAt).toLocaleDateString(),
      'Items Count': order.items?.length || 0,
      'Payment Method': order.paymentMethod || 'Unknown'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Orders exported successfully');
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f39c12',
      'processing': '#3498db',
      'shipped': '#9b59b6',
      'delivered': '#27ae60',
      'cancelled': '#e74c3c'
    };
    return colors[status.toLowerCase()] || '#6c757d';
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="all-orders-page">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="all-orders-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1>All Orders</h1>
            <p>Manage and track all customer orders</p>
          </div>
          <div className="header-actions">
            <button 
              className="export-btn"
              onClick={exportOrders}
              disabled={filteredOrders.length === 0}
            >
              <FaDownload />
              Export CSV
            </button>
            <button className="refresh-btn" onClick={fetchOrders}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Order Statistics */}
        <div className="orders-stats">
          <div className="stat-card total">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Total Orders</h3>
              <div className="stat-value">{filteredOrders.length}</div>
            </div>
          </div>

          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <div className="stat-value">
                {formatCurrency(filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0))}
              </div>
            </div>
          </div>

          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>Pending Orders</h3>
              <div className="stat-value">
                {filteredOrders.filter(order => order.status.toLowerCase() === 'pending').length}
              </div>
            </div>
          </div>

          <div className="stat-card processing">
            <div className="stat-icon">⚙️</div>
            <div className="stat-content">
              <h3>Processing Orders</h3>
              <div className="stat-value">
                {filteredOrders.filter(order => order.status.toLowerCase() === 'processing').length}
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="orders-controls">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search orders by ID, customer name, email, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
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
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="orders-table-container">
          {filteredOrders.length > 0 ? (
            <div className="orders-table">
              <div className="table-header">
                <span>Order ID</span>
                <span>Customer</span>
                <span>Items</span>
                <span>Total</span>
                <span>Status</span>
                <span>Date</span>
                <span>Actions</span>
              </div>

              {filteredOrders.map(order => (
                <div key={order._id} className="table-row">
                  <span className="order-id">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                  
                  <div className="customer-info">
                    <div className="customer-name">{order.user?.name || 'Unknown Customer'}</div>
                    <div className="customer-email">{order.user?.email || 'No email'}</div>
                  </div>

                  <div className="order-items">
                    <div className="items-count">{order.items?.length || 0} items</div>
                    <div className="items-preview">
                      {order.items?.slice(0, 2).map((item, index) => (
                        <span key={index} className="item-name">
                          {item.product?.name || 'Unknown Product'}
                        </span>
                      ))}
                      {order.items?.length > 2 && (
                        <span className="more-items">+{order.items.length - 2} more</span>
                      )}
                    </div>
                  </div>

                  <span className="order-total">
                    {formatCurrency(order.totalAmount)}
                  </span>

                  <div className="status-column">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className={`status-select ${getStatusClass(order.status)}`}
                      disabled={updating}
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      <option value="Pending">⏳ Pending</option>
                      <option value="Processing">⚙️ Processing</option>
                      <option value="Shipped">🚚 Shipped</option>
                      <option value="Delivered">✅ Delivered</option>
                      <option value="Cancelled">❌ Cancelled</option>
                    </select>
                  </div>

                  <span className="order-date">
                    {formatDate(order.orderDate || order.createdAt)}
                  </span>

                  <div className="actions">
                    <button 
                      className="action-btn view" 
                      title="View Details"
                      onClick={() => viewOrderDetails(order)}
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="action-btn download" 
                      title="Download Invoice"
                      onClick={() => downloadInvoice(order._id)}
                    >
                      <FaDownload />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-orders">
              <div className="no-orders-icon">📦</div>
              <h3>No orders found</h3>
              <p>
                {orders.length === 0 
                  ? "No orders have been placed yet." 
                  : "No orders match your search criteria."
                }
              </p>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="order-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Order Details #{selectedOrder._id.slice(-8).toUpperCase()}</h3>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="order-details-grid">
                  <div className="detail-section">
                    <h4>Customer Information</h4>
                    <p><strong>Name:</strong> {selectedOrder.user?.name || 'Unknown'}</p>
                    <p><strong>Email:</strong> {selectedOrder.user?.email || 'Unknown'}</p>
                    <p><strong>Order Date:</strong> {formatDate(selectedOrder.orderDate || selectedOrder.createdAt)}</p>
                    <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'Unknown'}</p>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Shipping Address</h4>
                    <div className="address-info">
                      <p>{selectedOrder.shippingAddress?.street}</p>
                      <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}</p>
                      <p>{selectedOrder.shippingAddress?.country}</p>
                    </div>
                  </div>
                </div>
                
                <div className="order-items-section">
                  <h4>Order Items</h4>
                  <div className="modal-items-list">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="modal-item">
                        <img 
                          src={item.product?.image || '/placeholder-image.jpg'} 
                          alt={item.product?.name || 'Product'}
                          className="modal-item-image"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                        <div className="modal-item-details">
                          <h5>{item.product?.name || 'Unknown Product'}</h5>
                          <p>Size: {item.size || 'N/A'} | Color: {item.color || 'N/A'}</p>
                          <p>Quantity: {item.quantity} × {formatCurrency(item.price || 0)}</p>
                        </div>
                        <div className="modal-item-total">
                          {formatCurrency((item.price || 0) * item.quantity)}
                        </div>
                      </div>
                    )) || <p>No items found</p>}
                  </div>
                  
                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedOrder.totalAmount * 0.86)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Tax:</span>
                      <span>{formatCurrency(selectedOrder.totalAmount * 0.08)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping:</span>
                      <span>{formatCurrency(selectedOrder.totalAmount * 0.06)}</span>
                    </div>
                    <div className="summary-row total-row">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
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

export default AllOrders;
