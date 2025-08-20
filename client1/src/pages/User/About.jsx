import React from 'react';
import { FaHeart, FaStar, FaUsers, FaAward } from 'react-icons/fa';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="hero-content">
            <h1>About SportFit Women</h1>
            <p>Empowering women through premium sportswear designed for performance, comfort, and style</p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>Our Story</h2>
              <p>
                Founded in 2020, SportFit Women was born from a simple belief: every woman deserves 
                activewear that makes her feel confident, comfortable, and empowered. We started as 
                a small team of fitness enthusiasts who were frustrated with the lack of quality, 
                stylish, and functional sportswear designed specifically for women.
              </p>
              <p>
                Today, we've grown into a community of strong women who believe that fitness is not 
                just about physical strength, but about mental resilience, self-confidence, and 
                personal growth. Our mission is to provide you with the tools you need to crush 
                your goals, both in and out of the gym.
              </p>
            </div>
            <div className="story-image">
              <img src="/api/placeholder/500/400" alt="Our Story" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title">Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <FaHeart />
              </div>
              <h3>Passion</h3>
              <p>We're passionate about fitness and helping women achieve their goals through high-quality activewear.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FaStar />
              </div>
              <h3>Quality</h3>
              <p>We never compromise on quality, using only the finest materials and construction techniques.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FaUsers />
              </div>
              <h3>Community</h3>
              <p>We believe in building a supportive community of strong, empowered women who lift each other up.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FaAward />
              </div>
              <h3>Innovation</h3>
              <p>We continuously innovate to create activewear that meets the evolving needs of active women.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2 className="section-title">Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <img src="/api/placeholder/200/200" alt="Sarah Johnson" />
              <h3>Sarah Johnson</h3>
              <p>Founder & CEO</p>
              <p>Former professional athlete with a passion for women's fitness and empowerment.</p>
            </div>
            <div className="team-member">
              <img src="/api/placeholder/200/200" alt="Emily Chen" />
              <h3>Emily Chen</h3>
              <p>Head of Design</p>
              <p>Fashion designer specializing in functional and stylish activewear for women.</p>
            </div>
            <div className="team-member">
              <img src="/api/placeholder/200/200" alt="Maria Rodriguez" />
              <h3>Maria Rodriguez</h3>
              <p>Customer Experience</p>
              <p>Dedicated to ensuring every customer has an amazing experience with SportFit Women.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat">
              <h3>50K+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat">
              <h3>1000+</h3>
              <p>Products</p>
            </div>
            <div className="stat">
              <h3>25+</h3>
              <p>Countries</p>
            </div>
            <div className="stat">
              <h3>4.8/5</h3>
              <p>Customer Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Join Our Community?</h2>
            <p>Discover premium sportswear designed for strong, confident women like you.</p>
            <a href="/products" className="btn btn-primary">Shop Now</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
