import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ProductDetails.css'; // You'll need to create this CSS file

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchProductDetails();
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [id]);

    const fetchProductDetails = async () => {
        try {
            const response = await axios.get(`/api/products/${id}`);
            setProduct(response.data);
            // Set default selections
            if (response.data.sizes.length > 0) {
                setSelectedSize(response.data.sizes[0]);
            }
            if (response.data.colors.length > 0) {
                setSelectedColor(response.data.colors);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching product details:', error);
            toast.error('Failed to load product details');
            setLoading(false);
        }
    };

    const addToCart = async () => {
        if (!user) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }

        if (!selectedSize || !selectedColor) {
            toast.error('Please select size and color');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/users/cart', 
                { 
                    productId: product._id, 
                    quantity, 
                    size: selectedSize, 
                    color: selectedColor 
                }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Item added to cart!');
        } catch (error) {
            toast.error('Failed to add item to cart');
        }
    };

    const addToWishlist = async () => {
        if (!user) {
            toast.error('Please login to add items to wishlist');
            navigate('/login');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/users/wishlist', 
                { productId: product._id }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Item added to wishlist!');
        } catch (error) {
            toast.error('Failed to add item to wishlist');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading product details...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="error-container">
                <h2>Product not found</h2>
                <p>The product you're looking for doesn't exist.</p>
                <button onClick={() => navigate('/products')} className="btn-primary">
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <div className="product-details-page">
            <div className="container">
                <button onClick={() => navigate('/products')} className="back-btn">
                    ← Back to Products
                </button>

                <div className="product-details">
                    <div className="product-image-section">
                        <img src={product.image} alt={product.name} className="product-image" />
                    </div>

                    <div className="product-info-section">
                        <div className="product-brand">{product.brand}</div>
                        <h1 className="product-title">{product.name}</h1>
                        <p className="product-description">{product.description}</p>
                        <div className="product-category">Category: {product.category}</div>
                        <div className="product-price">${product.price}</div>
                        
                        {product.stock <= 5 && (
                            <div className="stock-warning">Only {product.stock} left in stock!</div>
                        )}

                        <div className="product-options">
                            <div className="size-selection">
                                <h4>Size:</h4>
                                <div className="size-options">
                                    {product.sizes.map(size => (
                                        <button 
                                            key={size} 
                                            className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="color-selection">
                                <h4>Color:</h4>
                                <div className="color-options">
                                    {product.colors.map(color => (
                                        <button 
                                            key={color} 
                                            className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                                            onClick={() => setSelectedColor(color)}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="quantity-selection">
                                <h4>Quantity:</h4>
                                <div className="quantity-controls">
                                    <button 
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="quantity-btn"
                                    >
                                        -
                                    </button>
                                    <span className="quantity-value">{quantity}</span>
                                    <button 
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="quantity-btn"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="product-actions">
                            <button 
                                className="btn-primary add-to-cart-btn"
                                onClick={addToCart}
                                disabled={product.stock === 0}
                            >
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button 
                                className="btn-secondary add-to-wishlist-btn"
                                onClick={addToWishlist}
                            >
                                Add to Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
