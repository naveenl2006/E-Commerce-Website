import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get('/api/users/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                toast.error('Failed to load cart items');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
            return;
        }

        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            
            // Find the item to get product info
            const item = cartItems.find(item => item._id === itemId);
            if (!item) return;

            // Update cart via API call (you'll need to create this endpoint)
            await axios.put(`/api/users/cart/${itemId}`, 
                { 
                    productId: item.product._id,
                    quantity: newQuantity,
                    size: item.size,
                    color: item.color
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Update local state
            setCartItems(items =>
                items.map(item =>
                    item._id === itemId ? { ...item, quantity: newQuantity } : item
                )
            );
            
            toast.success('Quantity updated');
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Failed to update quantity');
        } finally {
            setUpdating(false);
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/users/cart/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setCartItems(items => items.filter(item => item._id !== itemId));
            toast.success('Item removed from cart');
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Failed to remove item');
        }
    };

    const clearCart = async () => {
        if (!window.confirm('Are you sure you want to clear your cart?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete('/api/users/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setCartItems([]);
            toast.success('Cart cleared');
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error('Failed to clear cart');
        }
    };

    const moveToWishlist = async (item) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/users/wishlist', 
                { productId: item.product._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            await removeFromCart(item._id);
            toast.success('Item moved to wishlist');
        } catch (error) {
            console.error('Error moving to wishlist:', error);
            toast.error('Failed to move to wishlist');
        }
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => 
            total + (item.product.price * item.quantity), 0
        ).toFixed(2);
    };

    const calculateTax = (subtotal) => {
        return (subtotal * 0.08).toFixed(2); // 8% tax
    };

    const calculateShipping = (subtotal) => {
        return subtotal >= 50 ? 0 : 9.99;
    };

    const calculateTotal = () => {
        const subtotal = parseFloat(calculateSubtotal());
        const tax = parseFloat(calculateTax(subtotal));
        const shipping = calculateShipping(subtotal);
        return (subtotal + tax + shipping).toFixed(2);
    };

    const proceedToCheckout = () => {
        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }
        navigate('/checkout');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your cart...</p>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <div className="cart-header">
                    <h1 className="page-title">Shopping Cart</h1>
                    <div className="cart-breadcrumb">
                        <Link to="/" className="breadcrumb-link">Home</Link>
                        <span className="breadcrumb-separator"></span>
                        <Link to="/products" className="breadcrumb-link">Products</Link>
                        <span className="breadcrumb-separator"></span>
                        <span className="breadcrumb-current">Cart</span>
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <div className="empty-cart-icon">🛒</div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added any items to your cart yet.</p>
                        <div className="empty-cart-actions">
                            <Link to="/products" className="btn-primary">
                                Continue Shopping
                            </Link>
                            <Link to="/wishlist" className="btn-secondary">
                                Check Wishlist
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="cart-content">
                        <div className="cart-items">
                            <div className="cart-items-header">
                                <h2>Cart Items ({cartItems.length})</h2>
                                <button 
                                    className="clear-cart-btn"
                                    onClick={clearCart}
                                >
                                    Clear Cart
                                </button>
                            </div>

                            <div className="items-list">
                                {cartItems.map(item => (
                                    <div key={item._id} className="cart-item">
                                        <div className="item-image">
                                            <img 
                                                src={item.product.image} 
                                                alt={item.product.name}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/150x150/667eea/ffffff?text=Product';
                                                }}
                                            />
                                            {item.product.stock <= 5 && (
                                                <div className="stock-badge">Only {item.product.stock} left!</div>
                                            )}
                                        </div>

                                        <div className="item-details">
                                            <h3 className="item-name">{item.product.name}</h3>
                                            <p className="item-brand">{item.product.brand}</p>
                                            <p className="item-category">{item.product.category}</p>
                                            <div className="item-options">
                                                <span className="option">
                                                    <span className="option-label">Size:</span> 
                                                    <span className="option-value">{item.size}</span>
                                                </span>
                                                <span className="option">
                                                    <span className="option-label">Color:</span> 
                                                    <span className="option-value">{item.color}</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="item-price">
                                            <span className="current-price">${item.product.price}</span>
                                            <span className="price-label">each</span>
                                        </div>

                                        <div className="item-quantity">
                                            <label className="qty-label">Quantity:</label>
                                            <div className="qty-controls">
                                                <button 
                                                    className="qty-btn minus"
                                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                    disabled={updating || item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <span className="qty-value">{item.quantity}</span>
                                                <button 
                                                    className="qty-btn plus"
                                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                    disabled={updating || item.quantity >= item.product.stock}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            {item.quantity >= item.product.stock && (
                                                <span className="max-qty-notice">Max quantity reached</span>
                                            )}
                                        </div>

                                        <div className="item-total">
                                            <span className="total-label">Total:</span>
                                            <span className="total-price">
                                                ${(item.product.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="item-actions">
                                            <button 
                                                className="action-btn move-btn"
                                                onClick={() => moveToWishlist(item)}
                                                title="Move to Wishlist"
                                            >
                                                <span className="action-icon">❤️</span>
                                                <span className="action-text">Wishlist</span>
                                            </button>
                                            <button 
                                                className="action-btn remove-btn"
                                                onClick={() => removeFromCart(item._id)}
                                                title="Remove from Cart"
                                            >
                                                <span className="action-icon">🗑️</span>
                                                <span className="action-text">Remove</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="cart-footer">
                                <Link to="/products" className="continue-shopping-btn">
                                    ← Continue Shopping
                                </Link>
                            </div>
                        </div>

                        <div className="cart-summary">
                            <div className="summary-card">
                                <h3 className="summary-title">Order Summary</h3>
                                
                                <div className="summary-details">
                                    <div className="summary-row">
                                        <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                                        <span>${calculateSubtotal()}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Estimated Tax (8%)</span>
                                        <span>${calculateTax(calculateSubtotal())}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Shipping</span>
                                        <span className={calculateShipping(parseFloat(calculateSubtotal())) === 0 ? 'free-shipping' : ''}>
                                            {calculateShipping(parseFloat(calculateSubtotal())) === 0 
                                                ? 'FREE' 
                                                : `$${calculateShipping(parseFloat(calculateSubtotal())).toFixed(2)}`
                                            }
                                        </span>
                                    </div>
                                    
                                    {parseFloat(calculateSubtotal()) < 50 && (
                                        <div className="shipping-notice">
                                            <span className="notice-icon">🚚</span>
                                            Add <strong>${(50 - parseFloat(calculateSubtotal())).toFixed(2)}</strong> more for free shipping!
                                        </div>
                                    )}
                                    
                                    <div className="summary-divider"></div>
                                    
                                    <div className="summary-row total-row">
                                        <span>Total</span>
                                        <span>${calculateTotal()}</span>
                                    </div>
                                </div>

                                <div className="summary-actions">
                                    <button 
                                        className="checkout-btn"
                                        onClick={proceedToCheckout}
                                    >
                                        <span className="checkout-icon">🔒</span>
                                        Proceed to Checkout
                                    </button>
                                    
                                    <div className="payment-methods">
                                        <span className="payment-label">We accept:</span>
                                        <div className="payment-icons">
                                            <span className="payment-icon">💳</span>
                                            <span className="payment-icon">💰</span>
                                            <span className="payment-icon">📱</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="security-badges">
                                    <div className="badge">
                                        <span className="badge-icon">🔒</span>
                                        <span>Secure Checkout</span>
                                    </div>
                                    <div className="badge">
                                        <span className="badge-icon">🚚</span>
                                        <span>Fast Delivery</span>
                                    </div>
                                    <div className="badge">
                                        <span className="badge-icon">↩️</span>
                                        <span>Easy Returns</span>
                                    </div>
                                </div>

                                <div className="promo-section">
                                    <h4>Have a promo code?</h4>
                                    <div className="promo-input-group">
                                        <input 
                                            type="text" 
                                            placeholder="Enter promo code"
                                            className="promo-input"
                                        />
                                        <button className="apply-promo-btn">Apply</button>
                                    </div>
                                </div>
                            </div>

                            <div className="recommended-section">
                                <h3>You might also like</h3>
                                <div className="recommended-items">
                                    <div className="recommended-item">
                                        <img src="https://via.placeholder.com/80x80/667eea/ffffff?text=Rec1" alt="Recommended" />
                                        <div className="recommended-info">
                                            <span className="recommended-name">Sports Socks</span>
                                            <span className="recommended-price">$12.99</span>
                                        </div>
                                        <button className="add-recommended-btn">+</button>
                                    </div>
                                    <div className="recommended-item">
                                        <img src="https://via.placeholder.com/80x80/764ba2/ffffff?text=Rec2" alt="Recommended" />
                                        <div className="recommended-info">
                                            <span className="recommended-name">Water Bottle</span>
                                            <span className="recommended-price">$15.99</span>
                                        </div>
                                        <button className="add-recommended-btn">+</button>
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

export default Cart;
