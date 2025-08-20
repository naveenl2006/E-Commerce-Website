import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        search: ''
    });
    const [sortBy, setSortBy] = useState('name');
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchProducts();
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    useEffect(() => {
        applyFilters();
    }, [products, filters, sortBy]);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/api/products');
            setProducts(response.data);
            setFilteredProducts(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...products];

        // Apply filters
        if (filters.category) {
            filtered = filtered.filter(product => product.category === filters.category);
        }

        if (filters.brand) {
            filtered = filtered.filter(product => 
                product.brand.toLowerCase().includes(filters.brand.toLowerCase())
            );
        }

        if (filters.minPrice) {
            filtered = filtered.filter(product => product.price >= parseFloat(filters.minPrice));
        }

        if (filters.maxPrice) {
            filtered = filtered.filter(product => product.price <= parseFloat(filters.maxPrice));
        }

        if (filters.search) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                product.description.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });

        setFilteredProducts(filtered);
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            brand: '',
            minPrice: '',
            maxPrice: '',
            search: ''
        });
        setSortBy('name');
    };

    const addToWishlist = async (productId) => {
        if (!user) {
            toast.error('Please login to add items to wishlist');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/users/wishlist', 
                { productId }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Item added to wishlist!');
        } catch (error) {
            toast.error('Failed to add item to wishlist');
        }
    };

    const addToCart = async (productId) => {
        if (!user) {
            toast.error('Please login to add items to cart');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/users/cart', 
                { productId, quantity: 1, size: 'M', color: 'Default' }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Item added to cart!');
        } catch (error) {
            toast.error('Failed to add item to cart');
        }
    };

    const categories = ['T-Shirts', 'Shorts', 'Tracksuits', 'Shoes', 'Accessories'];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading products...</p>
            </div>
        );
    }

    return (
        <div className="products-page">
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Boys Sportswear Collection</h1>
                    <p className="page-subtitle">Discover premium quality sportswear for young athletes</p>
                </div>

                {/* Filters */}
                <div className="filters-section">
                    <div className="filters-container">
                        <div className="search-filter">
                            <input
                                type="text"
                                name="search"
                                placeholder="Search products..."
                                value={filters.search}
                                onChange={handleFilterChange}
                                className="search-input"
                            />
                        </div>

                        <div className="filter-group">
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                className="filter-select"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>

                            <input
                                type="text"
                                name="brand"
                                placeholder="Brand"
                                value={filters.brand}
                                onChange={handleFilterChange}
                                className="filter-input"
                            />

                            <input
                                type="number"
                                name="minPrice"
                                placeholder="Min Price"
                                value={filters.minPrice}
                                onChange={handleFilterChange}
                                className="filter-input"
                            />

                            <input
                                type="number"
                                name="maxPrice"
                                placeholder="Max Price"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                                className="filter-input"
                            />

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="filter-select"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="newest">Newest First</option>
                            </select>

                            <button onClick={clearFilters} className="clear-filters-btn">
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    <div className="results-info">
                        <span>{filteredProducts.length} products found</span>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="products-grid">
                    {filteredProducts.map(product => (
                        <div key={product._id} className="product-card">
                            <div className="product-image">
                                <img src={product.image} alt={product.name} />
                                <div className="product-overlay">
                                    <button 
                                        className="overlay-btn wishlist-btn"
                                        onClick={() => addToWishlist(product._id)}
                                        title="Add to Wishlist"
                                    >
                                        ❤️
                                    </button>
                                    <button 
                                        className="overlay-btn cart-btn"
                                        onClick={() => addToCart(product._id)}
                                        title="Add to Cart"
                                    >
                                        🛒
                                    </button>
                                </div>
                                {product.stock <= 5 && (
                                    <div className="stock-badge">Only {product.stock} left!</div>
                                )}
                            </div>

                            <div className="product-info">
                                <div className="product-brand">{product.brand}</div>
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-description">{product.description}</p>
                                
                                <div className="product-details">
                                    <div className="product-price">${product.price}</div>
                                    <div className="product-category">{product.category}</div>
                                </div>

                                <div className="product-options">
                                    <div className="sizes">
                                        <span className="options-label">Sizes:</span>
                                        {product.sizes.map(size => (
                                            <span key={size} className="size-tag">{size}</span>
                                        ))}
                                    </div>
                                    <div className="colors">
                                        <span className="options-label">Colors:</span>
                                        {product.colors.slice(0, 3).map(color => (
                                            <span key={color} className="color-tag">{color}</span>
                                        ))}
                                        {product.colors.length > 3 && (
                                            <span className="color-tag">+{product.colors.length - 3}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="product-actions">
                                    <button 
                                        className="btn-primary add-to-cart"
                                        onClick={() => addToCart(product._id)}
                                    >
                                        Add to Cart
                                    </button>
                                    <Link 
                                        to={`/products/${product._id}`}
                                        className="btn-secondary view-details"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="no-products">
                        <div className="no-products-icon">🔍</div>
                        <h3>No products found</h3>
                        <p>Try adjusting your filters or search terms</p>
                        <button onClick={clearFilters} className="btn-primary">
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
