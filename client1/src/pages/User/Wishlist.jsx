import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Wishlist.css';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const navigate = useNavigate();

    useEffect(() => {
        fetchWishlistItems();
    }, []);

    const fetchWishlistItems = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get('/api/users/wishlist', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWishlistItems(response.data);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                toast.error('Failed to load wishlist items');
            }
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/users/wishlist/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setWishlistItems(items => items.filter(item => item._id !== productId));
            setSelectedItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
            toast.success('Item removed from wishlist');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error('Failed to remove item from wishlist');
        }
    };

    const addToCart = async (product, size = 'M', color = 'Default') => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/users/cart', 
                { 
                    productId: product._id, 
                    quantity: 1, 
                    size, 
                    color 
                }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Item added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add item to cart');
        }
    };

    const moveToCart = async (product, size = 'M', color = 'Default') => {
        try {
            await addToCart(product, size, color);
            await removeFromWishlist(product._id);
            toast.success('Item moved to cart!');
        } catch (error) {
            console.error('Error moving to cart:', error);
            toast.error('Failed to move item to cart');
        }
    };

    const toggleSelectItem = (productId) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    const selectAllItems = () => {
        if (selectedItems.size === wishlistItems.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(wishlistItems.map(item => item._id)));
        }
    };

    const removeSelectedItems = async () => {
        if (selectedItems.size === 0) {
            toast.error('No items selected');
            return;
        }

        if (!window.confirm(`Remove ${selectedItems.size} selected items from wishlist?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const promises = Array.from(selectedItems).map(productId =>
                axios.delete(`/api/users/wishlist/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            );

            await Promise.all(promises);
            
            setWishlistItems(items => 
                items.filter(item => !selectedItems.has(item._id))
            );
            setSelectedItems(new Set());
            toast.success(`${selectedItems.size} items removed from wishlist`);
        } catch (error) {
            console.error('Error removing selected items:', error);
            toast.error('Failed to remove selected items');
        }
    };

    const moveSelectedToCart = async () => {
        if (selectedItems.size === 0) {
            toast.error('No items selected');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const selectedProducts = wishlistItems.filter(item => 
                selectedItems.has(item._id)
            );

            const cartPromises = selectedProducts.map(product =>
                axios.post('/api/users/cart', 
                    { 
                        productId: product._id, 
                        quantity: 1, 
                        size: 'M', 
                        color: 'Default' 
                    }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            );

            await Promise.all(cartPromises);

            const removePromises = Array.from(selectedItems).map(productId =>
                axios.delete(`/api/users/wishlist/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            );

            await Promise.all(removePromises);
            
            setWishlistItems(items => 
                items.filter(item => !selectedItems.has(item._id))
            );
            setSelectedItems(new Set());
            toast.success(`${selectedProducts.length} items moved to cart!`);
        } catch (error) {
            console.error('Error moving selected items to cart:', error);
            toast.error('Failed to move items to cart');
        }
    };

    const clearWishlist = async () => {
        if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const promises = wishlistItems.map(item =>
                axios.delete(`/api/users/wishlist/${item._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            );

            await Promise.all(promises);
            setWishlistItems([]);
            setSelectedItems(new Set());
            toast.success('Wishlist cleared');
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            toast.error('Failed to clear wishlist');
        }
    };

    const shareWishlist = () => {
        const wishlistText = wishlistItems.map(item => 
            `${item.name} - $${item.price}`
        ).join('\n');
        
        if (navigator.share) {
            navigator.share({
                title: 'My BoySports Wishlist',
                text: `Check out my wishlist:\n${wishlistText}`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(`My BoySports Wishlist:\n${wishlistText}`);
            toast.success('Wishlist copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your wishlist...</p>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <div className="container">
                <div className="wishlist-header">
                    <div className="header-content">
                        <h1 className="page-title">My Wishlist</h1>
                        <p className="page-subtitle">Save your favorite items for later</p>
                    </div>
                    
                    <div className="header-actions">
                        {wishlistItems.length > 0 && (
                            <>
                                <button 
                                    className="share-btn"
                                    onClick={shareWishlist}
                                    title="Share Wishlist"
                                >
                                    <span className="btn-icon">📤</span>
                                    Share
                                </button>
                                <button 
                                    className="clear-btn"
                                    onClick={clearWishlist}
                                    title="Clear Wishlist"
                                >
                                    <span className="btn-icon">🗑️</span>
                                    Clear All
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="empty-wishlist">
                        <div className="empty-wishlist-icon">💝</div>
                        <h2>Your wishlist is empty</h2>
                        <p>Save items you love so you don't lose them!</p>
                        <div className="empty-wishlist-actions">
                            <Link to="/products" className="btn-primary">
                                Browse Products
                            </Link>
                            <Link to="/cart" className="btn-secondary">
                                View Cart
                            </Link>
                        </div>
                        
                        <div className="wishlist-benefits">
                            <h3>Why use a wishlist?</h3>
                            <div className="benefits-grid">
                                <div className="benefit">
                                    <span className="benefit-icon">💡</span>
                                    <span>Remember favorites</span>
                                </div>
                                <div className="benefit">
                                    <span className="benefit-icon">🔔</span>
                                    <span>Get price alerts</span>
                                </div>
                                <div className="benefit">
                                    <span className="benefit-icon">📤</span>
                                    <span>Share with friends</span>
                                </div>
                                <div className="benefit">
                                    <span className="benefit-icon">⚡</span>
                                    <span>Quick add to cart</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="wishlist-content">
                        <div className="wishlist-controls">
                            <div className="selection-controls">
                                <label className="select-all-wrapper">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.size === wishlistItems.length && wishlistItems.length > 0}
                                        onChange={selectAllItems}
                                        className="select-all-checkbox"
                                    />
                                    <span className="checkmark"></span>
                                    Select All ({wishlistItems.length} items)
                                </label>
                            </div>

                            {selectedItems.size > 0 && (
                                <div className="bulk-actions">
                                    <span className="selected-count">
                                        {selectedItems.size} selected
                                    </span>
                                    <button 
                                        className="bulk-btn move-to-cart-btn"
                                        onClick={moveSelectedToCart}
                                    >
                                        <span className="btn-icon">🛒</span>
                                        Move to Cart
                                    </button>
                                    <button 
                                        className="bulk-btn remove-selected-btn"
                                        onClick={removeSelectedItems}
                                    >
                                        <span className="btn-icon">🗑️</span>
                                        Remove Selected
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="wishlist-items">
                            {wishlistItems.map(item => (
                                <div key={item._id} className="wishlist-item">
                                    <label className="item-checkbox-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.has(item._id)}
                                            onChange={() => toggleSelectItem(item._id)}
                                            className="item-checkbox"
                                        />
                                        <span className="checkmark"></span>
                                    </label>

                                    <div className="item-image">
                                        <img 
                                            src={item.image} 
                                            alt={item.name}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/200x200/667eea/ffffff?text=Product';
                                            }}
                                        />
                                        {item.stock <= 5 && (
                                            <div className="stock-badge">
                                                {item.stock === 0 ? 'Out of Stock' : `Only ${item.stock} left!`}
                                            </div>
                                        )}
                                    </div>

                                    <div className="item-details">
                                        <div className="item-header">
                                            <h3 className="item-name">{item.name}</h3>
                                            <button 
                                                className="remove-item-btn"
                                                onClick={() => removeFromWishlist(item._id)}
                                                title="Remove from Wishlist"
                                            >
                                                ❌
                                            </button>
                                        </div>
                                        
                                        <p className="item-brand">{item.brand}</p>
                                        <p className="item-category">{item.category}</p>
                                        <p className="item-description">{item.description}</p>
                                        
                                        <div className="item-options">
                                            <div className="available-sizes">
                                                <span className="options-label">Available Sizes:</span>
                                                <div className="sizes-list">
                                                    {item.sizes.map(size => (
                                                        <span key={size} className="size-tag">{size}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="available-colors">
                                                <span className="options-label">Available Colors:</span>
                                                <div className="colors-list">
                                                    {item.colors.slice(0, 4).map(color => (
                                                        <span key={color} className="color-tag">{color}</span>
                                                    ))}
                                                    {item.colors.length > 4 && (
                                                        <span className="color-tag more">+{item.colors.length - 4}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="item-price-actions">
                                        <div className="price-section">
                                            <span className="current-price">${item.price}</span>
                                            <span className="price-status">
                                                {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </div>

                                        <div className="item-actions">
                                            <button 
                                                className="action-btn add-to-cart-btn"
                                                onClick={() => addToCart(item)}
                                                disabled={item.stock === 0}
                                            >
                                                <span className="btn-icon">🛒</span>
                                                Add to Cart
                                            </button>
                                            
                                            <button 
                                                className="action-btn move-to-cart-btn"
                                                onClick={() => moveToCart(item)}
                                                disabled={item.stock === 0}
                                            >
                                                <span className="btn-icon">➡️</span>
                                                Move to Cart
                                            </button>
                                            
                                            <Link 
                                                to={`/products/${item._id}`}
                                                className="action-btn view-details-btn"
                                            >
                                                <span className="btn-icon">👁️</span>
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="wishlist-footer">
                            <div className="footer-stats">
                                <span className="total-items">
                                    Total: {wishlistItems.length} items
                                </span>
                                <span className="total-value">
                                    Value: ${wishlistItems.reduce((total, item) => total + item.price, 0).toFixed(2)}
                                </span>
                            </div>
                            
                            <div className="footer-actions">
                                <Link to="/products" className="continue-shopping-btn">
                                    Continue Shopping
                                </Link>
                                <Link to="/cart" className="view-cart-btn">
                                    View Cart
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
