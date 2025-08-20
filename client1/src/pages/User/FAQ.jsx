import React, { useState } from 'react';
import { FaPlus, FaMinus, FaSearch } from 'react-icons/fa';
import './FAQ.css';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFAQs, setOpenFAQs] = useState({});

  const categories = [
    { id: 'all', name: 'All Questions' },
    { id: 'shipping', name: 'Shipping' },
    { id: 'returns', name: 'Returns & Exchanges' },
    { id: 'sizing', name: 'Sizing' },
    { id: 'care', name: 'Care Instructions' },
    { id: 'orders', name: 'Orders' },
    { id: 'account', name: 'Account' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'shipping',
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. Free shipping is available on orders over $75.'
    },
    {
      id: 2,
      category: 'shipping',
      question: 'Do you offer international shipping?',
      answer: 'Yes, we ship internationally to over 25 countries. International shipping typically takes 7-14 business days depending on your location.'
    },
    {
      id: 3,
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all unworn items in original condition with tags attached. Returns are free for exchanges, $5 fee for refunds.'
    },
    {
      id: 4,
      category: 'returns',
      question: 'How do I initiate a return?',
      answer: 'Log into your account, go to "My Orders", find your order and click "Return Items". Follow the instructions to print your return label.'
    },
    {
      id: 5,
      category: 'sizing',
      question: 'How do I find my correct size?',
      answer: 'Use our size guide available on each product page. Measure yourself according to our instructions and compare with our size chart. When in doubt, size up for a more comfortable fit.'
    },
    {
      id: 6,
      category: 'sizing',
      question: 'Do your sizes run small or large?',
      answer: 'Our sizes are true to size based on our size chart. However, some customers prefer to size up in sports bras for extra comfort during high-intensity workouts.'
    },
    {
      id: 7,
      category: 'care',
      question: 'How should I care for my sportswear?',
      answer: 'Wash in cold water with like colors, use mild detergent, avoid fabric softener, and air dry when possible. Do not iron directly on printed or logo areas.'
    },
    {
      id: 8,
      category: 'care',
      question: 'Can I put sportswear in the dryer?',
      answer: 'While some items are dryer-safe on low heat, we recommend air drying to maintain the fabric\'s elasticity and prevent shrinkage.'
    },
    {
      id: 9,
      category: 'orders',
      question: 'Can I modify or cancel my order?',
      answer: 'Orders can be modified or cancelled within 1 hour of placing them. After that, orders enter processing and cannot be changed.'
    },
    {
      id: 10,
      category: 'orders',
      question: 'How can I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order by logging into your account and viewing "My Orders".'
    },
    {
      id: 11,
      category: 'account',
      question: 'Do I need an account to place an order?',
      answer: 'While you can checkout as a guest, creating an account allows you to track orders, save favorites, and enjoy faster checkout on future purchases.'
    },
    {
      id: 12,
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your email address, and follow the instructions in the reset email we send you.'
    }
  ];

  const toggleFAQ = (id) => {
    setOpenFAQs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="faq-page">
      {/* Hero Section */}
      <section className="faq-hero">
        <div className="container">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about our products and services</p>
        </div>
      </section>

      <div className="container">
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="faq-content">
          {/* Categories */}
          <div className="categories-sidebar">
            <h3>Categories</h3>
            <div className="category-list">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ List */}
          <div className="faq-list">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map(faq => (
                <div key={faq.id} className="faq-item">
                  <button
                    className="faq-question"
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <span>{faq.question}</span>
                    {openFAQs[faq.id] ? <FaMinus /> : <FaPlus />}
                  </button>
                  <div className={`faq-answer ${openFAQs[faq.id] ? 'open' : ''}`}>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <h3>No questions found</h3>
                <p>Try adjusting your search or browse different categories</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="contact-cta">
          <h3>Still have questions?</h3>
          <p>Can't find what you're looking for? Our customer support team is here to help.</p>
          <div className="cta-buttons">
            <a href="/contact" className="btn btn-primary">Contact Us</a>
            <a href="mailto:support@sportfitwomen.com" className="btn btn-outline">Email Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
