import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        fetchFeaturedProducts();
        const slideInterval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % 3);
        }, 5000);

        return () => clearInterval(slideInterval);
    }, []);

    const fetchFeaturedProducts = async () => {
        try {
            const response = await axios.get('/api/products');
            setFeaturedProducts(response.data.slice(0, 6));
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const heroSlides = [
        {
            title: "Premium Boys Sportswear",
            subtitle: "Unleash Your Athletic Potential",
            description: "Discover our collection of high-quality sportswear designed for young champions",
            image: "https://i.pinimg.com/1200x/67/89/90/67899027eb561b12d72b58b12ca26cf1.jpg",
            cta: "Shop Now"
        },
        {
            title: "Latest Athletic Gear",
            subtitle: "Performance Meets Style",
            description: "From training to competition, we've got the gear that helps you perform your best",
            image: "https://i.pinimg.com/1200x/5b/66/af/5b66af63ff5f12e77df59d397ce02f79.jpg",
            cta: "Explore Collection"
        },
        {
            title: "Free Shipping on Orders $50+",
            subtitle: "Fast & Reliable Delivery",
            description: "Get your favorite sportswear delivered to your doorstep with our express shipping",
            image: "https://i.pinimg.com/1200x/7d/fa/fa/7dfafaff639bd303091b7f4e3d188b1f.jpg",
            cta: "Learn More"
        }
    ];

    const categories = [
        { name: "T-Shirts", icon: "👕", count: "50+ Items" },
        { name: "Shorts", icon: "🩳", count: "30+ Items" },
        { name: "Tracksuits", icon: "🏃‍♂️", count: "25+ Items" },
        { name: "Shoes", icon: "👟", count: "40+ Items" },
        { name: "Accessories", icon: "🎽", count: "20+ Items" }
    ];

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-slider">
                    {heroSlides.map((slide, index) => (
                        <div 
                            key={index}
                            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${slide.image})` }}
                        >
                            <div className="hero-overlay">
                                <div className="hero-content">
                                    <h1 className="hero-title">{slide.title}</h1>
                                    <h2 className="hero-subtitle">{slide.subtitle}</h2>
                                    <p className="hero-description">{slide.description}</p>
                                    <Link to="/products" className="hero-cta">
                                        {slide.cta}
                                        <span className="cta-arrow">→</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="hero-indicators">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            className={`indicator ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories">
                <div className="container">
                    <h2 className="section-title">Shop by Category</h2>
                    <div className="categories-grid">
                        {categories.map((category, index) => (
                            <Link 
                                key={index}
                                to={`/products?category=${category.name}`}
                                className="category-card"
                            >
                                <div className="category-icon">{category.icon}</div>
                                <h3 className="category-name">{category.name}</h3>
                                <p className="category-count">{category.count}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="featured-products">
                <div className="container">
                    <h2 className="section-title">Featured Products</h2>
                    <div className="products-grid">
                        {featuredProducts.map(product => (
                            <div key={product._id} className="product-card">
                                <div className="product-image">
                                    <img src={product.image} alt={product.name} />
                                    <div className="product-overlay">
                                        <Link to={`/products/${product._id}`} className="view-product">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                                <div className="product-info">
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-brand">{product.brand}</p>
                                    <div className="product-price">${product.price}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="section-cta">
                        <Link to="/products" className="btn-primary">View All Products</Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🚚</div>
                            <h3>Free Shipping</h3>
                            <p>Free shipping on orders over $50</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🔄</div>
                            <h3>Easy Returns</h3>
                            <p>30-day hassle-free return policy</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🏆</div>
                            <h3>Quality Guarantee</h3>
                            <p>Premium quality sportswear guaranteed</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💬</div>
                            <h3>24/7 Support</h3>
                            <p>Round-the-clock customer support</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="newsletter">
                <div className="container">
                    <div className="newsletter-content">
                        <h2>Stay Updated with Latest Sports Gear</h2>
                        <p>Subscribe to our newsletter and be the first to know about new arrivals and exclusive offers</p>
                        <form className="newsletter-form">
                            <input 
                                type="email" 
                                placeholder="Enter your email address"
                                className="newsletter-input"
                            />
                            <button type="submit" className="newsletter-btn">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
