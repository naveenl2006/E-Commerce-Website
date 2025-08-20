import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AddProduct.css';

const AddProduct = () => {
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        sizes: [],
        colors: [],
        brand: '',
        stock: '',
        image: ''
    });
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [currentSize, setCurrentSize] = useState('');
    const [currentColor, setCurrentColor] = useState('');
    const navigate = useNavigate();

    const categories = [
        'T-Shirts',
        'Shorts', 
        'Tracksuits',
        'Shoes',
        'Accessories'
    ];

    const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const availableColors = [
        'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 
        'Orange', 'Purple', 'Pink', 'Gray', 'Navy', 'Maroon'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProductData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const value = e.target.value;
        setProductData(prev => ({
            ...prev,
            image: value
        }));
        setImagePreview(value);
    };

    const addSize = () => {
        if (currentSize && !productData.sizes.includes(currentSize)) {
            setProductData(prev => ({
                ...prev,
                sizes: [...prev.sizes, currentSize]
            }));
            setCurrentSize('');
        }
    };

    const removeSize = (sizeToRemove) => {
        setProductData(prev => ({
            ...prev,
            sizes: prev.sizes.filter(size => size !== sizeToRemove)
        }));
    };

    const addColor = () => {
        if (currentColor && !productData.colors.includes(currentColor)) {
            setProductData(prev => ({
                ...prev,
                colors: [...prev.colors, currentColor]
            }));
            setCurrentColor('');
        }
    };

    const removeColor = (colorToRemove) => {
        setProductData(prev => ({
            ...prev,
            colors: prev.colors.filter(color => color !== colorToRemove)
        }));
    };

    const validateForm = () => {
        const required = ['name', 'description', 'price', 'category', 'brand', 'stock', 'image'];
        
        for (let field of required) {
            if (!productData[field] || productData[field].toString().trim() === '') {
                toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
                return false;
            }
        }

        if (parseFloat(productData.price) <= 0) {
            toast.error('Price must be greater than 0');
            return false;
        }

        if (parseInt(productData.stock) < 0) {
            toast.error('Stock cannot be negative');
            return false;
        }

        if (productData.sizes.length === 0) {
            toast.error('At least one size is required');
            return false;
        }

        if (productData.colors.length === 0) {
            toast.error('At least one color is required');
            return false;
        }

        // Validate image URL format
        const imageUrlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        if (!imageUrlPattern.test(productData.image)) {
            toast.error('Please enter a valid image URL');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            
            const submitData = {
                ...productData,
                price: parseFloat(productData.price),
                stock: parseInt(productData.stock)
            };

            const response = await axios.post('/api/products', submitData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Product added successfully!');
            navigate('/admin/dashboard');
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error(error.response?.data?.message || 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setProductData({
            name: '',
            description: '',
            price: '',
            category: '',
            sizes: [],
            colors: [],
            brand: '',
            stock: '',
            image: ''
        });
        setImagePreview('');
        setCurrentSize('');
        setCurrentColor('');
    };

    const generateSampleData = () => {
        const sampleProducts = [
            {
                name: 'Athletic Performance T-Shirt',
                description: 'High-performance moisture-wicking t-shirt perfect for intense workouts and sports activities. Made with premium breathable fabric.',
                price: '29.99',
                category: 'T-Shirts',
                brand: 'SportMax',
                stock: '50',
                image: 'https://via.placeholder.com/400x400/667eea/ffffff?text=T-Shirt'
            },
            {
                name: 'Pro Basketball Shorts',
                description: 'Lightweight basketball shorts with moisture-wicking technology and comfortable fit for maximum performance on the court.',
                price: '34.99',
                category: 'Shorts',
                brand: 'HoopMaster',
                stock: '30',
                image: 'https://via.placeholder.com/400x400/764ba2/ffffff?text=Shorts'
            },
            {
                name: 'Complete Training Tracksuit',
                description: 'Full tracksuit set including jacket and pants. Perfect for training, warm-ups, and casual wear.',
                price: '79.99',
                category: 'Tracksuits',
                brand: 'TrackPro',
                stock: '25',
                image: 'https://via.placeholder.com/400x400/e74c3c/ffffff?text=Tracksuit'
            }
        ];

        const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
        
        setProductData({
            ...randomProduct,
            sizes: ['S', 'M', 'L'],
            colors: ['Black', 'White', 'Blue']
        });
        setImagePreview(randomProduct.image);
        toast.info('Sample data loaded! You can modify it before submitting.');
    };

    return (
        <div className="add-product-page">
            <div className="container">
                <div className="page-header">
                    <div className="header-content">
                        <h1 className="page-title">Add New Product</h1>
                        <p className="page-subtitle">Create a new product listing for your store</p>
                    </div>
                    
                    <div className="header-actions">
                        <button 
                            className="sample-data-btn"
                            onClick={generateSampleData}
                            type="button"
                        >
                            <span className="btn-icon">🎯</span>
                            Load Sample Data
                        </button>
                        
                        <button 
                            className="reset-btn"
                            onClick={resetForm}
                            type="button"
                        >
                            <span className="btn-icon">🔄</span>
                            Reset Form
                        </button>
                    </div>
                </div>

                <div className="add-product-content">
                    <form onSubmit={handleSubmit} className="product-form">
                        <div className="form-sections">
                            {/* Basic Information */}
                            <div className="form-section">
                                <h2 className="section-title">
                                    <span className="section-icon">📝</span>
                                    Basic Information
                                </h2>
                                
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Product Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={productData.name}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="Enter product name"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Brand *</label>
                                        <input
                                            type="text"
                                            name="brand"
                                            value={productData.brand}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="Enter brand name"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Category *</label>
                                        <select
                                            name="category"
                                            value={productData.category}
                                            onChange={handleInputChange}
                                            className="form-select"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(category => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label">Description *</label>
                                        <textarea
                                            name="description"
                                            value={productData.description}
                                            onChange={handleInputChange}
                                            className="form-textarea"
                                            placeholder="Enter detailed product description"
                                            rows="4"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Pricing and Inventory */}
                            <div className="form-section">
                                <h2 className="section-title">
                                    <span className="section-icon">💰</span>
                                    Pricing & Inventory
                                </h2>
                                
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Price ($) *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={productData.price}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Stock Quantity *</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={productData.stock}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="0"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Variants */}
                            <div className="form-section">
                                <h2 className="section-title">
                                    <span className="section-icon">🎨</span>
                                    Product Variants
                                </h2>
                                
                                <div className="variants-grid">
                                    {/* Sizes */}
                                    <div className="variant-group">
                                        <h3>Available Sizes *</h3>
                                        <div className="variant-input">
                                            <select
                                                value={currentSize}
                                                onChange={(e) => setCurrentSize(e.target.value)}
                                                className="variant-select"
                                            >
                                                <option value="">Select Size</option>
                                                {availableSizes.map(size => (
                                                    <option key={size} value={size}>{size}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={addSize}
                                                className="add-variant-btn"
                                                disabled={!currentSize}
                                            >
                                                Add Size
                                            </button>
                                        </div>
                                        
                                        <div className="variant-tags">
                                            {productData.sizes.map(size => (
                                                <span key={size} className="variant-tag">
                                                    {size}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSize(size)}
                                                        className="remove-tag"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Colors */}
                                    <div className="variant-group">
                                        <h3>Available Colors *</h3>
                                        <div className="variant-input">
                                            <select
                                                value={currentColor}
                                                onChange={(e) => setCurrentColor(e.target.value)}
                                                className="variant-select"
                                            >
                                                <option value="">Select Color</option>
                                                {availableColors.map(color => (
                                                    <option key={color} value={color}>{color}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={addColor}
                                                className="add-variant-btn"
                                                disabled={!currentColor}
                                            >
                                                Add Color
                                            </button>
                                        </div>
                                        
                                        <div className="variant-tags">
                                            {productData.colors.map(color => (
                                                <span key={color} className="variant-tag color-tag">
                                                    {color}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeColor(color)}
                                                        className="remove-tag"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Product Image */}
                            <div className="form-section">
                                <h2 className="section-title">
                                    <span className="section-icon">🖼️</span>
                                    Product Image
                                </h2>
                                
                                <div className="image-section">
                                    <div className="image-input-group">
                                        <label className="form-label">Image URL *</label>
                                        <input
                                            type="url"
                                            name="image"
                                            value={productData.image}
                                            onChange={handleImageChange}
                                            className="form-input"
                                            placeholder="https://example.com/image.jpg"
                                            required
                                        />
                                        <p className="image-help">Enter a valid image URL (jpg, png, gif, webp)</p>
                                    </div>
                                    
                                    <div className="image-preview">
                                        {imagePreview ? (
                                            <img 
                                                src={imagePreview} 
                                                alt="Product preview"
                                                className="preview-image"
                                                onError={() => setImagePreview('')}
                                            />
                                        ) : (
                                            <div className="preview-placeholder">
                                                <span className="placeholder-icon">🖼️</span>
                                                <p>Image preview will appear here</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => navigate('/admin/dashboard')}
                            >
                                Cancel
                            </button>
                            
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="btn-spinner"></span>
                                        Adding Product...
                                    </>
                                ) : (
                                    <>
                                        <span className="btn-icon">✅</span>
                                        Add Product
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Product Preview */}
                    <div className="product-preview">
                        <div className="preview-card">
                            <h3 className="preview-title">Product Preview</h3>
                            
                            <div className="preview-content">
                                <div className="preview-image-section">
                                    {imagePreview ? (
                                        <img 
                                            src={imagePreview} 
                                            alt="Product preview"
                                            className="preview-product-image"
                                        />
                                    ) : (
                                        <div className="preview-no-image">
                                            <span className="no-image-icon">📷</span>
                                            <p>No image</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="preview-details">
                                    <h4 className="preview-product-name">
                                        {productData.name || 'Product Name'}
                                    </h4>
                                    
                                    <p className="preview-brand">
                                        {productData.brand || 'Brand Name'}
                                    </p>
                                    
                                    <p className="preview-category">
                                        {productData.category || 'Category'}
                                    </p>
                                    
                                    <p className="preview-description">
                                        {productData.description || 'Product description will appear here...'}
                                    </p>
                                    
                                    <div className="preview-price">
                                        ${productData.price || '0.00'}
                                    </div>
                                    
                                    <div className="preview-stock">
                                        Stock: {productData.stock || '0'} units
                                    </div>
                                    
                                    {productData.sizes.length > 0 && (
                                        <div className="preview-sizes">
                                            <span className="preview-label">Sizes:</span>
                                            {productData.sizes.map(size => (
                                                <span key={size} className="preview-size">{size}</span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {productData.colors.length > 0 && (
                                        <div className="preview-colors">
                                            <span className="preview-label">Colors:</span>
                                            {productData.colors.map(color => (
                                                <span key={color} className="preview-color">{color}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;
