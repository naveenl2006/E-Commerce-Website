import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Get in touch with our team!</p>
        </div>
      </section>

      <div className="container">
        <div className="contact-content">
          {/* Contact Form */}
          <div className="contact-form-section">
            <div className="form-card">
              <h2>Send us a Message</h2>
              <p>Fill out the form below and we'll get back to you as soon as possible.</p>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="form-control"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Customer Support</option>
                    <option value="order">Order Related</option>
                    <option value="returns">Returns & Exchanges</option>
                    <option value="wholesale">Wholesale Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="form-control"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary submit-btn"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="contact-info-section">
            <div className="info-card">
              <h3>Get in Touch</h3>
              <p>Have questions? We're here to help!</p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon">
                    <FaEnvelope />
                  </div>
                  <div className="method-details">
                    <h4>Email</h4>
                    <p>support@sportfitwomen.com</p>
                    <span>We typically respond within 24 hours</span>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">
                    <FaPhone />
                  </div>
                  <div className="method-details">
                    <h4>Phone</h4>
                    <p>+1 (555) 123-4567</p>
                    <span>Mon-Fri, 9AM-6PM EST</span>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="method-details">
                    <h4>Address</h4>
                    <p>123 Fitness Street<br />New York, NY 10001</p>
                    <span>Visit our showroom</span>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">
                    <FaClock />
                  </div>
                  <div className="method-details">
                    <h4>Business Hours</h4>
                    <p>Mon-Fri: 9AM-6PM<br />Sat: 10AM-4PM<br />Sun: Closed</p>
                    <span>EST Time Zone</span>
                  </div>
                </div>
              </div>

              <div className="social-links">
                <h4>Follow Us</h4>
                <div className="social-icons">
                  <a href="#" aria-label="Facebook">
                    <FaFacebook />
                  </a>
                  <a href="#" aria-label="Twitter">
                    <FaTwitter />
                  </a>
                  <a href="#" aria-label="Instagram">
                    <FaInstagram />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Quick Links */}
        <div className="faq-section">
          <h3>Frequently Asked Questions</h3>
          <p>Looking for quick answers? Check out our most common questions:</p>
          <div className="faq-links">
            <a href="/faq#shipping">Shipping Information</a>
            <a href="/faq#returns">Return Policy</a>
            <a href="/faq#sizing">Size Guide</a>
            <a href="/faq#care">Care Instructions</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
